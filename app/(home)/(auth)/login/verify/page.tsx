import { redirect } from "next/navigation";
import { AppLogoIcon } from "@/components/icons";
import { getRegFlowCookie } from "../_lib/reg-flow";
import { VerifyForm } from "./_components/verify-form";
import { verifyEmailAction } from "./actions";
import { resendEmailVerification } from "@/services/zitadel/api";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const { requestId } = await searchParams;
  const flow = await getRegFlowCookie();

  if (!flow?.userId) {
    redirect("/login");
  }

  const userId = flow.userId;

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
          email={flow.email}
        />
      </div>
    </div>
  );
}
