import { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { consentUrlParamsSchema } from "@/domain/consent/schema";
import { ConsentPage } from "./consent-page";

export const metadata: Metadata = {
  title: "Авторизация доступа",
  description: "Разрешение доступа стороннему приложению",
};

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const parseResult = consentUrlParamsSchema.safeParse(resolvedParams);

  if (!parseResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
         <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
            <h1 className="font-bold text-lg mb-2">Неверный запрос</h1>
            <p className="text-sm">Отсутствуют обязательные параметры.</p>
         </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-muted/30">
      <Suspense 
        fallback={<Loader2 className="w-10 h-10 text-primary animate-spin" />}
      >
        <ConsentPage params={parseResult.data} />
      </Suspense>
    </main>
  );
}