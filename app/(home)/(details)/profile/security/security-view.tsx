"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LinkedAccountsCard } from "./_components/linked-accounts-card";
import { DeviceQrSection } from "./_components/device-qr-section";
import { ChangePasswordDialog } from "./_components/change-password-dialog";
import { TotpCard } from "./_components/totp-card";
import { useLinkedAccounts, useSecurityMutations } from "./security.hooks";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SecurityViewProps {
  linkStatus?: string;
}

export function SecurityView({ linkStatus }: SecurityViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { links, isLoading: loadingLinks } = useLinkedAccounts();

  const { isMutating, activeActionId, actions } = useSecurityMutations(links);

  const [statusMessage, setStatusMessage] = useState<string | undefined>(linkStatus);

  useEffect(() => {
    if (linkStatus) {
      router.replace(pathname, { scroll: false });
    }
  }, [linkStatus, pathname, router]);

  const connectedCount = links ? links.filter((l: any) => l.isConnected).length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* УВЕДОМЛЕНИЯ О ПРИВЯЗКЕ */}
      {(statusMessage === 'success' || statusMessage === 'done') && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Аккаунт успешно привязан</p>
        </div>
      )}

      {statusMessage === 'failed' && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Не удалось привязать аккаунт. Возможно, он уже используется.</p>
        </div>
      )}

      {/* СМЕНА ПАРОЛЯ */}
      <div className="space-y-3">
        <h3 className="section-label">Пароль</h3>
        <ChangePasswordDialog />
      </div>

      {/* ДВУХФАКТОРНАЯ АУТЕНТИФИКАЦИЯ */}
      <div className="space-y-3">
        <h3 className="section-label">Двухфакторная аутентификация</h3>
        <TotpCard />
      </div>

      {/* ВХОД С ДРУГОГО УСТРОЙСТВА */}
      <div className="space-y-3">
        <h3 className="section-label">Другое устройство</h3>
        <DeviceQrSection />
      </div>

      {/* СОЦИАЛЬНЫЕ СЕТИ */}
      {loadingLinks || !links ? (
        <div className="space-y-4">
          <h3 className="section-label">
            Социальные сети и сервисы
          </h3>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="flex-1 min-w-[300px] h-[74px] rounded-xl" />
            <Skeleton className="flex-1 min-w-[300px] h-[74px] rounded-xl" />
          </div>
        </div>
      ) : (
        <LinkedAccountsCard
          items={links.map((link: any) => ({
            id: link.id,
            name: link.name,
            isConnected: link.isConnected,
            isLoading: isMutating && activeActionId === link.id,
            canUnlink: connectedCount > 1
          }))}
          onToggle={actions.onToggleAccount}
        />
      )}

    </div>
  );
}
