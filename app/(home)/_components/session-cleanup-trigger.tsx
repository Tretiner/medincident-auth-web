"use client";

import { useEffect } from "react";
import { cleanupDeadSessionCookies } from "@/services/zitadel/sync-sessions";

export function SessionCleanupTrigger() {
  useEffect(() => {
    cleanupDeadSessionCookies();
  }, []);
  return null;
}
