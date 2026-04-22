"use client";

import { ReactNode, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  children?: (state: { copied: boolean }) => ReactNode;
}

export function CopyButton({ text, className, children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (children) {
    return (
      <button type="button" onClick={handleCopy} className={className}>
        {children({ copied })}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-6 px-2 gap-1 text-3xs [&_svg]:size-3.5",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="text-success animate-in zoom-in duration-300" />
          Скопировано
        </>
      ) : (
        <>
          <Copy />
          Скопировать
        </>
      )}
    </Button>
  );
}
