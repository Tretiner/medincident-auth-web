"use client";

import { LinkedAccountsCard } from "./_components/linked-accounts-card";
import { SessionsList } from "./_components/sessions-list";
import { useLinkedAccounts, useUserSessions, useSecurityMutations } from "./security.hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function SecurityView() {
  const { links, isLoading: loadingLinks } = useLinkedAccounts();
  const { sessions, isLoading: loadingSessions } = useUserSessions();
  
  const { isMutating, activeActionId, actions } = useSecurityMutations();

  return (
    <div className="space-y-8">
      
      {loadingLinks || !links ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
            Социальные сети и сервисы
          </h3>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="flex-1 min-w-[300px] h-[74px] rounded-xl" />
            <Skeleton className="flex-1 min-w-[300px] h-[74px] rounded-xl" />
          </div>
        </div>
      ) : (
        <LinkedAccountsCard 
          items={[
            {
              id: 'telegram',
              provider: 'telegram',
              isConnected: links.telegram,
              isLoading: isMutating && activeActionId === 'telegram',
              canUnlink: links.max
            },
            {
              id: 'max',
              provider: 'max',
              isConnected: links.max,
              isLoading: isMutating && activeActionId === 'max',
              canUnlink: links.telegram
            }
          ]}
          onToggle={actions.onToggleAccount}
        />
      )}

      {loadingSessions || !sessions ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
              Текущая сессия
            </h4>
            <Skeleton className="h-20 w-full rounded-xl border border-primary/10" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
                  Другие сессии
                </h3>
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <SessionsList 
          sessions={sessions}
          activeActionId={activeActionId}
          onRevokeSession={actions.onRevokeSession}
          onRevokeAllOthers={actions.onRevokeAllOthers}
        />
      )}
    </div>
  );
}