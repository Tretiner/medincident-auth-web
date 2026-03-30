"use client"

import { useEffect, useRef, useState } from "react";
import { QrCodeCard } from "./qr-code-card";
import { useQrAuth } from "../login.hooks";

// --- QR Component (unchanged logic, kept inline for brevity or imported) ---
export function QrAuthSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { qrUrl, isError, isLoading } = useQrAuth(isVisible);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsVisible(entry.isIntersecting),
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center w-full"
    >
      <QrCodeCard
        url={qrUrl}
        isLoading={isLoading}
        isError={isError}
        className="mb-8 bg-background/60 backdrop-blur-md border border-border border-2"
      />
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