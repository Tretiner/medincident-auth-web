// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { searchSessions } from "@/lib/zitadel/zitadel-api";
import { AccountSelectionView } from "./_components/account-selection-view";
import { QuickLoginPrompt } from "./_components/quick-login-prompt";

export default async function AccountSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;

  const cookieStore = await cookies();
  const knownSessionsCookie = cookieStore.get("sessions")?.value;
  const currentSessionId = cookieStore.get("zitadel_current_session")?.value;

  let knownSessions: Array<{ id: string; token: string }> = [];
  try {
    if (knownSessionsCookie) knownSessions = JSON.parse(knownSessionsCookie);
  } catch (e) {}

  // Если локальных сессий нет — отправляем на форму входа
  if (knownSessions.length === 0) {
    redirect(`/login${requestId ? `?requestId=${requestId}` : ""}`);
  }

  // Запрашиваем актуальный статус в ZITADEL
  const sessionIds = knownSessions.map((s) => s.id);
  const response = await searchSessions(sessionIds);
  const activeSessions = response.success ? response.data?.sessions || [] : [];

  // Фильтруем только живые сессии
  const validSessions = activeSessions
    .filter((session) => session.factors?.user)
    .map((session) => {
      const localSession = knownSessions.find((s) => s.id === session.id);
      return {
        id: session.id,
        token: localSession?.token as string,
        user: session.factors?.user,
      };
    })
    .filter((s) => s.token);

  if (validSessions.length === 0) {
    redirect(`/login/new${requestId ? `?requestId=${requestId}` : ""}`);
  }

  // Проверяем, жива ли "текущая" (последняя выбранная) сессия
  const currentSession = validSessions.find((s) => s.id === currentSessionId);

  // === СЦЕНАРИЙ БЕЗ AUTH REQUEST (Локальный профиль) ===
  if (!requestId) {
    if (currentSession) {
      // Если есть валидная текущая сессия - сразу пускаем в профиль!
      redirect("/profile");
    }
    // Если сессий много, но ни одна не выбрана как "текущая" - показываем список
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
        <AccountSelectionView sessions={validSessions} />
      </div>
    );
  }

  // === СЦЕНАРИЙ С AUTH REQUEST (OIDC Flow) ===
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
      {currentSession ? (
        // Показываем: "Продолжить как Иван?"
        <QuickLoginPrompt 
          currentSession={currentSession} 
          sessions={validSessions} 
          requestId={requestId} 
        />
      ) : (
        // Показываем весь список
        <AccountSelectionView sessions={validSessions} requestId={requestId} />
      )}
    </div>
  );
}