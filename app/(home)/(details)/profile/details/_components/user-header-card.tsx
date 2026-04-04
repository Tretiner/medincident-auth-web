"use client";

import { useState } from "react";
import { PersonalInfo } from "@/domain/profile/types";
import { EditableAvatar } from "./editable-avatar";
import { IdCard, Check, Stethoscope, Workflow } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function UserHeaderCard({ user }: { user: PersonalInfo }) {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/20 p-5">
      <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-48 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative flex items-center gap-5">
        <div className="shrink-0">
          <div className="rounded-full p-0.5 bg-gradient-to-br from-primary/60 via-primary/30 to-transparent">
            <div className="rounded-full p-0.5 bg-background">
              <EditableAvatar currentAvatarUrl={user.avatarUrl} initials={initials} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-xl font-bold text-foreground leading-tight truncate">{fullName}</h2>

          {user.position && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
              {user.position}
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyId}
            title="Нажмите, чтобы скопировать"
            className={cn(
              "group flex items-center gap-1.5 font-mono text-xs rounded-md px-1.5 py-0.5 -ml-1.5",
              "text-muted-foreground/60 hover:text-muted-foreground hover:bg-primary/10",
              "transition-all duration-150 active:scale-95 cursor-pointer",
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5 shrink-0 text-success" /> : <></>}
            <span>{copied ? "Скопировано" : user.id}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
