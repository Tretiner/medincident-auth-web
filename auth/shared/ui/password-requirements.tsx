"use client";

import { cn } from "@/shared/lib/utils";
import { Check, X } from "lucide-react";

interface Rule {
  label: string;
  test: (password: string) => boolean;
}

const rules: Rule[] = [
  {
    label: "Не менее 8 символов",
    test: (p) => p.length >= 8,
  },
  {
    label: "Не более 70 символов",
    test: (p) => p.length <= 70,
  },
  {
    label: "Содержит заглавную букву",
    test: (p) => /[A-ZА-ЯЁ]/.test(p),
  },
  {
    label: "Содержит строчную букву",
    test: (p) => /[a-zа-яё]/.test(p),
  },
  {
    label: "Содержит цифру",
    test: (p) => /\d/.test(p),
  },
  {
    label: "Содержит символ или знак пунктуации",
    test: (p) => /[^a-zA-Zа-яА-ЯёЁ0-9\s]/.test(p),
  },
];

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  return (
    <ul className={cn("space-y-1", className)}>
      {rules.map((rule) => {
        const passed = password.length > 0 && rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-2xs transition-colors",
              password.length === 0
                ? "text-muted-foreground"
                : passed
                  ? "text-success"
                  : "text-destructive"
            )}
          >
            {password.length === 0 ? (
              <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
            ) : passed ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export function validatePassword(password: string): boolean {
  return rules.every((rule) => rule.test(password));
}
