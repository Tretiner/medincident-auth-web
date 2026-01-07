'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/ui/dialog";
// import { TelegramWidget } from "./telegram-widget"; // [TODO]: Раскомментировать для продакшена
import { MockTelegramWidget } from "./telegram-widget";
import { env } from "@/env";

interface TelegramLoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  authUrl: string; // [FIX]: Ссылка для редиректа
}

export function TelegramLoginDialog({ 
  isOpen, 
  onOpenChange, 
  authUrl
}: TelegramLoginDialogProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border w-[90%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Вход через Telegram</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Нажмите кнопку ниже, чтобы авторизоваться.<br />
            Вас автоматически перенаправит в профиль.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 min-h-[160px]">

          {/* DEV MODE: Mock Widget */}
          <MockTelegramWidget 
            botName="mock_bot" 
            authUrl={authUrl} 
          />

          {/* PRODUCTION: Real Widget
           <TelegramWidget 
              botName={env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
              authUrl={authUrl}
          /> 
          */}
             
           <p className="text-[10px] text-muted-foreground mt-6 text-center max-w-[200px]">
            Если кнопка не отображается, отключите AdBlock, VPN или проверьте подключение к интернету.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}