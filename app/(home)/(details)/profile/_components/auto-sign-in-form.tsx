"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function AutoSignInForm({ action }: { action: () => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action} className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </form>
  );
}
