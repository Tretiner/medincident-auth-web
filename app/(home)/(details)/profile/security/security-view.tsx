"use client";

import { useState, useTransition } from "react";
import { LinkedAccountsStatus, UserSession } from "@/domain/profile/types";
import { toggleAccountLink, revokeSession, revokeAllOtherSessions } from "../actions";
import { LinkedAccountsCard, LinkedAccountItemProps } from "./_components/linked-accounts-card";
import { SessionsList } from "./_components/sessions-list";

interface Props {
  linkedAccounts: LinkedAccountsStatus;
  sessions: UserSession[];
}

export function SecurityView({ linkedAccounts, sessions }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleAction = (id: string, action: () => Promise<any>) => {
    setActiveId(id);
    startTransition(async () => {
      await action();
      setActiveId(null);
    });
  };

  const accountItems: LinkedAccountItemProps[] = [
    {
      id: 'telegram',
      provider: 'telegram',
      isConnected: linkedAccounts.telegram,
      isLoading: isPending && activeId === 'telegram',
      canUnlink: linkedAccounts.max
    },
    {
      id: 'max',
      provider: 'max',
      isConnected: linkedAccounts.max,
      isLoading: isPending && activeId === 'max',
      canUnlink: linkedAccounts.telegram
    }
  ];

  return (
    <div className="space-y-8">
      <LinkedAccountsCard 
        items={accountItems}
        onToggle={(id) => handleAction(id, () => toggleAccountLink(id as 'telegram' | 'max'))}
      />
      
      <SessionsList 
        sessions={sessions}
        activeActionId={activeId}
        onRevokeSession={(id) => handleAction(id, () => revokeSession(id))}
        onRevokeAllOthers={() => handleAction('all', revokeAllOtherSessions)}
      />
    </div>
  );
}