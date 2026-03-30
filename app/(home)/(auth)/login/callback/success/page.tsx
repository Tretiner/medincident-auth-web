import { retrieveIdpIntent } from "@/services/zitadel/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { AuthFlowSelector } from "./_components/auth-flow-selector"; // Импортируем компонент с кнопками
import { redirect } from "next/navigation";

export default async function CallbackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; id?: string; token?: string; userId?: string; user?: string }>;
}) {
  const { requestId, id, token, userId: queryUserId, user } = await searchParams;
  const userId = queryUserId || user;

  if (!id || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-xl text-destructive font-bold">Ошибка: Отсутствуют id или token в URL</h1>
      </div>
    );
  }

  if (!userId) {
    redirect(`/login/register?id=${id}&token=${token}${requestId ? `&requestId=${requestId}` : ""}`);
  }

  const response = await retrieveIdpIntent(id, { idpIntentToken: token});

  console.log("Ответ от retrieveIdpIntent:", JSON.stringify(response));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans py-12">
      <Card className="w-full max-w-3xl shadow-lg border-border">
        <CardHeader className="border-b border-border bg-card pb-6">
          <CardTitle className="text-2xl font-bold text-primary">
            🎉 Успешная Авторизация
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Выберите, что сделать с полученными данными:
          </p>
        </CardHeader>
        
        <CardContent className="p-0 bg-secondary/30">
          {!response.success ? (
            <div className="p-6 text-destructive text-center">
              <h2 className="font-semibold text-lg mb-2">Ошибка при извлечении Intent</h2>
              <pre className="text-xs bg-destructive/10 p-4 rounded-md overflow-x-auto text-left">
                <code>{JSON.stringify(response.error, null, 2)}</code>
              </pre>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Показываем базовую информацию */}
              <div className="grid grid-cols-2 gap-4 p-6 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">ID Провайдера</p>
                  <p className="text-sm font-mono bg-background px-2 py-1 rounded border border-border inline-block">
                    {response.data?.idpInformation?.idpId || "Неизвестно"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Имя Пользователя</p>
                  <p className="text-sm font-medium">
                    {response.data?.idpInformation?.userName || "Не указано"}
                  </p>
                </div>
              </div>

              {/* БЛОК КНОПОК */}
              <div className="p-6">
                <AuthFlowSelector 
                  requestId={requestId}
                  intentId={id}
                  intentToken={token}
                  userId={userId} // Передаем userId из URL (если он есть)
                  idpInformation={response.data?.idpInformation}
                />
              </div>

              {/* Техническая информация под спойлером */}
              <details className="p-6 border-t border-border group">
                <summary className="text-xs text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer">
                  Показать RAW Information
                </summary>
                <pre className="mt-4 bg-background border border-border text-foreground text-xs p-4 rounded-lg overflow-x-auto shadow-inner">
                  <code>
                    {JSON.stringify(
                      response.data?.idpInformation?.rawInformation, 
                      null, 
                      2
                    )}
                  </code>
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}