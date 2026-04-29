"use client";

import { useEffect, useRef } from "react";

interface AutoActionFormProps {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string | undefined>;
}

export function AutoActionForm({ action, fields }: AutoActionFormProps) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.requestSubmit();
  }, []);

  return (
    <form ref={ref} action={action}>
      {Object.entries(fields).map(([name, value]) =>
        value !== undefined ? (
          <input key={name} type="hidden" name={name} value={value} />
        ) : null,
      )}
    </form>
  );
}
