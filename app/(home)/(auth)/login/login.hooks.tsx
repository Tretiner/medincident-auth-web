"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { QrData, TelegramUser } from "@/domain/auth/types";
import { handleFetch } from "@/lib/fetch-helper";
import {
  loginWithTelegram,
  loginWithTelegramMock,
} from "@/lib/services/server-http-client";
import z from "zod";
import { showErrorMessage } from "@/lib/ui-error-handler";
import { useProfileStore } from "../../(details)/profile/profile.store";
import { removeAccessToken, setAccessToken } from "@/lib/services/access-token-manager";

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
  const { data, error, isLoading, isValidating } = useSWR(
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
  };
}

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

interface LoginProfile {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export function useTelegramAuth(redirectPath: string = "/profile") {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setProfileStore = useProfileStore((s) => s.setProfile);

  const [welcomeUser, setWelcomeUser] = useState<LoginProfile | null>(null);

  const handleAuth = (user: TelegramUser) => {
    startTransition(async () => {
      const result = await loginWithTelegram(user);
      // const result = await loginWithTelegramMock();

      if (!result.success) {
        showErrorMessage(result.error);
        return;
      }

      if (result.data.accessToken) {
        setAccessToken({
          token: result.data.accessToken.token,
          expiresIn: result.data.accessToken.expiresIn,
        });
      }
      
      if (result.data.profile) {
        setProfileStore({
          firstName: result.data.profile.firstName || "",
          lastName: result.data.profile.lastName || "",
          photoUrl: result.data.profile.photoUrl || null,
        });
      }

      setWelcomeUser({
        photoUrl: result.data.profile.photoUrl,
        firstName: result.data.profile.firstName,
        lastName: result.data.profile.lastName,
      });

      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 2000);
    });
  };

  return {
    isLoading: isPending || !!welcomeUser, // Блокируем интерфейс пока висит диалог
    welcomeUser, // Возвращаем данные для диалога
    onAuth: handleAuth,
  };
}

export function useSocialAuth() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = (provider: string) => {
    startTransition(async () => {
      if (provider === "max") {
        const result = await handleFetch(
          () => fetch("/api/auth/max", { method: "POST" }),
          SuccessResponseSchema,
        );

        if (!result.success) {
          showErrorMessage(result.error); 
          return;
        }
        
        // router.push(...)
      }
    });
  };

  return {
    login: handleLogin,
    isLoading: isPending,
  };
}

export async function logoutClient() {
  await fetch("/api/auth/logout", { method: "POST" });
  useProfileStore.getState().clearProfile();
  removeAccessToken();
  window.location.href = "/login";
}


export function useAuthNavigation() {
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("from") || searchParams.get("redirectTo") || "/profile";

  const backParams = new URLSearchParams();
  if (searchParams.get("from")) backParams.set("from", searchParams.get("from")!);
  
  const backLink = `/login?${backParams.toString()}`;

  return {
    redirectPath,
    backLink,
  };
}