// app/page.tsx
import { cookies } from "next/headers";
import { searchSessions } from "@/lib/zitadel/zitadel-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AccountSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;
  
  const cookieStore = await cookies();
  const knownSessionsCookie = cookieStore.get("zitadel_session")?.value;
  
  let knownSessionIds: string[] = [];
  try {
    if (knownSessionsCookie) {
      knownSessionIds = [JSON.parse(knownSessionsCookie)];
    }
  } catch (e) {
    console.error("Ошибка парсинга куки сессий", e);
  }

  // 2. Идем в ZITADEL за деталями сессий
  const response = await searchSessions(knownSessionIds);
  const activeSessions = response.success ? (response.data?.sessions || []) : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50 font-sans">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="border-b border-border bg-card pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Выберите аккаунт
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Для перехода в приложение
          </p>
        </CardHeader>
        
        <CardContent className="p-0 bg-secondary/10">
          <div className="flex flex-col">
            
            {/* СПИСОК СЕССИЙ */}
            {activeSessions.length > 0 ? (
              <div className="divide-y divide-border">
                {activeSessions.map((session) => {
                  const user = session.factors?.user;
                  const displayName = user?.displayName || "Пользователь";
                  const loginName = user?.loginName || "Неизвестный email";
                  const initial = displayName[0]?.toUpperCase() || "?";

                  return (
                    // При клике мы отправляем пользователя на эндпоинт завершения флоу 
                    // с выбранной сессией
                    <form 
                      key={session.id} 
                      action={`/api/auth/select-account`} 
                      className="w-full"
                    >
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="requestId" value={requestId || ""} />
                      
                      <button 
                        type="submit" 
                        className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{displayName}</p>
                          <p className="text-sm text-muted-foreground truncate">{loginName}</p>
                        </div>
                      </button>
                    </form>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Нет активных сессий на этом устройстве.
              </div>
            )}

            {/* ДОБАВИТЬ АККАУНТ */}
            <div className="p-4 border-t border-border bg-card">
              {/* Ссылка на вашу страницу с кнопками (Telegram и т.д.) */}
              <Link href={`/login/new${requestId ? `?requestId=${requestId}` : ''}`}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <span className="text-lg">+</span> Сменить / Добавить аккаунт
                </Button>
              </Link>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}