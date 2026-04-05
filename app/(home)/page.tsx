import { redirect } from "next/navigation";
import { getMostRecentSessionCookie } from "@/services/zitadel/cookies";
import { AccountSelectionView, AccountDisplayItem } from "./_components/account-selection-view";
import { Suspense } from "react";
import { getUserById } from "@/services/zitadel/api";
import { syncSessionCookies } from "@/services/zitadel/sync-sessions";

export default async function AccountSelectionPage({searchParams}: {searchParams: any;}) {
  const resolvedSearchParams = await searchParams;

  const requestId = resolvedSearchParams.requestId || resolvedSearchParams.authRequest;

  if (!requestId) {
    redirect("/profile");
  }

  const loginLink = `/login?requestId=${requestId}`;
  const addAccountLink = `/login?requestId=${requestId}&newAccount=true`;

  // Очищаем мёртвые куки, получаем живые сессии одним запросом к Zitadel
  const syncedSessions = await syncSessionCookies();

  const validSessions = syncedSessions.filter(
    ({ cookie, zitadel }) => cookie.token && zitadel?.factors?.user
  );

  // if (validSessions.length === 0) {
  //   redirect(loginLink);
  // }

  const mostRecent = await getMostRecentSessionCookie();
  const currentAccount = validSessions.find(({ cookie }) => cookie.id === mostRecent?.id);

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
        };
      } catch {
        return null;
      }
    })
  );

  const displayAccounts = displayAccountsRaw.filter(Boolean) as AccountDisplayItem[];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
      <Suspense>
        <AccountSelectionView
          accounts={displayAccounts}
          requestId={requestId}
          defaultSelectedId={currentAccount?.cookie.id}
          addAccountLink={addAccountLink}
          localContinueLink="/profile"
        />
      </Suspense>
    </div>
  );
}
