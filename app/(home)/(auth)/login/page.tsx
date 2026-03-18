import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { AppLogoIcon } from "@/components/icons";
import { APP_NAME } from "@/lib/constants";
import { QrAuthSection } from "./_components/qr-auth-section";
import { Suspense } from "react";
import { ExternalIdentityProviders } from "./_components/social-links";
import { fetchProvidersAction } from "./actions";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

export default async function LoginPage({ searchParams }: { searchParams: any }) {
  const { requestId } = await searchParams;
  const providers = await fetchProvidersAction();

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className="w-full flex justify-center max-w-full">
        <Card className="w-full max-w-[960px] overflow-hidden rounded-xl shadow-none border border-border bg-card grid grid-cols-1 md:grid-cols-2 animate-in fade-in duration-500">
          {/* LEFT COLUMN */}
          <div className="hidden md:flex relative flex-col items-center justify-center text-center p-12 overflow-hidden border-r border-border bg-primary/5">
            <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-[40%] -right-[50%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <Suspense>
              <QrAuthSection />
            </Suspense>
          </div>

          {/* RIGHT COLUMN */}
          <CardContent className="p-6 sm:p-8 md:p-12 flex flex-col justify-center min-h-[450px] md:min-h-auto">
            <div className="flex flex-col items-center md:items-start mb-6 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 text-primary shadow-none border border-primary/20">
                <AppLogoIcon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center md:text-left">
                Вход в {APP_NAME}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base text-center md:text-left">
                Единый аккаунт для всех медицинских сервисов
              </p>
            </div>

            <div className="space-y-4 md:space-y-6 w-full">
              <div className="grid gap-2 md:gap-3">
                <ExternalIdentityProviders providers={providers} requestId={requestId} />
              </div>
            </div>

            <p className="mt-6 md:mt-8 text-center text-xs text-muted-foreground leading-relaxed px-2 md:px-0">
              Нажимая на кнопки входа, вы принимаете{" "}
              <a
                href="#"
                className="text-primary hover:underline font-medium transition-colors"
              >
                пользовательское соглашение
              </a>{" "}
              и{" "}
              <a
                href="#"
                className="text-primary hover:underline font-medium transition-colors"
              >
                политику конфиденциальности
              </a>{" "}
              сервиса {APP_NAME}.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
