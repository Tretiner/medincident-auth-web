'use client';

import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrCodeCardProps {
  url: string;
  isLoading: boolean;
  isError: boolean;
  className?: string;
}

export function QrCodeCard({ url, isLoading, isError, className }: QrCodeCardProps) {
  return (
    <div 
      className={cn(
        "bg-background p-4 rounded-xl border border-border relative overflow-hidden group w-64 h-64 flex items-center justify-center transition-all duration-300", 
        className
      )}
    >
      {isError ? (
        <div className="flex flex-col items-center text-destructive gap-2 px-4 animate-in fade-in">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <span className="text-xs font-medium">Ошибка загрузки QR</span>
        </div>
      ) : (
        <>
          <Image
            src={url}
            alt="QR Code Login"
            fill
            priority
            unoptimized
            className={cn(
              "object-contain p-4 transition-opacity duration-500",
              (!url || isLoading) ? "opacity-0" : "opacity-100"
            )}
          />
          
          {isLoading && !url && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
        </>
      )}
    </div>
  );
}