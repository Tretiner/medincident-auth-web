"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { TelegramLogoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useTelegramAuth } from "./login.hooks";
import { MockTelegramWidget } from "./_components/telegram-widget";
import { LinkServiceCard } from "./_components/link-service-card";

interface Props {
  redirectPath: string;
  backLink: string;
}

const TelegramIcon = () => (
  <div className="w-12 h-12 bg-[image:var(--telegram-gradient)] rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/10">
    <TelegramLogoIcon className="w-6 h-6 text-white" />
  </div>
);

export function TelegramLoginCard({ redirectPath, backLink }: Props) {
  const { isLoading, error, onAuth } = useTelegramAuth(redirectPath);

  return (
    <LinkServiceCard
      title="Вход через Telegram"
      description="Используйте виджет для безопасной авторизации"
      serviceIcon={TelegramIcon}
      backLink={backLink}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3 animate-in fade-in rounded-lg">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Подключение...</p>
        </div>
      )}

      {error && (
        <div className="w-full mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in slide-in-from-top-2 text-left">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-xs font-medium text-destructive">{error}</span>
        </div>
      )}

      <div className={cn("transition-all duration-300 w-full flex justify-center", isLoading ? "opacity-40 blur-sm scale-95" : "opacity-100 scale-100")}>
        <MockTelegramWidget botName="mock_bot" onAuth={onAuth} />
      </div>
    </LinkServiceCard>
  );
}