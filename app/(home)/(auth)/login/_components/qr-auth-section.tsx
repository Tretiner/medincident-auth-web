"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { QRCode } from "react-qrcode-logo";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useQrAuth, useQrStatus } from "../login.hooks";
import { applyQrSessionAction } from "../actions";

const QRCodeStyled = QRCode as any;
const QR_FG_COLOR = "#2b3a15";

interface QrAuthSectionProps {
  requestId?: string;
}

export function QrAuthSection({ requestId }: QrAuthSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { qrUrl, qrToken, isError, isLoading, refresh } = useQrAuth(isVisible, requestId);
  const { status } = useQrStatus(
    qrToken,
    isVisible && !isError && !isLoading && !!qrToken,
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsVisible(entry.isIntersecting),
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === "confirmed" && qrToken && !isPending) {
      startTransition(async () => {
        await applyQrSessionAction(qrToken);
      });
    }
  }, [status, qrToken, isPending]);

  const hasValidValue = qrUrl && qrUrl.trim() !== "";
  const isConfirmed = status === "confirmed" || isPending;
  const isExpired = status === "expired";

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center w-full"
    >
      <div
        className={cn(
          "relative flex aspect-square w-full max-w-[256px] items-center justify-center overflow-hidden rounded-2xl border-2 border-border p-0 transition-all duration-300 mb-8 bg-background/60 backdrop-blur-md",
          isConfirmed && "border-success",
        )}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {isConfirmed && (
          <div className="z-20 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <span className="text-xs text-muted-foreground">Входим...</span>
          </div>
        )}

        {!isConfirmed && (isError || isExpired) && (
          <div className="z-20 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95">
            <AlertCircle className="h-8 w-8 text-destructive/50" />
            <button
              onClick={() => refresh()}
              className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Повторить
            </button>
          </div>
        )}

        {!isConfirmed && isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {!isConfirmed && (
          <div
            className={cn(
              "transition-all duration-500",
              isLoading || !hasValidValue
                ? "opacity-20 scale-95"
                : "opacity-86 scale-100",
            )}
          >
            {!isError && !isExpired && !isLoading && hasValidValue && (
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
                fgColor={QR_FG_COLOR}
                bgColor="#00000000"
                level="H"
              />
            )}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
        {isConfirmed ? "Подтверждено!" : "Вход по QR-коду"}
      </h2>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        {isConfirmed ? (
          "Выполняем вход..."
        ) : (
          <>
            Наведите камеру телефона на код,
            <br />
            чтобы войти мгновенно.
          </>
        )}
      </p>
    </div>
  );
}
