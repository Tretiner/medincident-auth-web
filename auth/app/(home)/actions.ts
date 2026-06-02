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

  const validSessions = syncedSessions.filter(
    ({ cookie, zitadel }) => cookie.token && zitadel?.factors?.user
  );

  const mostRecent = await getMostRecentSessionCookie();
  const defaultSelectedId = validSessions.find(({ cookie }) => cookie.id === mostRecent?.id)?.cookie.id;

  const displayAccountsRaw = await Promise.all(
    validSessions.map(async ({ cookie, zitadel }) => {
      const userId = zitadel?.factors?.user?.id;
      if (!userId) return null;

      try {
        const userResult = await getUserById(userId);
        if (!userResult.success || !userResult.data.user) return null;

        const userData = userResult.data.user;
        const human = userData.human;
        const givenName = human?.profile?.givenName ?? "";
        const familyName = human?.profile?.familyName ?? "";
        const fullName =
          `${givenName} ${familyName}`.trim() || human?.profile?.displayName || "Пользователь";
        const initials =
          `${givenName[0] ?? ""}${familyName[0] ?? ""}`.toUpperCase() ||
          fullName.substring(0, 2).toUpperCase();

        return {
          id: cookie.id,
          token: cookie.token,
          title: fullName,
          subtitle: userData.preferredLoginName || human?.username || "",
          avatarUrl: human?.profile?.avatarUrl || "",
          initials,
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
