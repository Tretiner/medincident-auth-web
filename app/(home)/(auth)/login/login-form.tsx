"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLogoIcon, MaxLogoIcon, TelegramLogoIcon } from "@/components/icons";
import { APP_NAME } from "@/lib/constants";
import { QrCodeCard } from "./_components/qr-code-card";
import { useQrAuth } from "./login.hooks";
import { useEffect, useRef, useState } from "react";

// --- QR Component (unchanged logic, kept inline for brevity or imported) ---
function QrAuthSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { qrUrl, isError, isLoading } = useQrAuth(isVisible);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 flex flex-col items-center w-full">
      <QrCodeCard url={qrUrl} isLoading={isLoading} isError={isError} className="mb-8 shadow-sm bg-background/60 backdrop-blur-md border border-border" />
      <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Вход по QR-коду</h2>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        Наведите камеру телефона на код,<br />чтобы войти мгновенно.
      </p>
    </div>
  );
}

// --- Modified Buttons to be Links ---
interface AuthLinkProps {
  href: string;
}

const TelegramLink = ({ href }: AuthLinkProps) => (
  <Button asChild variant="telegram" size="lg" className="w-full relative py-6 text-base group shadow-none transition-transform active:scale-[0.98]">
    <Link href={href} prefetch={false}>
      <TelegramLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">Войти через Telegram</span>
    </Link>
  </Button>
);

const MaxLink = ({ href }: AuthLinkProps) => (
  <Button asChild variant="max" size="lg" className="w-full relative py-6 text-base group shadow-none transition-transform active:scale-[0.98]">
    <Link href={href} prefetch={false}>
      <MaxLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">Войти через MAX</span>
    </Link>
  </Button>
);

interface Props {
  searchParams: Record<string, string>;
}

export function LoginForm({ searchParams }: Props) {
  const createLink = (provider: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("provider", provider);
    return `?${params.toString()}`;
  };

  return (
    <Card className="w-full max-w-[960px] overflow-hidden rounded-xl shadow-none border border-border bg-card grid grid-cols-1 md:grid-cols-2 animate-in fade-in duration-500">
      {/* LEFT COLUMN */}
      <div className="hidden md:flex relative flex-col items-center justify-center text-center p-12 overflow-hidden border-r border-border bg-primary/5">
        <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-[40%] -right-[50%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-xl pointer-events-none" />
        <QrAuthSection />
      </div>

      {/* RIGHT COLUMN */}
      <CardContent className="p-6 sm:p-8 md:p-12 flex flex-col justify-center min-h-[450px] md:min-h-auto">
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 text-primary shadow-none border border-primary/20">
            <AppLogoIcon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center md:text-left">
            Вход в {APP_NAME}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base text-center md:text-left">
            Единый аккаунт для всех медицинских сервисов
          </p>
        </div>

        <div className="space-y-4 md:space-y-6 w-full">
          <div className="grid gap-2 md:gap-3">
            <TelegramLink href={createLink("telegram")} />
            <MaxLink href={createLink("max")} />
          </div>
        </div>

        <p className="mt-6 md:mt-8 text-center text-xs text-muted-foreground leading-relaxed px-2 md:px-0">
          Нажимая на кнопки входа, вы принимаете{" "}
          <Link href="#" className="text-primary hover:underline font-medium transition-colors">
            пользовательское соглашение
          </Link>{" "}
          и{" "}
          <Link href="#" className="text-primary hover:underline font-medium transition-colors">
            политику конфиденциальности
          </Link>{" "}
          сервиса {APP_NAME}.
        </p>
      </CardContent>
    </Card>
  );
}