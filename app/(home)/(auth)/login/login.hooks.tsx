"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { QrData, QrStatus } from "@/domain/auth/types";
import { handleFetch } from "@/shared/lib/fetch-helper";
import z from "zod";
import { useProfileStore } from "../../(details)/profile/profile.store";
import { logoutAction } from "./actions";

const QrDataSchema = z.object({
  url: z.string(),
  token: z.string().optional(),
  expiresInSeconds: z.number(),
}) satisfies z.ZodType<QrData>;

const QrStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "expired"]),
});

async function fetchQrStatus(token: string): Promise<{ status: QrStatus }> {
  const res = await fetch(`/api/auth/qr/status?token=${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return { status: "expired" };
  const data = QrStatusSchema.safeParse(await res.json());
  return data.success ? data.data : { status: "expired" };
}

const fetchQrCodeAPI = async (requestId?: string): Promise<QrData> => {
  const url = requestId ? `/api/auth/qr?requestId=${requestId}` : "/api/auth/qr";
  const result = await handleFetch(
    () => fetch(url, { cache: "no-store", headers: { Accept: "application/json" } }),
    QrDataSchema,
  );

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export function useQrAuth(enabled: boolean = true, requestId?: string) {
  const swrKey = enabled ? `/api/auth/qr${requestId ? `?requestId=${requestId}` : ""}` : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetchQrCodeAPI(requestId),
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
    qrToken: data?.token,
    isLoading: isLoading || isValidating,
    isError: !!error,
    refresh: mutate,
  };
}

export function useQrStatus(token: string | undefined, enabled: boolean) {
  const [status, setStatus] = useState<QrStatus>("pending");

  useEffect(() => {
    if (!enabled || !token) {
      setStatus("pending");
      return;
    }

    // SSE — одно соединение вместо polling каждые 3 секунды
    const es = new EventSource(`/api/auth/qr/status?token=${token}`);

    es.addEventListener("status", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus(data.status);
        if (data.status === "confirmed" || data.status === "expired") {
          es.close();
        }
      } catch {}
    });

    es.onerror = () => {
      // SSE connection lost — fallback: одноразовый запрос
      es.close();
      fetchQrStatus(token).then((data) => setStatus(data.status));
    };

    return () => es.close();
  }, [token, enabled]);

  return { status };
}

export async function logoutClient() {
  useProfileStore.getState().clearProfile();
  await logoutAction();
}