"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export interface Props {
    provider: string, 
    redirectTo: string
}

export function AutoSignIn({ provider, redirectTo }: Props) {
  useEffect(() => {
    signIn(provider, { callbackUrl: redirectTo });
  }, [provider, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}