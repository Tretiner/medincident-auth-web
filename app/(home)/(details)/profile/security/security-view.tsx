"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LinkedAccountsCard } from "./_components/linked-accounts-card";
import { SessionsList } from "./_components/sessions-list";
import { useLinkedAccounts, useUserSessions, useSecurityMutations } from "./security.hooks";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SecurityViewProps {
  linkStatus?: string;
}

export function SecurityView({ linkStatus }: SecurityViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { links, isLoading: loadingLinks } = useLinkedAccounts();
  const { sessions, isLoading: loadingSessions } = useUserSessions();
  
  const { isMutating, activeActionId, actions } = useSecurityMutations();
  
  // Локальное состояние для отображения сообщения
  const [statusMessage, setStatusMessage] = useState<string | undefined>(linkStatus);

  // Очищаем URL от query-параметров при монтировании, если они есть
  useEffect(() => {
    if (linkStatus) {
      router.replace(pathname, { scroll: false });
    }
  }, [linkStatus, pathname, router]);

  // Считаем количество подключенных аккаунтов для логики canUnlink
  const connectedCount = links ? links.filter((l: any) => l.isConnected).length : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* УВЕДОМЛЕНИЯ О ПРИВЯЗКЕ */}
      {statusMessage === 'success' && (
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
            // Разрешаем отвязку, если привязано больше 1 аккаунта
            canUnlink: connectedCount > 1 
          }))}
          onToggle={actions.onToggleAccount}
        />
      )}

      {/* СЕССИИ */}
      {loadingSessions || !sessions ? (
        <div className="space-y-8">
          <div className="space-y-3">
            <h4 className="section-label">
              Текущая сессия
            </h4>
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="section-label">
                  Другие сессии
                </h3>
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <SessionsList 
          sessions={sessions}
          activeActionId={activeActionId}
          onRevokeSession={actions.onRevokeSession}
          onRevokeAllOthers={actions.onRevokeAllOthers}
        />
      )}
    </div>
  );
}