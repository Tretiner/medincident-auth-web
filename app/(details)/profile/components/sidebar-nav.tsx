'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserIcon, ShieldCheckIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

const navItems = [
  {
    title: "Мои данные",
    href: "/profile/details",
    icon: UserIcon,
    exact: false
  },
  {
    title: "Безопасность",
    href: "/profile/security",
    icon: ShieldCheckIcon,
    exact: false
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 h-full">
      <div className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-brand-green/10 text-brand-green shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-brand-green" : "text-muted-foreground/70")} />
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Кнопка "Вернуться" */}
      <div className="mt-auto pt-6 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => window.location.href = '/login'}
        >
          <LogOutIcon className="h-5 w-5" />
          Вернуться
        </Button>
      </div>
    </nav>
  );
}