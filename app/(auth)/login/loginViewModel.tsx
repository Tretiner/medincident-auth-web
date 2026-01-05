'use client';

import { useReducer, useCallback, useEffect } from "react";
import { fetchQrCode, login } from "./actions";
import { useRouter } from "next/navigation";
import useSWR from 'swr';

export interface LoginState {
  qrUrl: string;
  isLoading: boolean;
  error: string | null;
}

export type LoginIntent =
  | { type: 'INIT_TIMER' }
  | { type: 'TIMER_TICK' }
  | { type: 'LOGIN_CLICKED'; provider: 'telegram' | 'max' }
  | { type: 'QR_UPDATED'; payload: string }
  | { type: 'ERROR'; payload: string }; 

function reducer(state: LoginState, intent: LoginIntent): LoginState {
  switch (intent.type) {
    case 'QR_UPDATED':
      return { ...state, qrUrl: intent.payload };
    case 'LOGIN_CLICKED':
      return { ...state, isLoading: true, error: null };
    case 'ERROR':
      return { ...state, isLoading: false, error: intent.payload };
    default:
      return state;
  }
}

export const useLoginViewModel = (initialQrUrl: string) => {
  const initialState = {
    qrUrl: initialQrUrl,
    isLoading: false,
    error: null,
  }
  const { data: newQr } = useSWR('/api/auth/qr', { refreshInterval: 300000 });

  const router = useRouter();
  const [state, dispatchLocal] = useReducer(reducer, initialState);

  const dispatch = useCallback(async (intent: LoginIntent) => {
    dispatchLocal(intent);

    // Логика эффектов
    switch (intent.type) {
      case 'INIT_TIMER':
        break;
      case 'TIMER_TICK':
        try {
          const newUrl = await fetchQrCode();
          dispatchLocal({ type: 'QR_UPDATED', payload: newUrl });
        } catch (e) {
        }
        break;

      case 'LOGIN_CLICKED':
        try {
          await login(intent.provider);
          router.push('/profile');
        } catch (e) {
          dispatchLocal({ type: 'ERROR', payload: "Ошибка входа" });
        }
        break;
    }
  }, [router]);

  useEffect(() => {
     const timer = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 10000);
     return () => clearInterval(timer);
  }, [dispatch]);

  return { state, dispatch };
};