"use server";

import { getAllSessions, getMostRecentSessionCookie } from "@/services/zitadel/cookies";
import { syncSessionCookies } from "@/services/zitadel/sync-sessions";
import { getUserById } from "@/services/zitadel/api";

export interface AccountDisplayItem {
  id: string;
  token: string;
  title: string;
  subtitle: string;
  avatarUrl?: string;
  initials: string;
}

export async function loadSessionsAction(): Promise<{
  accounts: AccountDisplayItem[];
  removedCount: number;
  defaultSelectedId: string | undefined;
}> {
  // Считаем сессии до синхронизации, чтобы вычислить removedCount
  const sessionsBefore = await getAllSessions(true);
  const countBefore = sessionsBefore.length;

  // Синхронизация с Zitadel — удаляет мёртвые сессии из cookie
  const syncedSessions = await syncSessionCookies();
  const removedCount = countBefore - syncedSessions.length;

  // Фильтруем валидные сессии
  const validSessions = syncedSessions.filter(
    ({ cookie, zitadel }) => cookie.token && zitadel?.factors?.user
  );

  // Определяем дефолтный выбор
  const mostRecent = await getMostRecentSessionCookie();
  const defaultSelectedId = validSessions.find(({ cookie }) => cookie.id === mostRecent?.id)?.cookie.id;

  // Обогащаем данными пользователей
  const displayAccountsRaw = await Promise.all(
    validSessions.map(async ({ cookie, zitadel }) => {
      const userId = zitadel?.factors?.user?.id;
      if (!userId) return null;

      try {
        const userResult = await getUserById(userId);
        if (!userResult.success || !userResult.data.user) return null;

        const userData = userResult.data.user;
        const human = userData.human;
        const displayName = human?.profile?.displayName || human?.profile?.givenName || "Пользователь";

        return {
          id: cookie.id,
          token: cookie.token,
          title: displayName,
          subtitle: userData.preferredLoginName || human?.username || "",
          avatarUrl: human?.profile?.avatarUrl || "",
          initials: displayName.substring(0, 2).toUpperCase(),
        } satisfies AccountDisplayItem;
      } catch {
        return null;
      }
    })
  );

  return {
    accounts: displayAccountsRaw.filter(Boolean) as AccountDisplayItem[],
    removedCount,
    defaultSelectedId,
  };
}
