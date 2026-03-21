"use client";

import useSWR from "swr";
import { fetchConsent, fetchConsentMock } from "@/lib/services/server-http-client";
import { ReadonlyURLSearchParams } from "next/navigation";

export function createDenyUrlFromParams(params: any, error: string = "access_denied"): string{
  const url = new URL(params.redirect_uri);
  url.searchParams.set("error", error);
  if (params.state) url.searchParams.set("state", params.state);
  return url.toString();
}

export function useConsentData(
  clientId: string, 
  scopes: string[], 
  redirectUri: string,
  onInvalidConsent: (errorType: string) => void
) {
  const { data, error, isLoading } = useSWR(
    `/oauth/consent/check?cid=${clientId}&scope=${scopes.join(',')}&redirect_uri=${redirectUri}`,
    async () => {
      const result =
        // await fetchConsentMock(clientId, scopes, redirectUri)
        await fetchConsent({clientId, scopes, redirectUri})

        if (!result.success) {
          console.log("Consent fetch response validation error: ", result.error.message);
          // onInvalidConsent("invalid_data")
          return
        }
      
        if (!result.data.valid) {
          console.log("Consent fetch request (isValid: false) error: ", result.data);
          // onInvalidConsent("invalid_data")
          return
        }
        
        return result.data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: (error) => {
          console.log("Consent fetch : ", error);
          // onInvalidConsent("network_fail")
          return
      }
    }
  );

  return {
    consentData: data,
    isLoading,
    error: error ? (error.message as string) : null,
  };
}