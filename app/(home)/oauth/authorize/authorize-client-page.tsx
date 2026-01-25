"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import type { CheckConsentResponse } from "@/domain/consent/schema";
import { consentUrlParamsSchema } from "@/domain/consent/schema";
import { fetchConsent } from "@/lib/services/server-http-client"; 

export function OAuthAuthorizeClientPage() {
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentData, setConsentData] = useState<CheckConsentResponse | null>(null);

  const [resolvedParams, setResolvedParams] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // 1. Собираем параметры из URL
        const paramsObj: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          paramsObj[key] = value;
        });
        
        if (mounted) setResolvedParams(paramsObj);

        // 2. Валидируем их схемой (Zod)
        const parsed = consentUrlParamsSchema.safeParse(paramsObj);

        if (!parsed.success) {
          throw new Error("Некорректные параметры запроса (client_id, redirect_uri...)");
        }

        const { client_id, redirect_uri, scope } = parsed.data;
        const scopesArray = scope ? scope.split(/[\s,]+/).filter(Boolean) : [];

        // 3. Вызываем API напрямую (обычный вызов)
        const result = await fetchConsent(client_id, scopesArray, redirect_uri);

        if (!mounted) return;

        if (!result.success) {
          setError(result.error.message || "Ошибка при проверке приложения");
        } else {
          const data = result.data;
          if (!data.valid) {
            setError(`Приложение "${data.name || client_id}" недоступно или заблокировано.`);
          } else {
            setConsentData(data);
          }
        }
      } catch (e: any) {
        if (mounted) setError(e.message || "Произошла непредвиденная ошибка");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [searchParams]);

  // --- RENDERS ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorScreen title="Ошибка авторизации" message={error} />;
  }

  if (!consentData) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-muted/30">
      <AuthorizeView 
        searchParams={resolvedParams} 
        consentData={consentData}
      />
    </main>
  );
}

function ErrorScreen({ title, message }: { title: string; message: string }) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 max-w-md text-center animate-in fade-in zoom-in-95">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h1 className="font-bold text-lg mb-2">{title}</h1>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    );
}