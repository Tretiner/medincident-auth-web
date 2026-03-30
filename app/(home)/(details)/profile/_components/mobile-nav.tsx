'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { User as UserIcon, ShieldCheck } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const getHref = (path: string) => from ? `${path}?from=${from}` : path;

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
        {tabs.map((tab) => (
          <Link 
            key={tab.href} 
            href={getHref(tab.href)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all duration-200",
              tab.isActive 
                ? "bg-card text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
             <tab.icon className={cn("w-5 h-5 mb-0.5", tab.isActive && "text-primary")} />
            {tab.name}
          </Link>
        ))}
    </div>
  );
}