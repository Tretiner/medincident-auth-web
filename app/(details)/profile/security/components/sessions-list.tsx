"use client";

import { UserSession } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Laptop, Smartphone, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessions: UserSession[];
  activeActionId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAllOthers: () => void;
}

// Хелпер для иконки устройства
const DeviceIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const isMobile =
    name.toLowerCase().includes("iphone") ||
    name.toLowerCase().includes("android");
  const Icon = isMobile ? Smartphone : Laptop;
  
  return <Icon className={cn("w-5 h-5", className)} />;
};

// --- КОМПОНЕНТ ОДНОЙ СЕССИИ ---
function SessionItem({
  session,
  activeActionId,
  onRevoke,
}: {
  session: UserSession,
  activeActionId: string | null,
  onRevoke: (id: string) => void,
}) {
  const isRevokingThis = activeActionId === `sess_${session.id}`;
  const isRevokingAll = activeActionId === "revoke_all";

  const isLoading = isRevokingThis;
  const isDisabled = isRevokingThis || isRevokingAll;

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-all hover:border-border/80">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
          <DeviceIcon name={session.deviceName} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="font-medium text-foreground text-sm">
            {session.deviceName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{session.ip}</span>
            <span className="text-muted-foreground/30">•</span>
            <time dateTime={new Date(session.lastActive).toISOString()}>
              {new Date(session.lastActive).toLocaleDateString("ru-RU")}
            </time>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRevoke(session.id)}
        disabled={isDisabled}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg transition-all"
        aria-label="Завершить сессию"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export function SessionsList({
  sessions,
  activeActionId,
  onRevokeSession,
  onRevokeAllOthers,
}: Props) {
  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const isRevokingAll = activeActionId === "revoke_all";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. CURRENT SESSION (Акцентная карточка) */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
          Текущее устройство
        </h4>
        {currentSession && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="w-12 h-12 rounded-xl bg-background/60 border border-primary/20 flex items-center justify-center text-primary">
              <DeviceIcon name={currentSession.deviceName} />
            </div>
            
            <div className="flex-1 z-10">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {currentSession.deviceName}
                </h4>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <span>Этот браузер</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="font-mono text-xs">{currentSession.ip}</span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-primary font-medium text-xs">Онлайн</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. OTHER SESSIONS */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
              Активные сеансы
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onRevokeAllOthers}
              disabled={isRevokingAll}
              className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 bg-transparent transition-all shadow-none"
            >
              {isRevokingAll && (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              )}
              Завершить все ({otherSessions.length})
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {otherSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                activeActionId={activeActionId}
                onRevoke={onRevokeSession}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}