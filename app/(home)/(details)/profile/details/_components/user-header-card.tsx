import { PersonalInfo } from "@/domain/profile/types";
import { EditableAvatar } from "./editable-avatar";

export function UserHeaderCard({ user }: { user: PersonalInfo }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-none">

      <EditableAvatar 
        currentAvatarUrl={user.avatarUrl} 
        initials={initials} 
      />

      <div className="flex flex-col gap-0.5">

        <h2 className="text-xl font-bold text-foreground leading-tight">
          {user.firstName} {user.middleName} {user.lastName}
        </h2>

        {user.position && (
            <span className="text-sm text-foreground/60 font-medium">{user.position}</span>
        )}
        
        <span className="inline-flex items-center rounded-md text-xs font-mono text-muted-foreground">
          ID: {user.id}
        </span>
      </div>
    </div>
  );
}