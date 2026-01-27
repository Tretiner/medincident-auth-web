"use client";

import { Loader2 } from "lucide-react";
import { ConsentCard, ConsentErrorCard } from "./_components/consent-card";
import { createDenyUrlFromParams, useConsentData } from "./oauth.hooks";
import { env } from "@/config/env";
import { useRouter } from "next/navigation";

interface ConsentPageProps {
  params: {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state: string;
    code_challenge: string;
    code_challenge_method: string;
  };
}

export function ConsentPage({ params }: ConsentPageProps) {
  const router = useRouter();

  const scopesArray =
    params.scope ? params.scope.split(/[\s,]+/).filter(Boolean) : [];

  const denyUrl = createDenyUrlFromParams(params, "access_denied");

  const { consentData, isLoading, error } = useConsentData(
    params.client_id,
    scopesArray,
    params.redirect_uri,
    (errorType) => {
      // router.push(createDenyUrlFromParams(params, errorType));
    }
  );

  const allowUrl = `${env.NEXT_PUBLIC_AUTH_URL}/oauth/authorize?${new URLSearchParams(params).toString()}`;

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
