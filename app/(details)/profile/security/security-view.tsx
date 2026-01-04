'use client';

import { User, UserSession } from "@/domain/profile/types";
import { useSecurityViewModel } from "./securityViewModel";
import { LinkedAccountsCard } from "../components/linked-accounts-card";
import { SessionsList } from "../components/sessions-list";

interface Props {
  user: User;
  sessions: UserSession[];
}

export function SecurityView({ user, sessions }: Props) {
  const viewModel = useSecurityViewModel();

  return (
    <div className="space-y-8">
      {/* Карточка привязки соцсетей */}
      <LinkedAccountsCard user={user} viewModel={viewModel} />
      
      {/* Список активных сессий */}
      <SessionsList sessions={sessions} viewModel={viewModel} />
    </div>
  );
}