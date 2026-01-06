'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Глобальная переменная сбрасывается в true только при жесткой перезагрузке (F5).
// При навигации через Link (Client-side) она сохраняет значение false.
let isInitialLoad = true;

export function TabTransition({ children }: { children: React.ReactNode }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Если это первый рендер после перезагрузки — не анимируем
    if (isInitialLoad) {
      isInitialLoad = false;
    } else {
      // Если это навигация внутри SPA — включаем анимацию
      setShouldAnimate(true);
    }
  }, []);

  return (
    <div className={cn(
      shouldAnimate && "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      {children}
    </div>
  );
}