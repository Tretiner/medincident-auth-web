'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/domain/profile/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { cn } from "@/lib/utils";

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
        // Базовые стили: отступы и скругление как у кнопок меню
        "flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200",
        isActive 
          ? "bg-primary/10 shadow-sm" 
          : "hover:bg-muted"
      )}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.lastName}/>
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 text-left">
          <h4 className={cn(
            "text-sm font-bold break-words leading-tight transition-all duration-200",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-xs text-muted-foreground truncate mb-0.5">
            {"Редактировать"}
          </p>
        </div>
      </div>
    </Link>
  );
}