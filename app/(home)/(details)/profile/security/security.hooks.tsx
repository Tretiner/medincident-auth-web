'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAccountLink, revokeSession, revokeAllOtherSessions } from "../actions";
import { Result } from "@/domain/error";

export type SecurityActionId = "telegram" | "max" | "revoke_all" | `sess_${string}`;

export function useSecurity() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<SecurityActionId | null>(null);

  const runAction = (id: SecurityActionId, fn: () => Promise<Result<void>>) => {
    setActiveActionId(id);
    startTransition(async () => {
      try {
        const result = await fn();
        
        if (!result.success) {
            console.error("Action failed:", result.error.message);
        } else {
            router.refresh();
        }
      } catch (e) {
        console.error("Unexpected error in hook:", e);
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
      onToggleAccount: (id: string) => {
        if (id === 'telegram' || id === 'max') {
            runAction(id, () => toggleAccountLink(id));
        }
      },
      
      onRevokeAllOthers: () => runAction("revoke_all", revokeAllOtherSessions),
      onRevokeSession: (id: string) => runAction(`sess_${id}`, () => revokeSession(id)),
    }
  };
}