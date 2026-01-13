'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShieldCheckIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(home)/(auth)/login/actions";
import { User } from "@/domain/profile/types";
import { Separator } from "@/components/ui/separator";
import { SidebarUserCard } from "./sidebar-user-card";

interface Props {
  user: User;
}

export function SidebarNav({ user }: Props) {
  const pathname = usePathname();
  const isSecurityActive = pathname?.startsWith("/profile/security");

  return (
    <nav className="flex flex-col gap-2">
      {/* 1. Мини-карточка пользователя */}
      <SidebarUserCard user={user} />

      {/* 2. Группа кнопок меню */}
      <div className="flex flex-col gap-1">
        
        {/* Кнопка Безопасность */}
        <Link href="/profile/security">
           <span className={cn(
            "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
            isSecurityActive 
              ? "bg-primary/10 text-primary shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <ShieldCheckIcon className={cn("h-5 w-5", isSecurityActive ? "text-primary" : "text-muted-foreground/70")} />
            Безопасность
          </span>
        </Link>

        {/* Разделитель перед выходом */}
        <div className="px-2 my-1">
             <Separator />
        </div>

        {/* Кнопка Выйти */}
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-medium"
          onClick={() => logout()} 
        >
          <LogOutIcon className="h-5 w-5"  />
          Выйти
        </Button>
      </div>
    </nav>
  );
}