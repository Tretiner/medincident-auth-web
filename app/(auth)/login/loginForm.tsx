"use client";

import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { ServiceLogoIcon } from "@/presentation/components/icons/base";
import { MaxLogoIcon, TelegramLogoIcon } from "@/presentation/components/icons/auth";

import { useLogin } from "./login.hooks";
import { TelegramLoginDialog } from "./components/telegram-login-dialog";
import { env } from "@/env";
import { APP_NAME } from "@/lib/constants";

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
      <Loader2 className="w-6 h-6 animate-spin absolute left-4 top-1/2 -translate-y-1/2" />
    ) : (
      <TelegramLogoIcon className="w-9 h-9 absolute left-4 top-1/2 -translate-y-1/2" />
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
      <Loader2 className="w-6 h-6 animate-spin absolute left-4 top-1/2 -translate-y-1/2" />
    ) : (
      <MaxLogoIcon className="w-10 h-10 absolute left-4 top-1/2 -translate-y-1/2" />
    )}
    <span className="pl-4">Войти через MAX</span>
  </Button>
);

export function LoginForm({ initialQrUrl }: { initialQrUrl: string }) {
  const { state, actions, tgAuth } = useLogin(initialQrUrl);
  const { qrUrl, isQrLoading, isQrError, isAuthLoading, globalError } = state;

  // Формируем URL для колбэка
  const tgAuthUrl = `${env.NEXT_PUBLIC_APP_URL}/api/callback/telegram`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 font-sans animate-in fade-in duration-500">
      <Card
        className="w-full max-w-[960px] overflow-hidden rounded-2xl shadow-none
                       border border-border bg-card transition-all duration-300
                       grid md:grid-cols-2"
      >
        
        {/* ЛЕВАЯ КОЛОНКА: QR Code */}
        <div className="hidden md:flex bg-muted/30 p-12 flex-col items-center justify-center text-center relative overflow-hidden border-r border-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--color-brand-green),transparent)] opacity-5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-4 rounded-[2rem] border border-border relative overflow-hidden group w-64 h-64 flex items-center justify-center shadow-sm mb-8">
              
              {isQrError ? (
                 <div className="flex flex-col items-center text-destructive gap-2 px-4">
                    <AlertCircle className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-medium">Ошибка загрузки QR</span>
                 </div>
              ) : (
                <>
                  <Image
                    src={qrUrl}
                    alt="QR Code Login"
                    fill
                    priority
                    unoptimized
                    className="object-contain p-4 transition-opacity duration-500"
                  />
                  {/* Показываем скелетон только если совсем пусто (на всякий случай) */}
                  {!qrUrl && isQrLoading && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green/20 to-transparent -translate-y-full animate-[accordion-down_2s_infinite] pointer-events-none" />
                </>
              )}

            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              Вход по QR-коду
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Наведите камеру телефона на код,<br/>чтобы войти мгновенно.
            </p>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Кнопки */}
        <CardContent className="p-6 sm:p-8 md:p-12 flex flex-col justify-center min-h-[500px] md:min-h-auto">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-10">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-brand-green shadow-sm">
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
            {globalError && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium 
                              border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                {globalError}
              </div>
            )}

            <div className="grid gap-3 md:gap-4">
              <TelegramButton 
                disabled={isAuthLoading}
                onClick={() => tgAuth.setIsOpen(true)} 
              />
              
              <MaxButton 
                disabled={isAuthLoading}
                onClick={actions.onLoginMax} 
              />
            </div>
          </div>

          <p className="mt-6 md:mt-8 text-center text-[10px] md:text-xs text-muted-foreground leading-relaxed px-4 md:px-0">
            Нажимая на кнопки входа, вы принимаете{" "}
            <a href="#" className="text-brand-green hover:underline font-medium">
              пользовательское соглашение
            </a>{" "}
            и{" "}
            <a href="#" className="text-brand-green hover:underline font-medium">
              политику конфиденциальности
            </a>{" "}
            сервиса {APP_NAME}.
          </p>
        </CardContent>
      </Card>

      {/* --- МОДАЛЬНОЕ ОКНО TELEGRAM --- */}
      <TelegramLoginDialog 
        isOpen={tgAuth.isOpen}
        onOpenChange={tgAuth.setIsOpen}
        authUrl={tgAuthUrl}
      />
      
    </div>
  );
}