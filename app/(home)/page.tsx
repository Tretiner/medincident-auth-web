import { redirect } from "next/navigation";
import { getMostRecentSessionCookie } from "@/services/zitadel/cookies";
import { AccountSelectionView, AccountDisplayItem } from "./_components/account-selection-view";
import { Suspense } from "react";
import { getUserById, getAuthRequest } from "@/services/zitadel/api";
import { syncSessionCookies } from "@/services/zitadel/sync-sessions";
import { Skeleton } from "@/shared/ui/skeleton";

async function AccountList({ requestId }: { requestId: string }) {
  const syncedSessions = await syncSessionCookies();

  const validSessions = syncedSessions.filter(
    ({ cookie, zitadel }) => cookie.token && zitadel?.factors?.user
  );

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
    <AccountSelectionView
      accounts={displayAccounts}
      requestId={requestId}
      defaultSelectedId={currentAccount?.cookie.id}
      addAccountLink={`/login?requestId=${requestId}&newAccount=true`}
      localContinueLink="/profile"
    />
  );
}

function AccountListSkeleton() {
  return (
    <div className="w-full max-w-md space-y-4 p-6">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg mt-4" />
    </div>
  );
}

export default async function AccountSelectionPage({searchParams}: {searchParams: any;}) {
  const resolvedSearchParams = await searchParams;

  const requestId = resolvedSearchParams.requestId || resolvedSearchParams.authRequest;

  if (!requestId) {
    redirect("/profile");
  }

  // Проверяем что requestId валиден (не протух, не подделан)
  const authReqResult = await getAuthRequest(requestId);
  if (!authReqResult.success) {
    console.log("[account-selection] Невалидный requestId=%s, редирект на /login", requestId);
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
      <Suspense fallback={<AccountListSkeleton />}>
        <AccountList requestId={requestId} />
      </Suspense>
    </div>
  );
}
