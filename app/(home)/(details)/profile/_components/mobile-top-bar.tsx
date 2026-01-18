"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutClient } from "@/app/(home)/(auth)/login/login.hooks";
import { AppLogoIcon } from "@/components/icons";

export function MobileTopBar() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="flex items-center justify-between px-4 py-2 h-14">
      <div className="flex items-center">
        {from ? (
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
            <Link href={from}>
              <ArrowLeft className="w-5 h-5 mr-1" />
              Назад
            </Link>
          </Button>
        ) : (
          <div className="text-primary/20">
             <AppLogoIcon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => logoutClient()}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
      >
        <span className="text-xs font-medium mr-2">Выйти</span>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}