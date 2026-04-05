"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export interface Props {
    provider: string;
    redirectTo: string;
    forceLogin?: boolean;
}

export function AutoSignIn({ provider, redirectTo, forceLogin }: Props) {
  useEffect(() => {
    const options: Record<string, string> = { callbackUrl: redirectTo };
    if (forceLogin) {
      options.prompt = "login";
    }

    signIn(provider, options);
  }, [provider, redirectTo, forceLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
