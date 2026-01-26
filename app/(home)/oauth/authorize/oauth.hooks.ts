"use client";

import useSWR from "swr";
import { fetchConsent, fetchConsentMock } from "@/lib/services/server-http-client";

export function useConsentData(
  clientId: string, 
  scopes: string[], 
  redirectUri: string
) {
  const key = `/oauth/consent/check?cid=${clientId}&scope=${scopes.join(',')}&redirect_uri=${redirectUri}`;

  const { data, error, isLoading } = useSWR(
    clientId ? key : null,
    async () => {
      const result =
        // await fetchConsentMock(clientId, scopes, redirectUri)
        await fetchConsent(clientId, scopes, redirectUri)

      if (!result.success) throw new Error(result.error.message);
      
      if (!result.data.valid) {
        throw new Error(`Приложение "${result.data.name || clientId}" недоступно или заблокировано.`);
      }
      
      return result.data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    consentData: data,
    isLoading,
    error: error ? (error.message as string) : null,
  };
}