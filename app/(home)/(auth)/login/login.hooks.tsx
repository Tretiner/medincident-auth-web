"use client";

import useSWR from "swr";
import { QrData } from "@/domain/auth/types";
import { handleFetch } from "@/shared/lib/fetch-helper";
import z from "zod";
import { useProfileStore } from "../../(details)/profile/profile.store";
import { logoutAction } from "./actions";

const QrDataSchema = z.object({
  url: z.string(),
  expiresInSeconds: z.number(),
}) satisfies z.ZodType<QrData>;

const fetchQrCodeAPI = async (): Promise<QrData> => {
  const result = await handleFetch(
    () =>
      fetch("/api/auth/qr", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    QrDataSchema,
  );

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export function useQrAuth(enabled: boolean = true) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? "/api/auth/qr" : null,
    fetchQrCodeAPI,
    {
      fallbackData: { url: undefined, expiresInSeconds: 10 },
      refreshInterval: (latest) =>
        latest ? latest.expiresInSeconds * 1000 : 10000,
      revalidateOnFocus: false,
      keepPreviousData: false,
      shouldRetryOnError: false,
    },
  );

  return {
    qrUrl: data?.url,
    isLoading: isLoading || isValidating,
    isError: !!error,
    refresh: mutate,
  };
}

export async function logoutClient() {
  window.location.href = "/login";
  useProfileStore.getState().clearProfile();
  await logoutAction();
}