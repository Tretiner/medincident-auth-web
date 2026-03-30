"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { ShieldCheckIcon, LogOutIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { logoutClient } from "@/app/(home)/(auth)/login/login.hooks";
import { Separator } from "@/shared/ui/separator";
import { SidebarUserCard } from "./sidebar-user-card";

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const getHref = (path: string) => (from ? `${path}?from=${from}` : path);

  const isDetailsActive = pathname?.startsWith("/profile/details");
  const isSecurityActive = pathname?.startsWith("/profile/security");

  return (
    <nav className="flex flex-col gap-2 h-full">
      <Link href={getHref("/profile/details")} className="block group">
        <SidebarUserCard isActive={isDetailsActive} />
      </Link>

      <div className="flex flex-col gap-1">
        <Link href={getHref("/profile/security")}>
          <span
            className={cn(
              "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              isSecurityActive ?
                "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ShieldCheckIcon
              className={cn(
                "h-5 w-5",
                isSecurityActive ? "text-primary" : "text-muted-foreground/70",
              )}
            />
            Безопасность
          </span>
        </Link>

        <div className="px-2 my-1">
          <Separator />
        </div>

        {from && (
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground rounded-xl font-medium hover:bg-muted hover:text-primary"
          >
            <Link href={from}>
              <ArrowLeft className="h-5 w-5" />
              Вернуться
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-medium"
          onClick={() => logoutClient()}
        >
          <LogOutIcon className="h-5 w-5" />
          Выйти
        </Button>
      </div>
    </nav>
  );
}
