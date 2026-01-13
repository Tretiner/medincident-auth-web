"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/presentation/components/ui/button";
import { User } from "lucide-react";
import { z } from "zod";
import type { TelegramUser } from "@/domain/auth/types";
import { MockTgUser } from "@/lib/mock-db";

export const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
}) satisfies z.ZodType<TelegramUser>;

interface Props {
  botName: string;
  onAuth: (user: TelegramUser) => void;
}

export function TelegramWidget({ botName, onAuth }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Prevent duplicate scripts if re-rendering
    if (ref.current.querySelector("script")) return;

    const callbackName: string = `onTelegramAuth_${Math.floor(Math.random() * 100000)}`;
    // @ts-expect-error - Telegram widget requires a global function name string
    window[callbackName] = (rawUser: string) => {
      delete window[callbackName];

      const result = telegramUserSchema.safeParse(rawUser);
      if (!result.success) {
        console.error("Telegram прислал некорректные данные:", result.error);
        // TODO: Обработка ошибок
        return;
      }

      const user = result.data;

      onAuth(user);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";

    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute('data-radius', '16');

    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");

    script.async = true;
    ref.current.appendChild(script);

    return () => {
      // @ts-expect-error - cleanup
      delete window[callbackName];
    };
  }, [botName, onAuth]);

  return <div ref={ref} className="flex justify-center py-4" />;
}

// --- MOCK WIDGET ---
export function MockTelegramWidget({ botName, onAuth }: Props) {
  const handleMockLogin = () => {
    onAuth(MockTgUser);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 bg-yellow-50/50 rounded-xl w-full max-w-[300px]">
      <div className="text-xs font-mono text-yellow-600 mb-3 uppercase tracking-wider font-bold">
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
