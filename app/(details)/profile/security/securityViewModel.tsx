'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAccountLink, revokeSession, revokeAllOtherSessions } from "../actions";

export const useSecurityViewModel = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Храним ID активного действия, чтобы показывать лоадер на конкретной кнопке
  // "tg_link", "max_link", "revoke_all", или "sess_123"
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const performAction = (actionId: string, actionFn: () => Promise<void>) => {
    setActiveAction(actionId);
    startTransition(async () => {
      try {
        await actionFn();
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setActiveAction(null);
      }
    });
  };

  return {
    isPending,
    activeAction,
    toggleTelegram: () => performAction("tg_link", () => toggleAccountLink('telegram')),
    toggleMax: () => performAction("max_link", () => toggleAccountLink('max')),
    revokeAllOthers: () => performAction("revoke_all", revokeAllOtherSessions),
    revokeSession: (id: string) => performAction(`sess_${id}`, () => revokeSession(id)),
  };
};