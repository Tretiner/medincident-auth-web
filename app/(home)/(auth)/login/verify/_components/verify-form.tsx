"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { VerifyState } from "../actions";

interface Props {
  action: (state: VerifyState, formData: FormData) => Promise<VerifyState>;
  resendAction: () => Promise<void>;
  email: string;
}

export function VerifyForm({ action, resendAction, email }: Props) {
  const [state, formAction, isPending] = useActionState(action, { errors: {} });
  const router = useRouter();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Код отправлен на <span className="font-medium text-foreground">{email}</span>
      </p>

      <form action={formAction} className="space-y-5">
        {state.errors?.form && (
          <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm text-center space-y-2">
            <p>{state.errors.form}</p>
            {state.errors.expired && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Войти заново
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="code" className={cn(state.errors?.code && "text-destructive")}>
            Код подтверждения
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            disabled={isPending}
            autoComplete="one-time-code"
            className={cn(
              "text-center text-xl tracking-widest font-mono",
              state.errors?.code && "border-destructive focus-visible:ring-destructive",
              "bg-card"
            )}
          />
          {state.errors?.code && (
            <span className="text-[11px] font-medium text-destructive block text-center">
              {state.errors.code}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Подтвердить"}
        </Button>
      </form>

      <form action={resendAction} className="flex justify-center">
        <button
          type="submit"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
        >
          Отправить код повторно
        </button>
      </form>
    </div>
  );
}
