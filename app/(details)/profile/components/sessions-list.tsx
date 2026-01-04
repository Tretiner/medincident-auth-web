'use client';

import { UserSession } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Laptop, Smartphone, Globe, LogOut, Loader2 } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import { ru } from "date-fns/locale";

interface Props {
  sessions: UserSession[];
  viewModel: any;
}

// Хелпер для иконки девайса
const DeviceIcon = ({ name }: { name: string }) => {
    if (name.toLowerCase().includes("iphone") || name.toLowerCase().includes("android")) return <Smartphone className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
};

export function SessionsList({ sessions, viewModel }: Props) {
  const { activeAction, revokeSession, revokeAllOthers } = viewModel;

  // Разделяем сессии
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-6 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Активные сессии</h3>
      </div>

      {/* 1. ТЕКУЩАЯ СЕССИЯ */}
      {currentSession && (
          <div className="p-4 rounded-2xl bg-brand-green/5 border border-brand-green/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-green shadow-sm">
                  <DeviceIcon name={currentSession.deviceName} />
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{currentSession.deviceName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-brand-green text-white text-[10px] font-bold uppercase tracking-wider">
                          Этот браузер
                      </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                      IP: {currentSession.ip} • <span className="text-green-600 font-medium">Онлайн</span>
                  </p>
              </div>
          </div>
      )}

      {/* 2. КНОПКА ВЫЙТИ ИЗ ДРУГИХ (если они есть) */}
      {otherSessions.length > 0 && (
          <div className="flex justify-end">
             <Button 
                variant="outline" 
                size="sm"
                onClick={revokeAllOthers}
                disabled={!!activeAction}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
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
                <div key={session.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                             <DeviceIcon name={session.deviceName} />
                        </div>
                        <div>
                             <h4 className="font-medium text-gray-900">{session.deviceName}</h4>
                             <p className="text-xs text-gray-500">
                                datetime from ttfffefwfe
                                {/* {formatDistanceToNow(session.lastActive, { addSuffix: true, locale: ru })} • {session.ip} */}
                             </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeSession(session.id)}
                        disabled={!!activeAction}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                         {activeAction === `sess_${session.id}` 
                            ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
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