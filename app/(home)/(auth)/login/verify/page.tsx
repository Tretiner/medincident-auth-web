import { redirect } from "next/navigation";
import { AppLogoIcon } from "@/components/icons";
import { getRegFlowCookie } from "../_lib/reg-flow";
import { VerifyForm } from "./_components/verify-form";
import { verifyEmailAction } from "./actions";
import { resendEmailVerification } from "@/services/zitadel/api";
import { getCurrentSessionId } from "@/services/zitadel/current-session";
import { zitadelApi } from "@/services/zitadel/api/client";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  await searchParams;
  const flow = await getRegFlowCookie();

  let userId: string;
  let email: string;

  if (flow?.userId) {
    // Путь регистрации (email или IDP) — данные уже в куке
    userId = flow.userId;
    email = flow.email;
  } else {
    // Путь из профиля — читаем текущую сессию напрямую
    const sessionId = await getCurrentSessionId();
    if (!sessionId) redirect("/login");

    let sessionData: any;
    try {
      const res = await zitadelApi.get(`/v2/sessions/${sessionId}`);
      sessionData = res.data?.session;
    } catch {
      redirect("/login");
    }

    const uid: string | undefined = sessionData?.factors?.user?.id;
    if (!uid) redirect("/login");

    userId = uid;
    email = sessionData?.factors?.user?.loginName ?? "";

    // Server Component может вызывать API — отправляем код здесь
    await resendEmailVerification(userId);
  }

  async function resendAction() {
    "use server";
    await resendEmailVerification(userId);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 p-4 bg-background font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary border border-primary/20">
            <AppLogoIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Подтвердите email</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Введите код из письма
          </p>
        </div>

        <VerifyForm
          action={verifyEmailAction}
          resendAction={resendAction}
          email={email}
        />
      </div>
    </div>
  );
}
