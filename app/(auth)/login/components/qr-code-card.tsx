"use client";

import Image from "next/image";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrCodeCardProps {
  url?: string;
  isLoading: boolean;
  isError: boolean;
  className?: string;
}

export function QrCodeCard({
  url,
  isLoading,
  isError,
  className,
}: QrCodeCardProps) {
  return (
    <div
      className={cn(
        "bg-background p-4 rounded-xl border border-border relative overflow-hidden group w-64 h-64 flex items-center justify-center",
        className
      )}
    >
      {isError && (
        <div className="flex flex-col items-center text-destructive gap-2 px-4 animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <span className="text-xs font-medium">Ошибка загрузки QR</span>
        </div>
      )}

      {isLoading ||(!url && !isError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="size-12 animate-spin text-primary/60" />
          </div>
        )
      )}

      {!isError && !isLoading && url && (
        <Image
          src={url}
          alt="QR Code Login"
          fill
          priority
          unoptimized
          sizes="(max-width: 768px) 100vw, 256px"
          className="object-contain p-4 animate-in fade-in duration-700"
        />
      )}
    </div>
  );
}
