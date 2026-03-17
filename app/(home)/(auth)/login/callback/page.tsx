import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; sessionToken?: string; authRequestId?: string }>;
}) {
  const { sessionId, sessionToken, authRequestId } = await searchParams;

  if (!sessionId || !sessionToken || !authRequestId) {
    return <div>Ошибка авторизации: неполные данные сессии.</div>;
  }

  // Привязываем созданную сессию к изначальному Auth Request
  const patchRes = await fetch(`http://zitadel-api:8080/v2/oidc/auth_requests/${authRequestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session: {
        sessionId: sessionId,
        sessionToken: sessionToken,
      },
    }),
  });

  const patchData = await patchRes.json();

  // Если все прошло успешно, ZITADEL скажет, куда вернуть юзера (в целевое приложение)
  if (patchData.redirectUrl) {
    redirect(patchData.redirectUrl);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p>Завершение входа...</p>
    </div>
  );
}