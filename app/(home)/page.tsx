import { redirect } from "next/navigation";
import { getAllSessions } from "@/lib/zitadel/zitadel-cookies";
import { getCurrentSessionId } from "@/lib/zitadel/zitadel-current-session";
import { AccountSelectionView, AccountDisplayItem } from "./_components/account-selection-view";
import { Suspense } from "react";
import { getUserById, searchSessions } from "@/lib/zitadel/api";

export default async function AccountSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;

  const loginLink = `/login${requestId ? `?requestId=${requestId}` : ""}`;
  const localContinueLink = `/profile`;

  const knownSessions = await getAllSessions(true);

  if (!knownSessions || knownSessions.length === 0) {
  console.log('CUSTOM-UI: REDIRECT NO KNOWN SESSIONS: %s', JSON.stringify(knownSessions))
    redirect(loginLink);
  }

  const response = await searchSessions(knownSessions.map((s) => s.id));
  console.log('RESPONSE SESSIONS: %s', JSON.stringify(response))
  const activeSessions = response.success ? response.data?.sessions || [] : [];

  const validActiveSessions = activeSessions.filter((session) => {
    const localSession = knownSessions.find((s) => s.id === session.id);
    return localSession?.token && session.factors?.user;
});

  if (validActiveSessions.length === 0) {
  console.log('CUSTOM-UI: REDIRECT NO VALID SESSIONS: %s', JSON.stringify(activeSessions))
    redirect(loginLink);
  }
  
  // Если локальный вход и уже есть текущая сессия
  const currentSessionId = await getCurrentSessionId();
  const currentAccount = validActiveSessions.find((a) => a.id === currentSessionId);
  if (!requestId && currentAccount) {
    redirect(localContinueLink);
  }

  // === МАППИНГ БЕКЕНД-МОДЕЛЕЙ В UI-МОДЕЛИ ===
  const displayAccountsRaw = await Promise.all(
    validActiveSessions.map(async (session) => {
      const user = session?.factors?.user;
      const userId = user?.id;
      
      if (!userId) return null;

      // 1. Ищем локальную сессию для токена (ты забыл эту строку)
      const localSession = knownSessions.find((s) => s.id === session.id);

      try {
        // Делаем запрос за пользователем
        const userResult = await getUserById(userId);
        if (!userResult.success || !userResult.data.user) return null;
        
        const userData = userResult.data.user;
        const human = userData.human;

        const displayName = human?.profile?.displayName || human?.profile?.givenName || "Пользователь";

        return {
          id: session.id,
          token: localSession?.token as string,
          title: displayName,
          subtitle: userData.preferredLoginName || human?.username || "", 
          avatarUrl: human?.profile?.avatarUrl || "",
          initials: displayName.substring(0, 2).toUpperCase(),
        };
      } catch (error) {
        console.error(`Ошибка получения данных юзера ${userId}:`, error);
        return null; // Возвращаем null при ошибке сети, чтобы не сломать весь список
      }
    })
  );

  // 4. Очищаем массив от возможных null (если юзер не найден или произошла ошибка)
  const displayAccounts = displayAccountsRaw.filter(
    (acc) => acc !== null
  ) as AccountDisplayItem[];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
      <Suspense>
        <AccountSelectionView 
          accounts={displayAccounts} 
          requestId={requestId}
          defaultSelectedId={currentAccount?.id}
          addAccountLink={loginLink}
          localContinueLink={localContinueLink}
        />
      </Suspense>
    </div>
  );
}
