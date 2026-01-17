"use client";

import { LinkedAccountsCard } from "./_components/linked-accounts-card";
import { SessionsList } from "./_components/sessions-list";
import { LinkedAccountsSkeleton, SessionsSkeleton } from "../skeletons";
import { useLinkedAccounts, useUserSessions, useSecurityMutations } from "./security.hooks";

export function SecurityView() {
  const { links, isLoading: loadingLinks } = useLinkedAccounts();
  const { sessions, isLoading: loadingSessions } = useUserSessions();
  
  const { isMutating, activeActionId, actions } = useSecurityMutations();

  return (
    <div className="space-y-8">
      
      {loadingLinks || !links ? (
        <LinkedAccountsSkeleton />
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
        <SessionsSkeleton />
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