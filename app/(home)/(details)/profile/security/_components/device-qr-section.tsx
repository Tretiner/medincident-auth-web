"use client";

import { useEffect, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { QrCode, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";

const QRCodeStyled = QRCode as any;

interface QrState {
  url?: string;
  expiresInSeconds?: number;
  error?: boolean;
  loading: boolean;
}

export function DeviceQrSection() {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<QrState>({ loading: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function loadQr() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQr({ loading: true });
    try {
      const res = await fetch("/api/auth/qr/transfer", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (controller.signal.aborted) return;

      setQr({ url: data.url, expiresInSeconds: data.expiresInSeconds, loading: false });

      // Авто-обновление за 10 сек до истечения
      if (data.expiresInSeconds) {
        const refreshIn = Math.max((data.expiresInSeconds - 10) * 1000, 5000);
        timerRef.current = setTimeout(loadQr, refreshIn);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setQr({ loading: false, error: true });
    }
  }

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      loadQr();
    } else {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      setQr({ loading: false });
    }
  }

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpen(true)}
        className="flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:bg-primary/15 hover:border-border/80 hover:text-foreground transition-all cursor-pointer"
      >
        <QrCode className="h-7 w-7" />
        <span className="text-xs font-medium">Войти по QR</span>
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-sm gap-4">
          <DialogTitle>Вход с другого устройства</DialogTitle>
          <DialogDescription>
            Отсканируйте QR-код на телефоне или другом устройстве, чтобы войти в свой аккаунт.
          </DialogDescription>

          <div className="flex flex-col items-center gap-4">
            <div className="relative flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-background">
              {qr.loading && (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              )}

              {!qr.loading && qr.error && (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-destructive/50" />
                  <button
                    onClick={loadQr}
                    className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Повторить
                  </button>
                </div>
              )}

              {!qr.loading && !qr.error && qr.url && (
                <QRCodeStyled
                  value={qr.url}
                  size={210}
                  qrStyle="fluid"
                  eyeRadius={[
                    [12, 12, 12, 12],
                    [12, 12, 12, 12],
                    [12, 12, 12, 12],
                  ]}
                  quietZone={12}
                  fgColor="#2b3a15"
                  bgColor="#00000000"
                  level="H"
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Код действует {qr.expiresInSeconds ? Math.floor(qr.expiresInSeconds / 60) : 5} мин и обновляется автоматически
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
