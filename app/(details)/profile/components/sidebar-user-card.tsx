'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/domain/profile/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Edit2 } from "lucide-react";

interface Props {
  user: User;
}

export function SidebarUserCard({ user }: Props) {
  const pathname = usePathname();
  const isActive = pathname === '/profile/details';
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <Link href="/profile/details" className="block mb-2 group">
      <div className={cn(
        // Базовые стили: отступы и скругление как у кнопок меню, убрана граница (border)
        "flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200",
        isActive 
          ? "bg-brand-green/10 shadow-sm" // Активное состояние: зеленый фон, без обводки
          : "hover:bg-muted" // Обычное состояние: прозрачный фон, серый при наведении
      )}>
        {/* Убрали border у аватара */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.lastName}/>
          <AvatarFallback className="bg-brand-green/10 text-brand-green text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 text-left">
          <h4 className={cn(
            "text-sm font-bold break-words leading-tight transition-all duration-200",
            // Текст становится чуть ярче при наведении, если карточка не активна
            isActive ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-xs text-muted-foreground truncate mb-0.5">
            {"Редактировать"}
          </p>
          {/* <p className="text-[10px] text-muted-foreground/70 font-mono truncate">
            ID: {user.id}
          </p> */}
        </div>

        {/* Иконка редактирования */}
        {/* <div className={cn(
            "opacity-75 transition-opacity duration-200",
            !isActive && "group-hover:opacity-100"
        )}>
             <Edit2 className="w-4 h-4 text-muted-foreground" />
        </div> */}
      </div>
    </Link>
  );
}