"use client";

import { signIn } from "next-auth/react";

type Prompt = "login" | "select_account" | "none" | "consent";

export function startZitadelSignIn(prompt?: Prompt) {
  return signIn(
    "zitadel",
    { callbackUrl: "/profile" },
    prompt ? { prompt } : undefined,
  );
}
