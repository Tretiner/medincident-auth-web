"use client";

import { useEffect, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useQrAuth } from "../login.hooks";

const QRCodeStyled = QRCode as any;

export function QrAuthSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fgColor, setFgColor] = useState("#2b3a15");
  const { qrUrl, isError, isLoading, refresh } = useQrAuth(isVisible);

  const refreshCommand = () => refresh();

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsVisible(entry.isIntersecting),
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasValidValue = qrUrl && qrUrl.trim() !== "";

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center w-full"
    >
      {/* Скрытый элемент для чтения CSS-токена text-foreground */}
      <span ref={colorRef} className="text-foreground hidden" aria-hidden />

      <div
        className={cn(
          "relative flex aspect-square w-full max-w-[256px] items-center justify-center overflow-hidden rounded-2xl border-2 border-border p-0 transition-all duration-300 mb-8 bg-background/60 backdrop-blur-md",
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
              onClick={refreshCommand}
              className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Повторить
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        <div
          className={cn(
            "transition-all duration-500",
            isLoading || !hasValidValue
              ? "opacity-20 scale-95"
              : "opacity-86 scale-100",
          )}
        >
          {!isError && !isLoading && hasValidValue && (
            <QRCodeStyled
              value={qrUrl}
              size={220}
              qrStyle="fluid"
              eyeRadius={[
                [12, 12, 12, 12],
                [12, 12, 12, 12],
                [12, 12, 12, 12],
              ]}
              quietZone={14}
              fgColor={fgColor}
              bgColor="#00000000"
              level="H"
            />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
        Вход по QR-коду
      </h2>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        Наведите камеру телефона на код,
        <br />
        чтобы войти мгновенно.
      </p>
    </div>
  );
}
