"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

let isInitialLoad = true;

export function TabTransition({ children }: { children: React.ReactNode }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
      setShouldAnimate(true);
  }, []);

  return (
    <div
      className={cn(
        shouldAnimate &&
          "animate-in fade-in slide-in-from-bottom-4 duration-300"
      )}
    >
      {children}
    </div>
  );
}
