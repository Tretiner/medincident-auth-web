"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchQrCode, login, telegramLoginAction } from "./actions";
import { TelegramUser } from "@/domain/auth/types";
import { delay } from "@/lib/utils";

// --- QR Auth Hook ---
export function useQrAuth(initialUrl: string) {
  const {
    data: qrUrl,
    error,
    isLoading,
  } = useSWR("auth-qr", fetchQrCode, {
    fallbackData: initialUrl,
    refreshInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  return {
    qrUrl: qrUrl || initialUrl,
    isLoading: isLoading && !qrUrl,
    isError: !!error,
  };
}

// --- Telegram Auth Hook ---
export function useTelegramAuthDialog(redirectPath: string = "/profile") {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAuth = (user: TelegramUser) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await telegramLoginAction(user);

        if (!result.success) {
          setError(result.error || "Произошла ошибка");
          return;
        }

        setIsOpen(false);
        router.push(redirectPath);
        router.refresh();
      } catch (err) {
        console.error("Unexpected client error:", err);
        setError("Что-то пошло не так. Попробуйте позже.");
      }
    });
  };

  return {
    isOpen,
    setIsOpen,
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
      await login(provider);
    });
  };

  return {
    login: handleLogin,
    isLoading: isPending,
    error,
  };
}
