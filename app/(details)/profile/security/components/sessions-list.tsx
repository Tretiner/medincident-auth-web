'use client';

import { UserSession } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Laptop, Smartphone, LogOut, Loader2 } from "lucide-react";

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
    <div className="space-y-4">
      
    <h4 className="text-lg font-medium text-foreground">Активные сессии</h4>
      {currentSession && (
          // Brand colors -> Primary colors
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <DeviceIcon name={currentSession.deviceName} />
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{currentSession.deviceName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                         Этот браузер
                      </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                     IP: {currentSession.ip} • <span className="text-primary font-medium">Онлайн</span>
                  </p>
              </div>
          </div>
      )}

      {/* 2. ЗАГОЛОВОК "ДРУГИЕ СЕССИИ" И КНОПКА */}
      {otherSessions.length > 0 && (
          <div className="flex items-center justify-between pt-2">
             <h3 className="text-lg font-medium text-foreground">Другие сессии</h3>

             <Button 
                variant="outline" 
                size="sm"
                onClick={revokeAllOthers}
                disabled={!!activeAction}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive text-xs h-8 shadow-none"
             >
                {activeAction === "revoke_all" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Выйти из других ({otherSessions.length})
             </Button>
          </div>
      )}

      {/* 3. ИСТОРИЯ СЕССИЙ */}
      {otherSessions.length > 0 && (
        <div className="space-y-2">
            {otherSessions.map((session) => (
                <div key={session.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                             <DeviceIcon name={session.deviceName} />
                        </div>
                        <div>
                             <h4 className="font-medium text-foreground text-sm">{session.deviceName}</h4>
                             <p className="text-xs text-muted-foreground">
                                IP: {session.ip}
                             </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeSession(session.id)}
                        disabled={!!activeAction}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
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