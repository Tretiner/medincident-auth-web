'use client';

import { UserSession } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Laptop, Smartphone, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessions: UserSession[];
  activeActionId: string | null;
  onRevokeSession: (id: string) => void;
  onRevokeAllOthers: () => void;
}

// Хелпер для иконки устройства
const DeviceIcon = ({ name }: { name: string }) => {
    const isMobile = name.toLowerCase().includes("iphone") || name.toLowerCase().includes("android");
    return isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />;
};

// --- КОМПОНЕНТ ОДНОЙ СЕССИИ ---
function SessionItem({ 
  session, 
  activeActionId, 
  onRevoke 
}: { 
  session: UserSession, 
  activeActionId: string | null,
  onRevoke: (id: string) => void
}) {
  // Определяем, происходит ли действие именно с ЭТОЙ сессией или глобальный сброс
  const isRevokingThis = activeActionId === `sess_${session.id}`;
  const isRevokingAll = activeActionId === "revoke_all";
  
  // Блокируем кнопку только если трогаем сессии. 
  // Если юзер вяжет Telegram (id="tg_link"), эта кнопка не должна "мигать" (становиться disabled).
  const isLoading = isRevokingThis;
  const isDisabled = isRevokingThis || isRevokingAll;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-all duration-200">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
               <DeviceIcon name={session.deviceName} />
          </div>
           <div className="flex flex-col">
               <h4 className="font-medium text-foreground text-sm">{session.deviceName}</h4>
               <div className="flex items-center gap-2">
                 <p className="text-xs text-muted-foreground">IP: {session.ip}</p>
                 <span className="text-[10px] text-muted-foreground/50">•</span>
                 <p className="text-xs text-muted-foreground">
                    {/* Форматирование даты, если нужно, или просто lastActive */}
                    {new Date(session.lastActive).toLocaleDateString('ru-RU')}
                 </p>
               </div>
          </div>
      </div>

      <Button
          variant="ghost"
          size="icon"
          onClick={() => onRevoke(session.id)}
          disabled={isDisabled}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg transition-all"
      >
            {isLoading 
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogOut className="w-4 h-4" />
            }
      </Button>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export function SessionsList({ sessions, activeActionId, onRevokeSession, onRevokeAllOthers }: Props) {
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  // Логика блокировки кнопки "Выйти со всех"
  const isRevokingAll = activeActionId === "revoke_all";

  return (
    <div className="space-y-6">
      
      {/* 1. CURRENT SESSION (Акцентная карточка) */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-foreground">Текущая сессия</h4>
        {currentSession && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-primary/10">
                   <DeviceIcon name={currentSession.deviceName} />
                </div>
                <div className="flex-1">
                    {/* <div className="flex items-center gap-2"> */}
                        <h4 className="font-semibold text-foreground">{currentSession.deviceName}</h4>
                        {/* <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                           Этот браузер
                        </span> */}
                    {/* </div> */}
                    <p className="text-sm text-muted-foreground mt-0.5">
                       IP: {currentSession.ip} • <span className="text-primary font-medium">Онлайн</span>
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* 2. OTHER SESSIONS */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-medium text-foreground">Другие сессии</h3>
             <Button 
                variant="outline" 
                size="sm"
                onClick={onRevokeAllOthers}
                disabled={isRevokingAll} 
                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive text-xs h-8 shadow-none bg-transparent"
             >
                {isRevokingAll && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
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