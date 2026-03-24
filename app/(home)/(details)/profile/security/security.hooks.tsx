'use client';

import { useState, useTransition } from "react";
import useSWR, { useSWRConfig } from "swr";
import { LinkedAccountsStatus, UserSession } from "@/domain/profile/types";

// Импортируем наши новые Server Actions
import { 
  getSessionsAction, 
  getLinkedAccountsAction, 
  revokeSessionAction, 
  revokeAllOthersAction, 
  toggleLinkedAccountAction, 
  linkProvider
} from "./security.actions";

const KEYS = {
  LINKS: "profile-links", // теперь это просто ключи для SWR, а не URL
  SESSIONS: "profile-sessions",
};

export function useLinkedAccounts() {
  // SWR теперь вызывает Server Action вместо fetch
  const { data, error, isLoading } = useSWR(KEYS.LINKS, getLinkedAccountsAction);
  return { links: data, isLoading, isError: error };
}

export function useUserSessions() {
  const { data, error, isLoading } = useSWR(KEYS.SESSIONS, getSessionsAction);
  return { sessions: data, isLoading, isError: error };
}

export type SecurityActionId = "telegram" | "max" | "revoke_all" | `sess_${string}`;

export function useSecurityMutations() {
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<SecurityActionId | null>(null);

  // Чтобы знать текущий статус привязки (нужно для toggle-экшена)
  const { links } = useLinkedAccounts();

  const runAction = (
    id: SecurityActionId, 
    actionFn: () => Promise<any>,
    keysToInvalidate: string[]
  ) => {
    setActiveActionId(id);
    startTransition(async () => {
      try {
        const result = await actionFn();

        if (!result) {
          return;
        }

        // В остальных случаях (отвязка, удаление сессий) просто обновляем UI
        if (result.success) {
            await Promise.all(keysToInvalidate.map(key => mutate(key)));
        } else {
            console.error("Action failed:", result.error);
        }
      } catch (e) {
         console.error("Unexpected error:", e);
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return {
    isMutating: isPending,
    activeActionId,
    actions: {
      onToggleAccount: (provider: string) => {
        const isConnected = links ? (links as any)[provider] : false;
        
        runAction(
            provider as SecurityActionId, 
            () => isConnected ? toggleLinkedAccountAction(provider, isConnected) : linkProvider(provider),
            [KEYS.LINKS]
        );
      },
      
      onRevokeAllOthers: () => 
          runAction("revoke_all", revokeAllOthersAction, [KEYS.SESSIONS]),

      onRevokeSession: (id: string) => 
          runAction(`sess_${id}`, () => revokeSessionAction(id), [KEYS.SESSIONS]),
    }
  };
}