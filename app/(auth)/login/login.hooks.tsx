'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { login, fetchQrCode } from "./actions";

// --- QR Auth Hook ---
function useQrAuth(initialUrl: string) {
  const { data: qrUrl, error, isLoading } = useSWR('auth-qr', fetchQrCode, {
    fallbackData: initialUrl,
    refreshInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  return { 
    qrUrl: qrUrl || initialUrl,
    isLoading: isLoading && !qrUrl, 
    isError: !!error 
  };
}

// --- Social Auth Hook (MAX & General) ---
function useSocialAuth() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (provider: 'telegram' | 'max') => {
    setError(null);
    startTransition(async () => {
      try {
        const success = await login(provider);
        if (success) {
          router.push('/profile');
        } else {
          setError("Не удалось войти");
        }
      } catch (e) {
        console.error(e);
        setError("Ошибка соединения");
      }
    });
  };

  return {
    login: handleLogin,
    isLoading: isPending,
    error
  };
}

// --- Telegram Auth Hook ---
export function useTgAuth() {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    setIsOpen,
  };
}

// --- Main Hook ---
export const useLogin = (initialQrUrl: string) => {
  const { qrUrl, isError: isQrError, isLoading: isQrLoading } = useQrAuth(initialQrUrl);
  const { login, isLoading: isAuthLoading, error: authError } = useSocialAuth();
  
  const tgAuth = useTgAuth();

  return {
    state: {
      qrUrl,
      isQrLoading,
      isQrError,
      isAuthLoading,
      globalError: authError,
    },
    tgAuth,
    actions: {
      onLoginMax: () => login('max'),
    }
  };
};