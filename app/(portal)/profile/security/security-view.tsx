'use client';

import { User, UserSession } from "@/domain/profile/types";
import { useSecurityViewModel } from "./securityViewModel";
import { LinkedAccountsCard } from "../components/linked-accounts-card";
import { SessionsList } from "../components/sessions-list";

export function SecurityView({ user, sessions }: { user: User, sessions: UserSession[] }) {
  const viewModel = useSecurityViewModel();

  return (
    <div className="space-y-8">
      <LinkedAccountsCard user={user} viewModel={viewModel} />
      <SessionsList sessions={sessions} viewModel={viewModel} />
    </div>
  );
}