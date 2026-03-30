"use client";

import { useEffect, useState } from "react";
// 1. Возвращаем правильную библиотеку для стилизации точек и глаз
import { QRCode } from "react-qrcode-logo";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Обходим ошибку типов TypeScript
const QRCodeStyled = QRCode as any;

interface QrCodeCardProps {
  url?: string;
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function QrCodeCard({
  url,
  isLoading,
  isError,
  onRefresh,
  className,
}: QrCodeCardProps) {
  const hasValidValue = url && url.trim() !== "";

  // 2. Гарантия рендера в браузере.
  // Это решит проблему пустого экрана, которая была в самом начале.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative flex aspect-square w-full max-w-[256px] items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-white p-0 transition-all duration-300",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {isError && (
        <div className="z-20 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95">
          <AlertCircle className="h-8 w-8 text-destructive/50" />
          <button
            onClick={onRefresh}
            className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Повторить
          </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <Loader2 className="h-10 w-10 animate-spin text-[#76c446]" />
        </div>
      )}

      {!isError && isMounted && (
        <div
          className={cn(
            "transition-all duration-500",
            isLoading || !hasValidValue
              ? "opacity-20 scale-95"
              : "opacity-86 scale-100"
          )}
        >
          <QRCodeStyled
            value={hasValidValue ? url : "https://google.com"}
            size={220}
            qrStyle="fluid"
            eyeRadius={[
              [12, 12, 12, 12],
              [12, 12, 12, 12],
              [12, 12, 12, 12],
            ]}
            quietZone={14}
            fgColor="#2b3a15"
            bgColor="#00000000"
            level="H"

            // logoImage="/qr-icon.svg" 
            // logoWidth={60}
            // removeQrCodeBehindLogo={true}
          />
        </div>
      )}
    </div>
  );
}