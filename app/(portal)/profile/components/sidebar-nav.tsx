'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Утилита shadcn для классов
import { UserIcon, ShieldCheckIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

const navItems = [
  {
    title: "Мои данные",
    href: "/profile/details", // <--- Было "/profile", стало "/profile/details"
    icon: UserIcon,
    exact: false // Теперь можно false, так как это отдельный сегмент
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
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-brand-green" : "text-gray-400")} />
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Кнопка "Вернуться" в самом низу */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-gray-500 hover:text-red-500 hover:bg-red-50"
          onClick={() => window.location.href = '/login'} // Или router.back(), как вы хотите
        >
          <LogOutIcon className="h-5 w-5" />
          Вернуться
        </Button>
      </div>
    </nav>
  );
}