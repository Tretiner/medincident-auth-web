'use client';

import { UserSession } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Laptop, Smartphone, LogOut, Loader2 } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import { ru } from "date-fns/locale";

interface Props {
  sessions: UserSession[];
  viewModel: any;
}

const DeviceIcon = ({ name }: { name: string }) => {
    if (name.toLowerCase().includes("iphone") || name.toLowerCase().includes("android")) return <Smartphone className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
};

export function SessionsList({ sessions, viewModel }: Props) {
  const { activeAction, revokeSession, revokeAllOthers } = viewModel;

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Активные сессии</h3>
      </div>

      {/* 1. ТЕКУЩАЯ СЕССИЯ */}
      {currentSession && (
          <div className="p-4 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-brand-green shadow-sm border border-brand-green/10">
                  <DeviceIcon name={currentSession.deviceName} />
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{currentSession.deviceName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-brand-green text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Этот браузер
                      </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                      IP: {currentSession.ip} • <span className="text-brand-green font-medium">Онлайн</span>
                  </p>
              </div>
          </div>
      )}

      {/* 2. КНОПКА ВЫЙТИ ИЗ ДРУГИХ */}
      {otherSessions.length > 0 && (
          <div className="flex justify-end">
             <Button 
                variant="outline" 
                size="sm"
                onClick={revokeAllOthers}
                disabled={!!activeAction}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
             >
                {activeAction === "revoke_all" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Выйти из других сессий ({otherSessions.length})
             </Button>
          </div>
      )}

      {/* 3. ИСТОРИЯ СЕССИЙ */}
      {otherSessions.length > 0 && (
        <div className="space-y-3">
            {otherSessions.map((session) => (
                <div key={session.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                             <DeviceIcon name={session.deviceName} />
                        </div>
                        <div>
                             <h4 className="font-medium text-foreground">{session.deviceName}</h4>
                             <p className="text-xs text-muted-foreground">
                                datetime from string
                                {/* {formatDistanceToNow(session.lastActive, { addSuffix: true, locale: ru })} • {session.ip} */}
                             </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeSession(session.id)}
                        disabled={!!activeAction}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                          {activeAction === `sess_${session.id}` 
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <LogOut className="w-4 h-4" />
                          }
                    </Button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}