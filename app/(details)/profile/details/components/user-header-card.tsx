import { User } from "@/domain/profile/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";

export function UserHeaderCard({ user }: { user: User }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-none">

      <Avatar className="h-16 w-16 shadow-md">
        <AvatarImage src={user.avatarUrl} alt={user.lastName} />
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">

        <h2 className="text-xl font-bold text-foreground leading-tight">
           {user.firstName} {user.lastName}
        </h2>
        {user.position && (
            <span className="text-sm text-foreground/60 font-medium">{user.position}</span>
        )}
        <span className="inline-flex items-center rounded-md text-xs font-mono text-muted-foreground mt-0.5">
          ID: {user.id}
        </span>
      </div>
    </div>
  );
}