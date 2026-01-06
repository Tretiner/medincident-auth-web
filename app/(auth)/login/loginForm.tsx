"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { env } from "@/env";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/ui/dialog";
import { ServiceLogoIcon } from "@/presentation/components/icons/base";
import { MaxLogoIcon, TelegramLogoIcon } from "@/presentation/components/icons/auth";
import { useLoginViewModel } from "./loginViewModel";
import { MockTelegramWidget, TelegramWidget } from "./components/telegram-widget";

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
    className="w-full relative"
  >
    {disabled ? (
      <Loader2 className="w-5 h-5 animate-spin absolute left-4" />
    ) : (
      <TelegramLogoIcon className="w-5 h-5 absolute left-4" />
    )}
    <span className="pl-6">Войти через Telegram</span>
  </Button>
);

const MaxButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    variant="max"
    size="lg"
    className="w-full relative"
  >
    {disabled ? (
      <Loader2 className="w-5 h-5 animate-spin absolute left-4" />
    ) : (
      <MaxLogoIcon className="w-6 h-6 absolute left-4" />
    )}
    <span className="pl-6">Войти через MAX</span>
  </Button>
);

export function LoginForm({ initialQrUrl }: { initialQrUrl: string }) {
  const { state, dispatch } = useLoginViewModel(initialQrUrl);
  const { qrUrl, isLoading, error } = state;

  const [isTgModalOpen, setIsTgModalOpen] = useState(false);

  const telegramCallbackUrl = `${env.NEXT_PUBLIC_APP_URL}/api/callback/telegram`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 font-sans animate-in fade-in duration-500">
      <Card
        className="w-full max-w-[960px] overflow-hidden rounded-2xl shadow-none 
                       border border-border bg-card transition-all duration-300
                       grid md:grid-cols-2"
      >
        {/* ЛЕВАЯ КОЛОНКА: QR Code */}
        <div className="bg-muted/30 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-border">
          {/* Фоновый эффект */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--color-brand-green),transparent)] opacity-5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Рамка QR */}
            <div className="bg-white p-4 rounded-[2rem] border border-border relative overflow-hidden group w-64 h-64 flex items-center justify-center shadow-sm mb-8">
              {!qrUrl ? (
                <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
              ) : (
                <Image
                  src={qrUrl}
                  alt="QR Code Login"
                  fill
                  priority
                  unoptimized // Важно для динамических QR кодов
                  className="object-contain p-4 transition-opacity duration-500"
                />
              )}
              
              {/* Анимация сканера (бегающая полоска) */}
              {qrUrl && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green/20 to-transparent -translate-y-full animate-[accordion-down_2s_infinite] pointer-events-none" />
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
        <CardContent className="p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center md:items-start mb-10">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 text-brand-green shadow-sm">
              <ServiceLogoIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Вход в Medsafety
            </h1>
            <p className="text-muted-foreground mt-2">
              Единый аккаунт для всех медицинских сервисов
            </p>
          </div>

          <div className="space-y-6 w-full">
            {/* Блок отображения ошибок */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <TelegramButton 
                disabled={isLoading}
                onClick={() => setIsTgModalOpen(true)} 
              />
              
              <MaxButton 
                disabled={isLoading}
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
            сервиса Medsafety.
          </p>
        </CardContent>
      </Card>

      {/* --- МОДАЛЬНОЕ ОКНО TELEGRAM --- */}
      <Dialog open={isTgModalOpen} onOpenChange={setIsTgModalOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Вход через Telegram</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Нажмите кнопку ниже, чтобы авторизоваться.<br />
              Вас автоматически перенаправит в профиль.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-6 min-h-[160px]">

                    <MockTelegramWidget 
                        botName="Bot123"
                        authUrl={telegramCallbackUrl} 
                    />
                
                        {/* <TelegramWidget 
                           botName={env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
                           authUrl={telegramCallbackUrl}
                         /> */}
               

             <p className="text-[10px] text-muted-foreground mt-6 text-center max-w-[200px]">
               Если кнопка не отображается, отключите AdBlock, VPN или проверьте подключение к интернету.
             </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}