import { User } from "@/domain/profile/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";

export function UserHeaderCard({ user }: { user: User }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border mb-8">
      {/* Слева аватарка */}
      <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
        <AvatarImage src={user.avatarUrl} alt={user.lastName} />
        <AvatarFallback className="bg-brand-green/10 text-brand-green text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Справа инфо */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {user.firstName} {user.lastName}
        </h2>
        {user.position && (
            <span className="text-sm text-muted-foreground font-medium mb-1">{user.position}</span>
        )}
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground w-fit border border-border mt-1">
          ID: {user.id}
        </div>
      </div>
    </div>
  );
}