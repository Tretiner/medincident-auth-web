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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { logoutClient } from "@/app/(home)/(auth)/login/login.hooks";
import UAParser from "ua-parser-js";

interface Props {
  sessions: UserSession[];
  activeActionId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAllOthers: () => void;
}

// 1. Твоя утилита копирования
// 1. Кнопка копирования (без primary)
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
      className={cn("text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all shadow-none border-0", className)}
      title="Скопировать"
    >
      {isCopied ? (
        <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      <span className="sr-only">Скопировать</span>
    </Button>
  );
}

// 2. Строка деталей (серые поля)
function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
          {label}
        </span>
      </div>
      <div className="relative group flex-1 flex items-center justify-between gap-2 p-2 pl-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
        <code className={cn("text-sm break-all pr-2 text-foreground", mono && "font-mono text-xs leading-relaxed")}>
          {value}
        </code>
        <div className="shrink-0">
          <CopyButton text={value} className="w-8 h-8 opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}

// 3. Переработанная Модалка
export function SessionInfoModal({ 
  session, 
  children 
}: { 
  session: any; // Твой тип UserSession
  children: React.ReactNode 
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* bg-card для фона
        [&>button]:... убирает outline и ring у крестика закрытия 
      */}
      <DialogContent className="sm:max-w-[550px] gap-6 p-6 outline-none bg-card [&>button]:focus:ring-0 [&>button]:focus:outline-none [&>button]:focus:ring-offset-0">
        <DialogHeader>
          <div className="flex items-center gap-4 text-left mb-2">
            {/* Иконка теперь на сером фоне (bg-secondary) */}
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center text-foreground">
               <DeviceIcon name={session.deviceName} className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
                <DialogTitle className="text-xl font-bold leading-none tracking-tight text-foreground">
                  {session.deviceName}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Детали подключения
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          
          {/* USER AGENT (Сверху, занимает всю ширину) */}
          <DetailRow label="User Agent" value={session.userAgent} mono />
          
          {/* IP и АКТИВНОСТЬ (Снизу, на одной линии) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <DetailRow label="IP Адрес" value={session.ip} mono />
            
            {/* Блок активности, стилизован под DetailRow (серый фон) */}
            <div className="space-y-1.5 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                  Активность
                </span>
              </div>
              <div className="relative flex-1 flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <code className="text-sm leading-relaxed text-foreground">
                  {new Date(session.lastActive).toLocaleString("ru-RU", {
                    day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </code>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LogoutConfirmDialog({ children }: { children: React.ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutClient();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Выход из системы</DialogTitle>
          <DialogDescription className="pt-2">
            Вы уверены, что хотите завершить текущую сессию на этом устройстве?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Да, выйти
            </Button>
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
             {/* Декоративный фон */}
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

                <SessionInfoModal session={currentSession}>
                    <button 
                      className="text-primary/40 hover:text-primary transition-colors cursor-pointer outline-none p-0.5 rounded-sm"
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

            {/* === ИЗМЕНЕНИЕ: КНОПКА ВЫХОДА СПРАВА === */}
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

      {/* 2. OTHER SESSIONS (Без изменений) */}
      {otherSessions.length > 0 && (
         <div className="space-y-4">
           {/* Я скопировал логику рендера списка ниже для полноты */}
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