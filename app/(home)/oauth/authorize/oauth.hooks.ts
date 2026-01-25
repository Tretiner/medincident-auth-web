"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchConsent } from "@/lib/services/server-http-client";
import { useRouter } from "next/router";

export function useConsentData(
  clientId: string, 
  scopes: string[], 
  redirectUri: string
) {
  const key = `/oauth/consent/check?cid=${clientId}&scope=${scopes.join(',')}&redirect_uri=${redirectUri}`;

  const { data, error, isLoading } = useSWR(
    clientId ? key : null,
    async () => {
      const result = await fetchConsent(clientId, scopes, redirectUri);
      if (!result.success) throw new Error(result.error.message);
      
      if (!result.data.valid) {
        throw new Error(`Приложение "${result.data.name || clientId}" недоступно.`);
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