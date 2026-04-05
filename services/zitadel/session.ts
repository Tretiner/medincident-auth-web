import { redirect } from "next/navigation";
import { auth } from "@/services/zitadel/user/auth";
import { searchUserSessions } from "./api";
import { getAllSessionCookieIds } from "./cookies";
import { zitadelApi } from "./api/client";

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
 * Находит текущий sessionId: ищет пересечение между сессиями пользователя
 * в Zitadel и session IDs в `sessions` cookie этого браузера.
 */
async function findCurrentSessionId(userId: string): Promise<{
  sessionId: string;
  sessionData: any;
} | null> {
  const [userSessionsRes, cookieIds] = await Promise.all([
    searchUserSessions(userId),
    getAllSessionCookieIds(),
  ]);

  if (!userSessionsRes.success) {
    console.error("[auth:findCurrentSessionId] Ошибка поиска сессий в Zitadel:", userSessionsRes.error);
    return null;
  }

  const zitadelSessions: any[] = userSessionsRes.data?.sessions || [];
  const cookieIdSet = new Set(cookieIds);

  // Ищем сессию, которая есть и в Zitadel, и в куке этого браузера
  const match = zitadelSessions.find((s: any) => cookieIdSet.has(s.id));

  if (!match) {
    console.log("[auth:findCurrentSessionId] Нет пересечения между Zitadel сессиями и куками браузера",
      { zitadelIds: zitadelSessions.map((s: any) => s.id), cookieIds });
    return null;
  }

  return { sessionId: match.id, sessionData: match };
}

export async function getOptionalSession(): Promise<{
  currentSessionId: string;
  userId: string;
  sessionData: any;
} | null> {
  const userId = await getUserIdFromNextAuth();
  if (!userId) return null;

  const result = await findCurrentSessionId(userId);
  if (!result) return null;

  console.log("[auth:getOptionalSession] userId=%s, sessionId=%s", userId, result.sessionId);
  return {
    currentSessionId: result.sessionId,
    userId,
    sessionData: result.sessionData,
  };
}

export async function requireValidSession() {
  const userId = await getUserIdFromNextAuth();
  if (!userId) {
    console.log("[auth:requireValidSession] Нет NextAuth сессии, редирект на /");
    redirect("/");
  }

  const result = await findCurrentSessionId(userId);

  if (!result) {
    console.log("[auth:requireValidSession] Не найдена активная Zitadel сессия для userId=%s", userId);
    redirect("/");
  }

  // Дополнительно валидируем сессию через Zitadel API
  try {
    const res = await zitadelApi.get(`/v2/sessions/${result.sessionId}`);
    const sessionData = res.data?.session;

    if (!sessionData?.factors?.user?.id) {
      console.error("[auth:requireValidSession] Сессия невалидна (нет user factors), sessionId=%s", result.sessionId);
      redirect("/");
    }

    console.log("[auth:requireValidSession] OK userId=%s, sessionId=%s", userId, result.sessionId);
    return {
      currentSessionId: result.sessionId,
      userId,
      sessionData,
    };
  } catch (error) {
    console.error("[auth:requireValidSession] Ошибка валидации сессии в Zitadel:", error);
    redirect("/");
  }
}
