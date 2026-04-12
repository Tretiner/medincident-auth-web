import { redirect } from "next/navigation";
import { auth, signOut } from "@/services/zitadel/user/auth";
import { searchUserSessions } from "./api";
import { getAllSessionCookieIds } from "./cookies";
import { zitadelApi } from "./api/client";

/**
 * Возвращает список активных Zitadel-сессий пользователя — отфильтровывает
 * "пустышки" без подтверждённого user-factor (Zitadel может вернуть протухшие).
 */
async function listActiveZitadelSessions(userId: string): Promise<any[] | null> {
  const res = await searchUserSessions(userId);
  if (!res.success) {
    console.error("[auth:listActiveZitadelSessions] Ошибка поиска сессий:", res.error);
    return null;
  }
  const sessions = res.data?.sessions || [];
  return sessions.filter((s: any) => s?.factors?.user?.id);
}

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

  const zitadelUserId = (session as any)?.zitadelUserId as string | undefined;
  if (zitadelUserId) {
    console.log("[auth:getUserId] zitadelUserId=%s", zitadelUserId);
    return zitadelUserId;
  }

  console.log("[auth:getUserId] zitadelUserId не найден в сессии");
  return null;
}

/**
 * Находит текущий sessionId среди уже полученного списка Zitadel-сессий —
 * по пересечению с `sessions` cookie этого браузера.
 */
async function pickCurrentSessionFromList(
  zitadelSessions: any[]
): Promise<{ sessionId: string; sessionData: any } | null> {
  const cookieIds = await getAllSessionCookieIds();
  const cookieIdSet = new Set(cookieIds);

  const match = zitadelSessions.find((s: any) => cookieIdSet.has(s.id));
  if (!match) {
    console.log("[auth:pickCurrentSessionFromList] Нет пересечения между Zitadel сессиями и куками браузера",
      { zitadelIds: zitadelSessions.map((s: any) => s.id), cookieIds });
    return null;
  }
  return { sessionId: match.id, sessionData: match };
}

/**
 * Если в Zitadel у пользователя нет ни одной активной сессии — NextAuth держать
 * нельзя: профильные страницы должны жить только пока жива хоть одна сессия в Zitadel.
 * Завершаем NextAuth и редиректим на /login. signOut() и redirect() оба бросают
 * NEXT_REDIRECT — поэтому функция в норме никогда не возвращается, но TS не умеет
 * сужать control flow после `await Promise<never>` (microsoft/TypeScript#34955),
 * поэтому в caller всегда стоит `throw new Error("unreachable")` после вызова.
 */
async function killNextAuthAndRedirect(reason: string): Promise<never> {
  console.warn("[auth:killNextAuth] %s — завершаем NextAuth", reason);
  await signOut({ redirectTo: "/login" });
  redirect("/login");
}

export async function getOptionalSession(): Promise<{
  currentSessionId: string;
  userId: string;
  sessionData: any;
} | null> {
  const userId = await getUserIdFromNextAuth();
  if (!userId) return null;

  const zitadelSessions = await listActiveZitadelSessions(userId);
  if (!zitadelSessions || zitadelSessions.length === 0) return null;

  const result = await pickCurrentSessionFromList(zitadelSessions);
  if (!result) return null;

  console.log("[auth:getOptionalSession] userId=%s, sessionId=%s", userId, result.sessionId);
  return {
    currentSessionId: result.sessionId,
    userId,
    sessionData: result.sessionData,
  };
}

export async function requireValidSession(): Promise<{
  currentSessionId: string;
  userId: string;
  sessionData: any;
}> {
  const userId = await getUserIdFromNextAuth();
  if (!userId) {
    console.log("[auth:requireValidSession] Нет NextAuth сессии, редирект на /");
    redirect("/");
  }

  // Получаем активные Zitadel-сессии этого пользователя
  const zitadelSessions = await listActiveZitadelSessions(userId);

  // Сетевая ошибка / Zitadel недоступен — не можем подтвердить, выкидываем
  if (zitadelSessions === null) {
    await killNextAuthAndRedirect(
      `Не удалось получить сессии Zitadel для userId=${userId}`
    );
    throw new Error("unreachable");
  }

  // У пользователя нет ни одной активной сессии в Zitadel — NextAuth жить не должен
  if (zitadelSessions.length === 0) {
    await killNextAuthAndRedirect(
      `Нет активных Zitadel-сессий для userId=${userId}`
    );
    throw new Error("unreachable");
  }

  // Сматчим с sessions cookie этого браузера. Если пересечения нет —
  // в этом браузере нет валидной сессии, выкидываем.
  const matched = await pickCurrentSessionFromList(zitadelSessions);
  if (!matched) {
    await killNextAuthAndRedirect(
      `Sessions cookie не пересекается с Zitadel для userId=${userId}`
    );
    throw new Error("unreachable");
  }

  // Дополнительно валидируем найденную сессию через Zitadel API
  let sessionData: any;
  try {
    const res = await zitadelApi.get(`/v2/sessions/${matched.sessionId}`);
    sessionData = res.data?.session;
  } catch (error) {
    console.error("[auth:requireValidSession] Ошибка валидации сессии в Zitadel:", error);
    await killNextAuthAndRedirect(
      `Ошибка валидации сессии sessionId=${matched.sessionId}`
    );
    throw new Error("unreachable");
  }

  if (!sessionData?.factors?.user?.id) {
    await killNextAuthAndRedirect(
      `Сессия невалидна (нет user factors), sessionId=${matched.sessionId}`
    );
    throw new Error("unreachable");
  }

  console.log("[auth:requireValidSession] OK userId=%s, sessionId=%s", userId, matched.sessionId);
  return {
    currentSessionId: matched.sessionId,
    userId,
    sessionData,
  };
}
