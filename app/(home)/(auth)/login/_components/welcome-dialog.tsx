"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface WelcomeProfile {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface Props {
  isOpen: boolean;
  user: WelcomeProfile | null;
}

const LOADING_PHRASES = [
  "Настраиваем вашу рабочую среду...",
  "Синхронизируем последние данные...",
  "Проверяем протоколы безопасности...",
  "Загружаем персональные настройки...",
  "Устанавливаем защищенное соединение...",
  "Подготавливаем интерфейс для работы...",
  "Получаем актуальные обновления...",
  "Почти готово, минутку...",
  "Инициализация профиля пользователя...",
  "Связываемся с сервером...",
];

export function WelcomeDialog({ isOpen, user }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_PHRASES.length),
  );

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-[400px] flex flex-col items-center justify-center py-12 gap-4 
                   border border-primary/20 bg-card rounded-lg shadow-none 
                   animate-in zoom-in-95 duration-300 p-6"
      >
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-card/50 relative z-10">
              <AvatarImage src={user.photoUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

        <h2 className="text-2xl font-bold tracking-tight animate-in slide-in-from-bottom-2 duration-300 text-center">
          Здравствуйте, {user.firstName} {user.lastName}!
        </h2>

          <div className="min-h-[24px] flex items-center justify-center mt-4">
            <p className="text-muted-foreground text-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
              {LOADING_PHRASES[phraseIndex]}
            </p>
          </div>

          <div className="flex gap-2 items-center justify-center">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
    </div>
  );
}
