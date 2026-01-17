'use client';

import { useState, useTransition } from "react";
import useSWR, { useSWRConfig } from "swr"; // [!IMPORT]
import { handleFetch } from "@/lib/fetch-helper";
import { LinkedAccountsStatus, UserSession } from "@/domain/profile/types";
import { z } from "zod";

const KEYS = {
  LINKS: "/api/profile/me/links",
  SESSIONS: "/api/profile/sessions",
};

const fetchSessions = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    const data: UserSession[] = await res.json();
    return data.map(s => ({ ...s, lastActive: new Date(s.lastActive) }));
};

const fetchLinks = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<LinkedAccountsStatus>;
};

export function useLinkedAccounts() {
  const { data, error, isLoading } = useSWR(KEYS.LINKS, fetchLinks);
  return { links: data, isLoading, isError: error };
}

export function useUserSessions() {
  const { data, error, isLoading } = useSWR(KEYS.SESSIONS, fetchSessions);
  return { sessions: data, isLoading, isError: error };
}

export type SecurityActionId = "telegram" | "max" | "revoke_all" | `sess_${string}`;
const SuccessSchema = z.object({ success: z.boolean() }).loose();

export function useSecurityMutations() {
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<SecurityActionId | null>(null);

  const runAction = (
    id: SecurityActionId, 
    requestFn: () => Promise<any>,
    keysToInvalidate: string[]
  ) => {
    setActiveActionId(id);
    startTransition(async () => {
      try {
        const result = await requestFn();
        if (!result.success) {
            console.error("Action failed:", result.error?.message);
        } else {
            await Promise.all(keysToInvalidate.map(key => mutate(key)));
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
        runAction(
            provider as SecurityActionId, 
            () => handleFetch(() => fetch(KEYS.LINKS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider })
            }), SuccessSchema),
            [KEYS.LINKS]
        );
      },
      
      onRevokeAllOthers: () => 
          runAction(
            "revoke_all", 
            () => handleFetch(() => fetch(`${KEYS.SESSIONS}?type=revoke_all`, {
                method: "DELETE"
            }), SuccessSchema),
            [KEYS.SESSIONS]
          ),

      onRevokeSession: (id: string) => 
          runAction(
            `sess_${id}`, 
            () => handleFetch(() => fetch(`${KEYS.SESSIONS}?id=${id}`, {
                method: "DELETE"
            }), SuccessSchema),
            [KEYS.SESSIONS]
          ),
    }
  };
}