"use client";

import { SessionsList } from "../security/_components/sessions-list";
import { useUserSessions, useSecurityMutations } from "../security/security.hooks";
import { Skeleton } from "@/shared/ui/skeleton";

export function SessionsView() {
  const { sessions, isLoading: loadingSessions } = useUserSessions();
  const { activeActionId, actions } = useSecurityMutations(undefined);

  if (loadingSessions || !sessions) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-3">
          <h4 className="section-label">Текущая сессия</h4>
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-label">Другие сессии</h3>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <SessionsList
        sessions={sessions}
        activeActionId={activeActionId}
        onRevokeSession={actions.onRevokeSession}
        onRevokeAllOthers={actions.onRevokeAllOthers}
      />
    </div>
  );
}
