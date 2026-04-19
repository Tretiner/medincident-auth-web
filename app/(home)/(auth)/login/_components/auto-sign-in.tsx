"use client";

import { useEffect, useRef } from "react";
import { AuthLoader } from "@/shared/ui/auth-loader";
import { startZitadelSignIn } from "@/services/zitadel/user/sign-in";

interface Props {
  forceLogin?: boolean;
}

export function AutoSignIn({ forceLogin }: Props = {}) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    startZitadelSignIn(forceLogin ? "login" : undefined);
  }, [forceLogin]);

  return <AuthLoader fullScreen />;
}
