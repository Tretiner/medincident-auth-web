"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { confirmQrAction } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QrConfirmFormProps {
  userCode: string;
  displayName: string;
}

export function QrConfirmForm({ userCode, displayName }: QrConfirmFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await confirmQrAction(userCode);
      } catch (e: any) {
        toast.error(e?.message ?? "Ошибка подтверждения");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-sm">Вы входите как</p>
        <p className="text-lg font-semibold text-foreground">{displayName}</p>
      </div>

      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Разрешить вход в ваш аккаунт с другого устройства?
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <Button
          onClick={handleConfirm}
          disabled={isPending}
          size="md"
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="mr-2" />
          )}
          Подтвердить вход
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/profile")}
          disabled={isPending}
          className="w-full"
        >
          <X className="mr-2" />
          Отмена
        </Button>
      </div>
    </div>
  );
}
