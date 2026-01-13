'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAccountLink, revokeSession, revokeAllOtherSessions } from "../actions";

export type SecurityActionId = "tg_link" | "max_link" | "revoke_all" | `sess_${string}`;

export function useSecurity() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<SecurityActionId | null>(null);

  // Generic wrapper to handle transition state
  const runAction = (id: SecurityActionId, fn: () => Promise<void>) => {
    setActiveActionId(id);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return {
    state: {
      isLoading: isPending,
      activeActionId,
    },
    actions: {
      onToggleTelegram: () => runAction("tg_link", () => toggleAccountLink('telegram')),
      onToggleMax: () => runAction("max_link", () => toggleAccountLink('max')),
      onRevokeAllOthers: () => runAction("revoke_all", revokeAllOtherSessions),
      onRevokeSession: (id: string) => runAction(`sess_${id}`, () => revokeSession(id)),
    }
  };
}