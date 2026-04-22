import { redirect } from "next/navigation";
import { auth, signOut } from "@/services/zitadel/user/auth";
import { searchUserSessions } from "./api";
import { getAllSessionCookieIds } from "./cookies";
import { env } from "@/shared/config/env";

/**
 * Извлекает Zitadel userId из NextAuth сессии.
 * Использует session.zitadelUserId (числовой ID, напр. "367070315047550982"),
 * который сохраняется из account.providerAccountId при первичном логине.
 *
 * НЕ использует token.sub (это UUID из OIDC, а не Zitadel user ID).
 * НЕ декодирует accessToken (Zitadel выдаёт opaque token, не JWT).
 */
export async function getUserIdFromNextAuth(): Promise<string | null> {
  const session = await auth();
  if (!session) {
    console.log("[auth:getUserId] NextAuth сессия отсутствует");
    return null;
  }
  if ((session as { error?: unknown }).error) {
    // back-channel logout / refresh failure — сессия числится как невалидная
    return null;
  }

  const zitadelUserId = (session as { zitadelUserId?: string }).zitadelUserId;
  if (zitadelUserId) return zitadelUserId;

  return null;
}

/**
 * Реактивная проверка «жива ли OIDC-сессия в Zitadel» — один вызов
 * {ZITADEL_API_URL}/oidc/v1/userinfo с access_token из NextAuth.
 *
 * 200 — сессия валидна.
 * 401/403 — токен/сессия отозваны; нужно разлогинить.
 *
 * Это дешевле и каноничнее связки list-sessions + get-session, и работает
 * даже если OIDC-сессия закрыта другим клиентом — Zitadel сам помечает
 * все производные токены как недействительные.
 *   docs: https://zitadel.com/blog/session-timeouts-logouts
 */
async function isOidcSessionAlive(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${env.ZITADEL_API_URL}/oidc/v1/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.error("[auth:isOidcSessionAlive] userinfo запрос упал:", err);
    return false;
  }
}

/**
 * Пикает текущий sessionId из куков браузера.
 *
 * Обычно у пользователя один cookie-id — возвращаем сразу. Если больше
 * одного (несколько аккаунтов в одном браузере) — выбираем тот, что реально
 * принадлежит этому userId: дергаем список активных сессий в Zitadel через
 * машинный токен (без OIDC-сессии, без warn'ов) и пересекаем с куками.
 */
async function pickCurrentSessionId(userId: string): Promise<string | null> {
  const cookieIds = await getAllSessionCookieIds();
  if (cookieIds.length === 0) return null;
  if (cookieIds.length === 1) return cookieIds[0]!;

  const res = await searchUserSessions(userId);
  if (!res.success) return null;

  const userSessionIds = new Set(
    (res.data?.sessions ?? [])
      .filter((s: { factors?: { user?: { id?: unknown } } }) => s?.factors?.user?.id)
      .map((s: { id?: string }) => s.id)
      .filter((id): id is string => typeof id === "string"),
  );

  return cookieIds.find((id) => userSessionIds.has(id)) ?? null;
}

/**
 * Завершает NextAuth-сессию и редиректит на /login. signOut и redirect оба
 * бросают NEXT_REDIRECT, поэтому функция в норме никогда не возвращается.
 */
async function killNextAuthAndRedirect(reason: string): Promise<never> {
  console.warn("[auth:killNextAuth] %s — завершаем NextAuth", reason);
  await signOut({ redirectTo: "/login" });
  redirect("/login");
}

export interface ValidSession {
  currentSessionId: string;
  userId: string;
}

/**
 * Возвращает валидную сессию или null — ничего не рушит. Для route
 * handler'ов, где 401-ответ осмысленнее редиректа.
 */
export async function getOptionalSession(): Promise<ValidSession | null> {
  const session = await auth();
  if (!session || (session as { error?: unknown }).error) return null;

  const userId = (session as { zitadelUserId?: string }).zitadelUserId;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!userId || !accessToken) return null;

  if (!(await isOidcSessionAlive(accessToken))) return null;

  const currentSessionId = await pickCurrentSessionId(userId);
  if (!currentSessionId) return null;

  return { currentSessionId, userId };
}

/**
 * Жёсткая проверка для server actions / layout'ов — при любой проблеме
 * сносит NextAuth и редиректит на /login. В норме возвращает {userId,
 * currentSessionId}.
 */
export async function requireValidSession(): Promise<ValidSession> {
  const session = await auth();
  if (!session) {
    console.log("[auth:requireValidSession] Нет NextAuth сессии, редирект на /");
    redirect("/");
  }

  if ((session as { error?: unknown }).error) {
    await killNextAuthAndRedirect(
      `NextAuth session.error=${String((session as { error?: unknown }).error)}`,
    );
    throw new Error("unreachable");
  }

  const userId = (session as { zitadelUserId?: string }).zitadelUserId;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!userId || !accessToken) {
    await killNextAuthAndRedirect("NextAuth session без zitadelUserId/accessToken");
    throw new Error("unreachable");
  }

  if (!(await isOidcSessionAlive(accessToken))) {
    await killNextAuthAndRedirect(
      `Zitadel userinfo отказал — OIDC-сессия мертва (userId=${userId})`,
    );
    throw new Error("unreachable");
  }

  const currentSessionId = await pickCurrentSessionId(userId);
  if (!currentSessionId) {
    await killNextAuthAndRedirect(
      `Не удалось сопоставить browser cookie с активной сессией Zitadel (userId=${userId})`,
    );
    throw new Error("unreachable");
  }

  return { currentSessionId, userId };
}
