"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { QrData, TelegramUser } from "@/domain/auth/types";
import { handleFetch } from "@/lib/fetch-helper";
import { loginWithTelegram, loginWithTelegramMock } from "@/services/server-http-client";
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
      const result = await loginWithTelegram(user);

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

// {
//     "accessToken": {
//         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJtZWRpbmNpZGVudC1hdXRoLXNlcnZpY2UiLCJzdWIiOiIwMTliZTU2Zi0yOTdmLTcxZGMtYmRlZi1lNGY4ZjU5NDJiMDIiLCJleHAiOjE3NjkwODE1MzcsIm5iZiI6MTc2OTA4MTIzNywiaWF0IjoxNzY5MDgxMjM3LCJqdGkiOiIwMTliZTU3NS03MTZhLTc5NTItOGJmMi0yMjk5MTc3ZmQyNDciLCJzaWQiOiIyZDBiMDZkMy0xYjNmLTRlM2MtYmRhMC1jZDQ2ODgyMGUzZDUifQ._Znh3xnjriZtHof9I66zdrDbwCe8gaoPo5YzUPD4D-c",
//         "expiresIn": 292
//     },
//     "profile": {
//         "id": "019be56f-297f-71dc-bdef-e4f8f5942b02",
//         "firstName": "махмед",
//         "photoUrl": "https://t.me/i/userpic/320/k6xaAMpd0LZltPkCRc7cm2UzdRjUMrG5NMV30g_GJKw.jpg"
//     }
// }