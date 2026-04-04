import { redirect } from "next/navigation";
import { getQrEntry } from "@/services/zitadel/qr-store";
import { getOptionalSession } from "@/services/zitadel/session";
import { QrConfirmForm } from "./_components/qr-confirm-form";
import { AppLogoIcon } from "@/components/icons";

interface Props {
  searchParams: Promise<{ user_code?: string }>;
}

export default async function QrConfirmPage({ searchParams }: Props) {
  const { user_code } = await searchParams;

  if (!user_code) {
    redirect("/login");
  }

  const entry = getQrEntry(user_code);
  if (!entry || entry.status !== "pending") {
    redirect("/login?error=qr_expired");
  }

  const session = await getOptionalSession();
  if (!session) {
    const returnTo = encodeURIComponent(`/login/qr-confirm?user_code=${user_code}`);
    redirect(`/login?returnTo=${returnTo}`);
  }

  const displayName =
    session.sessionData?.factors?.user?.displayName ||
    session.sessionData?.factors?.user?.loginName ||
    "Пользователь";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <AppLogoIcon className="h-10 w-10" />

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Вход с другого устройства
          </h1>
          <p className="text-sm text-muted-foreground">
            Подтвердите доступ для нового устройства
          </p>
        </div>

        <QrConfirmForm userCode={user_code} displayName={displayName} />
      </div>
    </div>
  );
}
