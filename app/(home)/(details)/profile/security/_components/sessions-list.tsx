import { useState } from "react";
import { UserSession } from "@/domain/profile/types";
import { Button } from "@/components/ui/button";
import { 
  Laptop, 
  Smartphone, 
  LogOut, 
  Loader2, 
  Info, 
  Copy, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Props {
  sessions: UserSession[];
  activeActionId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAllOthers: () => void;
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn("text-muted-foreground hover:text-primary transition-all", className)}
      title="Скопировать"
    >
      {isCopied ? (
        <Check className="text-green-500 animate-in zoom-in duration-300" />
      ) : (
        <Copy />
      )}
      <span className="sr-only">Скопировать</span>
    </Button>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="relative group flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
        <code className={cn("text-sm break-all pr-2", mono && "font-mono text-xs leading-relaxed")}>
          {value}
        </code>
        <div className="shrink-0">
          <CopyButton text={value} />
        </div>
      </div>
    </div>
  );
}

// 3. Переиспользуемая Модалка (Шаблон)
function SessionInfoModal({ 
  session, 
  children 
}: { 
  session: UserSession; 
  children: React.ReactNode 
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <DeviceIcon name={session.deviceName} className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-lg font-semibold leading-none">
                  {session.deviceName}
                </DialogTitle>
                <DialogDescription className="text-xs">
                    Детали подключения
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <DetailRow label="IP Адрес" value={session.ip} mono />
          
          <Separator />
          
          <DetailRow label="User Agent" value={session.userAgent} mono />
          
          <div className="text-[10px] text-muted-foreground text-center pt-2">
            Активность: {new Date(session.lastActive).toLocaleString("ru-RU")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const DeviceIcon = ({ name, className }: { name: string; className?: string }) => {
  const isMobile = name.toLowerCase().includes("iphone") || name.toLowerCase().includes("android");
  const Icon = isMobile ? Smartphone : Laptop;
  return <Icon className={cn("w-5 h-5", className)} />;
};

// --- КОМПОНЕНТ ОДНОЙ СЕССИИ (ELEMENT) ---
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
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground text-sm truncate">
              {session.deviceName}
            </h4>
            
            {/* ИСПОЛЬЗОВАНИЕ НОВОГО ШАБЛОНА */}
            <SessionInfoModal session={session}>
                <button 
                  className="text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer outline-none focus-visible:text-primary p-0.5 rounded-sm"
                  title="Показать технические данные"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span className="sr-only">Информация</span>
                </button>
            </SessionInfoModal>

          </div>
          
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
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg transition-all shrink-0 ml-2"
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

// --- ОСНОВНОЙ КОМПОНЕНТ СПИСКА ---
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
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
          Текущая сессия
        </h4>
        {currentSession && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="w-12 h-12 shrink-0 rounded-xl bg-background/60 border border-primary/20 flex items-center justify-center text-primary">
              <DeviceIcon name={currentSession.deviceName} />
            </div>
            
            <div className="flex-1 z-10 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground truncate">
                  {currentSession.deviceName}
                </h4>
                
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <span>Этот браузер</span>
                </div>

                {/* ИСПОЛЬЗОВАНИЕ НОВОГО ШАБЛОНА */}
                <SessionInfoModal session={currentSession}>
                    <button 
                      className="text-primary/40 hover:text-primary transition-colors cursor-pointer outline-none ml-1 p-0.5 rounded-sm"
                      title="Показать технические данные"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                </SessionInfoModal>

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
              Другие сессии
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