"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { approveDeviceAction, denyDeviceAction } from "../actions";

interface DeviceApprovalFormProps {
  userCode: string;
  displayName: string;
}

export function DeviceApprovalForm({ userCode, displayName }: DeviceApprovalFormProps) {
  const [isApproving, startApprove] = useTransition();
  const [isDenying, startDeny] = useTransition();
  const busy = isApproving || isDenying;

  function handleApprove() {
    startApprove(async () => {
      try {
        await approveDeviceAction(userCode);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Ошибка подтверждения";
        toast.error(msg);
      }
    });
  }

  function handleDeny() {
    startDeny(async () => {
      try {
        await denyDeviceAction();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Ошибка";
        toast.error(msg);
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
        <Button onClick={handleApprove} disabled={busy} size="md" className="w-full">
          {isApproving ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2" />
          )}
          Подтвердить вход
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={handleDeny}
          disabled={busy}
          className="w-full"
        >
          <X className="mr-2" />
          Отмена
        </Button>
      </div>
    </div>
  );
}
