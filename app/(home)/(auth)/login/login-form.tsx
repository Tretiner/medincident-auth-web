"use client";

import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceLogoIcon } from "@/components/icons/base";
import {
  MaxLogoIcon,
  TelegramLogoIcon,
} from "@/components/icons/auth";

import { useQrAuth, useSocialAuth, useTelegramAuthDialog } from "./login.hooks";
import { TelegramLoginDialog } from "./_components/telegram-login-dialog";
import { env } from "@/config/env";
import { APP_NAME } from "@/lib/constants";
import { QrCodeCard } from "./_components/qr-code-card";
import { NextRouter, useRouter } from "next/router";
import { TelegramUser } from "@/domain/auth/types";

interface AuthButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const TelegramButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant="telegram"
    size="lg"
    className="w-full relative py-6 text-base"
  >
    {disabled ? (
      <Loader2 className="animate-spin absolute left-4 top-1/2 -translate-y-1/2" />
    ) : (
      <TelegramLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
    )}
    <span className="pl-4">Войти через Telegram</span>
  </Button>
);

const MaxButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant="max"
    size="lg"
    className="w-full relative py-6 text-base"
  >
    {disabled ? (
      <Loader2 className="animate-spin absolute left-4 top-1/2 -translate-y-1/2" />
    ) : (
      <MaxLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
    )}
    <span className="pl-4">Войти через MAX</span>
  </Button>
);

interface Props {
  initialQrUrl: string;
  redirectPath: string;
}

export function LoginForm({ initialQrUrl, redirectPath }: Props) {
  const {
    qrUrl,
    isError: isQrError,
    isLoading: isQrLoading,
  } = useQrAuth(initialQrUrl);

  const telegramAuthDialog = useTelegramAuthDialog(redirectPath);
  const otherAuth = useSocialAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans animate-in fade-in duration-500">
      <Card
        className="w-full max-w-[960px] overflow-hidden rounded-xl shadow-none
                        border border-border bg-card transition-all duration-300
                        grid md:grid-cols-2"
      >
        {/* ЛЕВАЯ КОЛОНКА: QR Code */}
        <div className="hidden md:flex relative flex-col items-center justify-center text-center p-12 overflow-hidden border-r border-border bg-muted/5">
          
          {/* 1. Базовый градиент по диагонали */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/50 to-primary/5 pointer-events-none" />
          
          {/* 2. Верхний левый "фонарь" (основной цвет) - создает сильный акцент */}
          <div className="absolute -top-[30%] -left-[30%] w-[90%] h-[90%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
          
          {/* 3. Нижний правый "свет" - создает контраст и объем */}
          <div className="absolute -bottom-[30%] -right-[30%] w-[90%] h-[90%] bg-primary/15 blur-[130px] rounded-full pointer-events-none" />
          
          {/* --- CONTENT --- */}
          <div className="relative z-10 flex flex-col items-center">
            <QrCodeCard
              url={qrUrl}
              isLoading={isQrLoading}
              isError={isQrError}
              className="mb-8 shadow-sm bg-white/50 backdrop-blur-sm border-white/20" 
            />

            <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              Вход по QR-коду
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Наведите камеру телефона на код,
              <br />
              чтобы войти мгновенно.
            </p>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Кнопки */}
        <CardContent className="p-6 sm:p-8 md:p-12 flex flex-col justify-center min-h-[400px] md:min-h-auto">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-10">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-primary shadow-sm">
              <ServiceLogoIcon className="w-7 h-7 md:w-8 md:h-8" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center md:text-left">
              Вход в {APP_NAME}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base text-center md:text-left">
              Единый аккаунт для всех медицинских сервисов
            </p>
          </div>

          <div className="space-y-4 md:space-y-6 w-full">
            {otherAuth.error && (
              <div
                className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium 
                               border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2"
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                {otherAuth.error}
              </div>
            )}

            <div className="grid gap-3 md:gap-4">
              <TelegramButton
                disabled={otherAuth.isLoading}
                onClick={() => telegramAuthDialog.setIsOpen(true)}
              />

              <MaxButton
                disabled={otherAuth.isLoading}
                onClick={() => otherAuth.login("max")}
              />
            </div>
          </div>

          <p className="mt-6 md:mt-8 text-center text-[10px] md:text-xs text-muted-foreground leading-relaxed px-4 md:px-0">
            Нажимая на кнопки входа, вы принимаете{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              пользовательское соглашение
            </a>{" "}
            и{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              политику конфиденциальности
            </a>{" "}
            сервиса {APP_NAME}.
          </p>
        </CardContent>
      </Card>

      {/* --- МОДАЛЬНОЕ ОКНО TELEGRAM --- */}
      <TelegramLoginDialog
        isOpen={telegramAuthDialog.isOpen}
        setIsOpen={telegramAuthDialog.setIsOpen}
        isLoading={telegramAuthDialog.isLoading}
        error={telegramAuthDialog.error}
        onAuth={telegramAuthDialog.onAuth}
      />
    </div>
  );
}