"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaxLogoIcon, TelegramLogoIcon } from "@/components/icons";
import { useSearchParams } from "next/navigation";

interface AuthLinkProps {
  href: string;
}

const TelegramLink = ({ href }: AuthLinkProps) => (
  <Button
    asChild
    variant="telegram"
    size="lg"
    className="w-full relative py-6 text-base group shadow-none transition-transform active:scale-[0.98]"
  >
    <Link href={href} prefetch={false}>
      <TelegramLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">Войти через Telegram</span>
    </Link>
  </Button>
);

const MaxLink = ({ href }: AuthLinkProps) => (
  <Button
    asChild
    variant="max"
    size="lg"
    className="w-full relative py-6 text-base group shadow-none transition-transform active:scale-[0.98]"
  >
    <Link href={href} prefetch={false}>
      <MaxLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">Войти через MAX</span>
    </Link>
  </Button>
);

export function SocialLinks() {
  const searchParams = useSearchParams();

  const createLink = (provider: string) => {
    const queryString = searchParams.toString();
    return `/login/${provider}${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="grid gap-2 md:gap-3">
      <TelegramLink href={createLink("telegram")} />
      <MaxLink href={createLink("max")} />
    </div>
  );
}
