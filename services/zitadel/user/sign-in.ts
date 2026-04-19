"use client";

import { signIn } from "next-auth/react";

type Prompt = "login" | "select_account" | "none" | "consent";

/**
 * Запускает новый OIDC flow через Zitadel → создаётся свежий authRequest
 * с новым requestId. callbackUrl зафиксирован на /profile.
 *
 * @param prompt — OIDC prompt параметр. "login" для форс-логина (добавление аккаунта).
 */
export function startZitadelSignIn(prompt?: Prompt) {
  return signIn(
    "zitadel",
    { callbackUrl: "/profile" },
    prompt ? { prompt } : undefined,
  );
}
