"use client";

import { useEffect, useRef } from "react";
import { AuthLoader } from "@/shared/ui/auth-loader";

export function AutoSignInForm({ action }: { action: () => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action}>
      <AuthLoader fullScreen />
    </form>
  );
}
