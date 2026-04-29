import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default async function CallbackFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string; requestId?: string }>;
}) {
  const { error, error_description, requestId } = await searchParams;

  const loginHref = requestId ? `/login?requestId=${requestId}` : "/login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Ошибка авторизации</h1>
          <p className="text-muted-foreground">
            Не удалось войти через внешний провайдер.
          </p>
        </div>

        {(error || error_description) && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left space-y-1">
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            {error_description && (
              <p className="text-sm text-destructive/80">{error_description}</p>
            )}
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={loginHref}>Вернуться к входу</Link>
        </Button>
      </div>
    </div>
  );
}
