"use client";

import Image from "next/image";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Loader2 } from "lucide-react";
import { ServiceLogoIcon } from "@/presentation/components/icons/base";
import {
  MaxLogoIcon,
  TelegramLogoIcon,
} from "@/presentation/components/icons/auth";
import { useLoginViewModel } from "./loginViewModel";

interface AuthButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const TelegramButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    variant="telegram"
    size="brand"
    className="w-full"
  >
    {disabled 
      ? <Loader2 className="w-6 h-6 animate-spin text-white" /> 
      : <TelegramLogoIcon className="w-6 h-6 text-white" />}
    Telegram
  </Button>
);

const MaxButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    variant="max"
    size="brand"
    className="w-full"
  >
    {disabled 
      ? <Loader2 className="w-6 h-6 animate-spin text-white" /> 
      : <MaxLogoIcon className="w-7 h-7 text-white" />}
    MAX
  </Button>
);

export function LoginForm({ initialQrUrl }: { initialQrUrl: string }) {
  const { state, dispatch } = useLoginViewModel(initialQrUrl);
  const { qrUrl, isLoading: isLoginProcessing, error } = state;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 font-sans">
      <Card
        className="w-full max-w-[960px] overflow-hidden rounded-3xl shadow-none 
                       border border-border bg-card transition-all duration-300
                       grid md:grid-cols-2"
      >
        {/* ЛЕВАЯ ПАНЕЛЬ: QR-код */}
        <div className="bg-muted/30 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-border">
          {/* Декоративный градиент через OKLCH переменную из globals.css */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--color-brand-green),transparent)] opacity-5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Контейнер QR */}
            <div className="bg-white p-4 rounded-[2rem] border border-border relative overflow-hidden group w-56 h-56 flex items-center justify-center shadow-sm">
              {!qrUrl ? (
                <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
              ) : (
                <Image
                  src={qrUrl}
                  alt="QR Code"
                  fill // Позволяет изображению занять весь контейнер
                  priority // Отключает Lazy Load, чтобы QR загрузился мгновенно (важно для LCP)
                  className="object-contain p-4 transition-opacity duration-500"
                  unoptimized // Для QR-кодов часто лучше не использовать сжатие Next.js
                />
              )}
              
              {/* Scan Animation Overlay */}
              {qrUrl && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green/20 to-transparent -translate-y-full animate-[accordion-down_2s_infinite] pointer-events-none" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-3">
              Вход по QR-коду
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Наведите камеру телефона на QR-код, чтобы быстро войти в систему.
            </p>
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: Форма */}
        <CardContent className="p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center md:items-start mb-10">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4 text-brand-green">
              <ServiceLogoIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Вход в «Ilizarov ID»
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-muted-foreground font-medium">
              Войдите с помощью:
            </p>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <TelegramButton 
                disabled={isLoginProcessing}
                onClick={() => dispatch({ type: 'LOGIN_CLICKED', provider: 'telegram' })} 
              />
              <MaxButton 
                disabled={isLoginProcessing}
                onClick={() => dispatch({ type: 'LOGIN_CLICKED', provider: 'max' })} 
              />
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground leading-relaxed">
            Нажимая на кнопки входа, вы принимаете{" "}
            <a
              href="#"
              className="text-brand-green hover:underline font-medium"
            >
              пользовательское соглашение
            </a>{" "}
            и{" "}
            <a
              href="#"
              className="text-brand-green hover:underline font-medium"
            >
              политику конфиденциальности
            </a>{" "}
            сервиса Ilizarov ID.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
