'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User as UserIcon, ShieldCheck, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { Button } from "@/presentation/components/ui/button";

export function MobileNav() {
  const pathname = usePathname();

  // Определяем активные табы
  const tabs = [
    {
      name: "Данные",
      href: "/profile/details",
      isActive: pathname === "/profile/details",
      icon: UserIcon
    },
    {
      name: "Безопасность",
      href: "/profile/security",
      isActive: pathname?.startsWith("/profile/security"),
      icon: ShieldCheck
    }
  ];

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      
      {/* Группа навигации (Табы) */}
      <div className="flex bg-muted p-1 rounded-xl flex-1 gap-1">
        {tabs.map((tab) => (
          <Link 
            key={tab.href} 
            href={tab.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-medium rounded-lg transition-all duration-200",
              // Стили активного состояния (белая плашка с тенью) vs неактивного
              tab.isActive 
                ? "bg-background text-brand-green shadow-sm" 
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <tab.icon className={cn("w-5 h-5 mb-0.5", tab.isActive && "text-brand-green")} />
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Кнопка выхода (отдельная кнопка справа) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => logout()}
        className="h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}