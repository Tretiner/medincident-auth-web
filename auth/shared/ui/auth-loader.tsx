"use client";

import { cn } from "@/shared/lib/utils";

const DOTS = ["0s", "0.18s", "0.36s"];

interface AuthLoaderProps {
  className?: string;
  fullScreen?: boolean;
}

export function AuthLoader({ className, fullScreen }: AuthLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen ? "min-h-screen" : "min-h-[500px]",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground tracking-wide">
        Пожалуйста, подождите
      </p>

      <div className="flex gap-2">
        {DOTS.map((delay) => (
          <span
            key={delay}
            style={{ animationDelay: delay }}
            className="w-3 h-3 rounded-full bg-primary animate-dot-wave"
          />
        ))}
      </div>
    </div>
  );
}
