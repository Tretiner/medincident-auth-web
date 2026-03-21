import { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { consentUrlParamsSchema } from "@/domain/consent/schema";
import { ConsentPage } from "./consent-page";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Авторизация доступа",
  description: "Разрешение доступа стороннему приложению",
};

export default async function AuthorizeConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const parseResult = consentUrlParamsSchema.safeParse(resolvedParams);

  // https://auth.medincident.dreyn-drafts.ru/oauth/authorize?redirectUri=google.com&clientId=019beebb-b2cd-74e2-8a3a-932ee0594dbc&responseType=code&scopes=profile:read,profile:write&state=govno&codeChallenge=porno&codeChallengeMethod=S256

  if (!parseResult.success) {
    if (resolvedParams.redirect_uri){
      const url = new URL(resolvedParams.redirect_uri);
      url.searchParams.set("error", "access_denied");
      if (resolvedParams.state) url.searchParams.set("state", resolvedParams.state);
      const denyUrl = url.toString();
      redirect(denyUrl)
    } else {
      throw new Error("саси")
    }
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