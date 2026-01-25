"use client";

import { Loader2 } from "lucide-react";
import { ConsentCard, ConsentErrorCard } from "./consent-card";
import { useConsentData } from "./oauth.hooks";
import { env } from "@/config/env";
import { useRouter } from "next/router";

interface ConsentPageProps {
  params: {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  };
}

export function ConsentPage({ params }: ConsentPageProps) {
  const router = useRouter();

  const scopesArray =
    params.scope ? params.scope.split(/[\s,]+/).filter(Boolean) : [];

  const { consentData, isLoading, error } = useConsentData(
    params.client_id,
    scopesArray,
    params.redirect_uri,
  );

  const url = new URL(params.redirect_uri);
  url.searchParams.set("error", "access_denied");
  if (params.state) url.searchParams.set("state", params.state);
  const denyUrl = url.toString();

  const allowUrl = `${env.NEXT_PUBLIC_AUTH_URL}/oauth/authorize?${params}`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Проверка приложения...</p>
      </div>
    );
  }

  if (error) {
    return <ConsentErrorCard title="Ошибка доступа" message={error} />;
  }

  if (!consentData) return null;

  return (
    <ConsentCard
      clientName={consentData.name}
      clientLogo={consentData.photoUrl || ""}
      hostname={consentData.hostname}
      scopes={consentData.scopes}
      isConsenting={false}
      onAllow={() => router.push(allowUrl)}
      onDeny={() => router.push(denyUrl)}
    />
  );
}
