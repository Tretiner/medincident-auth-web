"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { QrData, TelegramUser } from "@/domain/auth/types";
import { handleFetch } from "@/lib/fetch-helper";
import z from "zod";

const QrDataSchema = z.object({
  url: z.string(),
  expiresInSeconds: z.number(),
}) satisfies z.ZodType<QrData>;

const fetchQrCodeAPI = async (): Promise<QrData> => {
  const result = await handleFetch(
    () => fetch("/api/auth/qr", { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
    }),
    QrDataSchema
  );

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export function useQrAuth(enabled: boolean = true) {
  const { data, error, isLoading, isValidating } = useSWR(
    enabled ? "/api/auth/qr" : null,
    fetchQrCodeAPI,
    {
      fallbackData: { url: undefined, expiresInSeconds: 10 },
      refreshInterval: (latest) => (latest ? latest.expiresInSeconds * 1000 : 10000),
      revalidateOnFocus: false,
      keepPreviousData: false,
      shouldRetryOnError: false,
    }
  );

  return {
    qrUrl: data?.url,
    isLoading: isLoading || isValidating,
    isError: !!error,
  };
}

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional()
});

export function useTelegramAuth(redirectPath: string = "/profile") {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAuth = (user: TelegramUser) => {
    setError(null);
    startTransition(async () => {
      const result = await handleFetch(
        () => fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }),
        SuccessResponseSchema
      );

      if (!result.success) {
        setError(result.error.message || "Произошла ошибка");
        return;
      }

      router.push(redirectPath);
      router.refresh();
    });
  };

  return {
    isLoading: isPending,
    error,
    onAuth: handleAuth,
  };
}

export function useSocialAuth() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (provider: string) => {
    setError(null);
    startTransition(async () => {
      if (provider === "max") {
        const result = await handleFetch(
            () => fetch("/api/auth/max", { method: "POST" }),
            SuccessResponseSchema
        );

        if (!result.success) {
            setError(result.error.message);
        }
      }
    });
  };

  return {
    login: handleLogin,
    isLoading: isPending,
    error,
  };
}

export async function logoutClient() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
}