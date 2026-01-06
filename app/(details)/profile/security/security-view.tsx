'use client';

import { User, UserSession } from "@/domain/profile/types";
import { useSecurityViewModel } from "./securityViewModel";
import { LinkedAccountsCard } from "./components/linked-accounts-card";
import { SessionsList } from "./components/sessions-list";
import { Separator } from "@/presentation/components/ui/separator"; // Импорт

interface Props {
  user: User;
  sessions: UserSession[];
}

export function SecurityView({ user, sessions }: Props) {
  const viewModel = useSecurityViewModel();

  return (
    <div className="space-y-8">
      
      {/* Секция: Привязанные аккаунты */}
      <div id="linked-accounts" className="space-y-4 scroll-mt-6">
        <LinkedAccountsCard user={user} viewModel={viewModel} />
      </div>
      
      {/* Секция: Активные сессии */}
      <div id="active-sessions" className="space-y-4 scroll-mt-6">
        <SessionsList sessions={sessions} viewModel={viewModel} />
      </div>

    </div>
  );
}