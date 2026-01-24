"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { QrData, TelegramUser } from "@/domain/auth/types";
import { handleFetch } from "@/lib/fetch-helper";
import {
  loginWithTelegram,
  loginWithTelegramMock,
} from "@/lib/services/server-http-client";
import z from "zod";
import {
  tokenManager as accessTokenManager,
  tokenManager,
} from "@/lib/services/access-token-manager";
import { showErrorMessage } from "@/lib/ui-error-handler";
import { toast } from "sonner";
import { useProfileStore } from "../../(details)/profile/profile.store";

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
        tokenManager.setToken({
          token: result.data.accessToken.token,
          expiresIn: result.data.accessToken.expiresIn,
        });
      }

      
      // if (result.data.profile) {
      //   setProfileStore({
      //     firstName: result.data.profile.firstName || "",
      //     lastName: result.data.profile.lastName || "",
      //     photoUrl: result.data.profile.photoUrl || null,
      //   });
      // }

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (provider: string) => {
    setError(null);
    startTransition(async () => {
      if (provider === "max") {
        const result = await handleFetch(
          () => fetch("/api/auth/max", { method: "POST" }),
          SuccessResponseSchema,
        );

        if (!result.success) {
          setError(result.error.message);
          return;
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
  useProfileStore.getState().clearProfile();
  accessTokenManager.removeToken();
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
