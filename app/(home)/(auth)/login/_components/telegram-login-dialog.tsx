'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { env } from "@/config/env";
import { MockTelegramWidget, TelegramWidget } from "./telegram-widget";
import { type TelegramUser } from "@/domain/auth/types";

interface TelegramLoginDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  error: string | null;
  onAuth: (user: TelegramUser) => void;
}

export function TelegramLoginDialog({ 
  isOpen, 
  setIsOpen,
  isLoading,
  error,
  onAuth
}: TelegramLoginDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border w-[90%] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Вход через Telegram</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Нажмите кнопку ниже, чтобы авторизоваться.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 min-h-[160px]">

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Проверка данных...
              </p>
            </div>
          ) : (
              <MockTelegramWidget 
                botName="mock_bot" 
                onAuth={onAuth} 
              />

              //  <div className={!env.isProd ? "hidden" : "block w-full flex justify-center"}>
              //    <TelegramWidget 
              //       botName={env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
              //       onAuth={onAuth}
              //    />
              // </div> 
          )}

          {error && (
            <div className="flex items-center gap-2 mt-4 text-destructive bg-destructive/10 px-4 py-2 rounded-lg animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
             
          {!isLoading && (
            <p className="text-[10px] text-muted-foreground mt-6 text-center max-w-[200px]">
              Если кнопка не отображается, отключите AdBlock, VPN или проверьте подключение к интернету.
            </p>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}