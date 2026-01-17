'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // [!code ++]
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // [!code ++]
import { cn } from "@/lib/utils";
import { useProfileData } from "../details/profile.hooks";

export function SidebarUserCard() {
  const { user, isLoading } = useProfileData();
  const pathname = usePathname();
  const isActive = pathname === '/profile/details';

  const [isImageLoading, setIsImageLoading] = useState(true);

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-2">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            Редактировать
          </p>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

  return (
    <Link href="/profile/details" className="block mb-2 group">
      <div className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200",
        isActive 
          ? "bg-primary/10 shadow-sm" 
          : "hover:bg-muted"
      )}>
        
        <Avatar className="h-10 w-10 relative">
          
          {isImageLoading && user.avatarUrl && (
             <Skeleton className="h-full w-full rounded-full absolute inset-0 z-10" />
          )}

          <AvatarImage 
            src={user.avatarUrl} 
            alt={user.lastName}
            onLoadingStatusChange={(status) => {
               if (status !== 'loading') {
                 setIsImageLoading(false);
               }
            }}
          />
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
            Редактировать
          </p>
        </div>
      </div>
    </Link>
  );
}