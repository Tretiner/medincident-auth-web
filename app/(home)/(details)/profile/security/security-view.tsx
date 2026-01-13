'use client';

import { User, UserSession } from "@/domain/profile/types";
import { useSecurity } from "./security.hooks";
import { LinkedAccountsCard } from "./_components/linked-accounts-card";
import { SessionsList } from "./_components/sessions-list";

interface Props {
  user: User;
  sessions: UserSession[];
}

export function SecurityView({ user, sessions }: Props) {
  const { state, actions } = useSecurity();

  return (
    <div className="space-y-8">
      
      <div id="linked-accounts" className="space-y-4 scroll-mt-6">
        <LinkedAccountsCard 
            user={user} 
            activeActionId={state.activeActionId}
            onToggleTelegram={actions.onToggleTelegram}
            onToggleMax={actions.onToggleMax}
        />
      </div>
      
      <div id="active-sessions" className="space-y-4 scroll-mt-6">
        <SessionsList 
            sessions={sessions} 
            activeActionId={state.activeActionId}
            onRevokeSession={actions.onRevokeSession}
            onRevokeAllOthers={actions.onRevokeAllOthers}
        />
      </div>

    </div>
  );
}