"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import type { TelegramUser } from "@/domain/auth/types";
import { MockTgUser } from "@/lib/mock-db";
import { telegramUserSchema } from "@/domain/auth/schema";

interface Props {
  botName: string;
  onAuth: (user: TelegramUser) => void;
}

export function TelegramWidget({ botName, onAuth }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.querySelector("script")) return;

    const callbackName: string = `onTelegramAuth_${Math.floor(Math.random() * 10000)}`;
    // @ts-expect-error - Telegram widget requires a global function name string
    window[callbackName] = (user: string) => {
      console.log("Got a user: " + user)

      const result = telegramUserSchema.safeParse(user);
      if (!result.success) {
        console.error("Telegram прислал некорректные данные:", result.error);
        // TODO: Обработка ошибок
        return;
      }
        console.log("Telegram прислал крутые данные:", JSON.stringify(result.data));

      onAuth(result.data);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;

    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");

    script.setAttribute('data-lang', 'ru');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '6');

    const currRef = ref.current;
    currRef.appendChild(script);

    return () => {
      currRef?.removeChild(script);
      // @ts-expect-error - cleanup
      delete window[callbackName];
    };
  }, [botName, onAuth]);

  return <div ref={ref} className="flex justify-center py-4" />;
}

// --- MOCK WIDGET ---
export function MockTelegramWidget({ botName, onAuth }: Props) {
  const handleMockLogin = () => {
    onAuth(JSON.stringify(MockTgUser));
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 bg-yellow-400/5 rounded-xl w-full max-w-[300px]">
      <div className="text-xs font-mono text-yellow-500 mb-3 uppercase tracking-wider font-bold">
        Dev Mode: Mock Widget
      </div>

      <Button
        onClick={handleMockLogin}
        className="bg-[#54a9eb] hover:bg-[#4092d1] text-white w-full rounded-full"
      >
        <User className="w-4 h-4 mr-2" />
        Войти как Алексей (Mock)
      </Button>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Passes JSON to onAuth callback immediately.
      </p>
    </div>
  );
}

