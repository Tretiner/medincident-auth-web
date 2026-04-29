"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useCssVar(name: string): string {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState("");

  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    setValue(resolved);
  }, [name, resolvedTheme]);

  return value;
}
