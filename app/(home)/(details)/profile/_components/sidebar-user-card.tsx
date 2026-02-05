"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProfileStore } from "../profile.store";
import { useProfileData } from "../details/profile.hooks";
import { useShallow } from 'zustand/react/shallow'

export interface Props {
  isActive: boolean;
}

export function SidebarUserCard({ isActive }: Props) {
  // 1. Запрос SWR
  const { isLoading: isApiLoading } = useProfileData();
  const user = useProfileStore(
    useShallow((state) => ({
      firstName: state.firstName,
      lastName: state.lastName,
      photoUrl: state.photoUrl
    }))
  );

  console.log("User card render:", user)

  // Логика отображения:
  const hasData = user.firstName || user.lastName;
  const showSkeleton = !hasData || isApiLoading;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200",
        isActive ? "bg-primary/10 shadow-sm" : "hover:bg-muted",
      )}
    >
      <Avatar className="h-10 w-10 relative shrink-0">
        {showSkeleton ?
          <Skeleton className="h-full w-full rounded-full" />
        : <>
            {user.photoUrl && <AvatarImage src={user.photoUrl} alt="Avatar" />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()}
            </AvatarFallback>
          </>
        }
      </Avatar>

      <div className="flex-1 min-w-0 text-left gap-0.5 flex flex-col justify-center">
        {showSkeleton ?
          <Skeleton className="h-4 w-24 mb-1" />
        : <h4
            className={cn(
              "text-sm font-bold truncate transition-all",
              isActive ? "text-primary" : (
                "text-muted-foreground group-hover:text-foreground"
              ),
            )}
          >
            {user.firstName} {user.lastName}
          </h4>
        }
        <p className="text-xs text-muted-foreground truncate">Редактировать</p>
      </div>
    </div>
  );
}
