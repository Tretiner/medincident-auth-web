"use client";

import { Loader2, AlertCircle, ArrowLeft, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MockTelegramWidget } from "./telegram-widget";
import { TelegramLogoIcon } from "@/components/icons/auth";
import { cn } from "@/lib/utils";
import { useTelegramAuth } from "../login.hooks";
import { ServiceLogoIcon } from "@/components/icons/base";

interface Props {
  redirectPath: string;
  onBack: () => void;
}

export function TelegramLoginCard({ redirectPath, onBack }: Props) {
  const { isLoading, error, onAuth } = useTelegramAuth(redirectPath);

  return (
    <Card className="w-full max-w-[420px] shadow-none border-border bg-card overflow-hidden relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground -ml-2 h-8 px-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Назад
      </Button>

      <CardHeader className="pt-12 pb-2 text-center flex flex-col items-center">
        <div className="flex flex-row items-center justify-center gap-4 mb-4">
          {/* Иконка сервиса (стиль из login-form) */}
          <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/7">
            <ServiceLogoIcon className="w-6 h-6" />
          </div>

          {/* Иконка связи */}
          <Link2 className="w-5 h-5 text-muted-foreground" />

          {/* Иконка Telegram (убран mb-4 для выравнивания) */}
          <div className="w-12 h-12 bg-[image:var(--telegram-gradient)] rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/10">
            <TelegramLogoIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Вход через Telegram
        </h2>

        <p className="text-muted-foreground text-sm max-w-[280px]">
          Используйте виджет для безопасной авторизации
        </p>
      </CardHeader>

      <CardContent className="p-6 pb-10 flex flex-col items-center min-h-[180px] justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in rounded-lg">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-medium text-muted-foreground">
              Подключение...
            </p>
          </div>
        )}

        {error && (
          <div className="w-full mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in slide-in-from-top-2 text-left">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <span className="text-xs font-medium text-destructive">
              {error}
            </span>
          </div>
        )}

        <div
          className={cn(
            "transition-all duration-300 w-full flex justify-center",
            isLoading ? "opacity-40 blur-sm scale-95" : "opacity-100 scale-100"
          )}
        >
          <MockTelegramWidget botName="mock_bot" onAuth={onAuth} />
        </div>
      </CardContent>
    </Card>
  );
}
