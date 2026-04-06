import { UserSession } from "@/domain/profile/types";
import { Button } from "@/shared/ui/button";
import {
  Laptop,
  Smartphone,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";
import { LogoutConfirmDialog } from "../../_components/logout-confirm-dialog";

interface Props {
  sessions: UserSession[];
  activeActionId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAllOthers: () => void;
}

function RevokeAllConfirmDialog({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Завершить все сессии</DialogTitle>
          <DialogDescription className="pt-2">
            Вы уверены, что хотите завершить все остальные активные сессии?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Да, завершить все
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DeviceIcon = ({ name, className }: { name: string; className?: string }) => {
  const isMobile = name.toLowerCase().includes("iphone") || name.toLowerCase().includes("android");
  const Icon = isMobile ? Smartphone : Laptop;
  return <Icon className={cn("w-5 h-5", className)} />;
};

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
  const isRevokingAll = activeActionId === "all";
  const isLoading = isRevokingThis;
  const isDisabled = isRevokingThis || isRevokingAll;

  return (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-all hover:border-border/80">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
          <DeviceIcon name={session.deviceName} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate">
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
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg shrink-0 ml-2"
        aria-label="Завершить сессию"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LogOut />
        )}
      </Button>
    </div>
  );
}

export function SessionsList({
  sessions,
  activeActionId,
  onRevokeSession,
  onRevokeAllOthers,
}: Props) {
  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const isRevokingAll = activeActionId === "all";

  return (
    <div className="space-y-8">
      {/* 1. CURRENT SESSION */}
      <div className="space-y-3">
        <h4 className="section-label">
          Текущая сессия
        </h4>
        {currentSession && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="w-12 h-12 shrink-0 rounded-xl bg-background/60 border border-primary/20 flex items-center justify-center text-primary">
              <DeviceIcon name={currentSession.deviceName} />
            </div>

            <div className="flex-1 z-10 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {currentSession.deviceName}
              </h4>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{currentSession.ip}</span>
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                <span className="text-primary font-medium text-xs">Онлайн</span>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-3xs font-bold uppercase tracking-wider shrink-0">
                  Этот браузер
                </div>
              </div>
            </div>

            <div className="z-10 ml-2">
                <LogoutConfirmDialog>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
                    >
                        Выйти
                        <LogOut className="w-4 h-4" />
                    </Button>
                </LogoutConfirmDialog>
            </div>
          </div>
        )}
      </div>

      {/* 2. OTHER SESSIONS */}
      {otherSessions.length > 0 && (
         <div className="space-y-4">
           <div className="flex items-center justify-between">
            <h3 className="section-label">
              Другие сессии
            </h3>
            <RevokeAllConfirmDialog onConfirm={onRevokeAllOthers}>
              <Button
                variant="outline"
                size="sm"
                disabled={isRevokingAll}
                className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 bg-transparent"
              >
                {isRevokingAll && (
                  <Loader2 className="mr-2 animate-spin" />
                )}
                Завершить все ({otherSessions.length})
              </Button>
            </RevokeAllConfirmDialog>
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
