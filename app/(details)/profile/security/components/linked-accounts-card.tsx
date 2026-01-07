'use client';

import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { TelegramLogoIcon, MaxLogoIcon } from "@/presentation/components/icons/auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  user: User;
  viewModel: any; 
}

export function LinkedAccountsCard({ user, viewModel }: Props) {
  const { linkedAccounts } = user;
  const { activeAction, toggleTelegram, toggleMax } = viewModel;

  const connectedCount = (linkedAccounts.telegram ? 1 : 0) + (linkedAccounts.max ? 1 : 0);
  const cardBaseClass = cn(
    "flex-1 min-w-[300px]", 
    "p-4 rounded-xl border border-border bg-card transition-all duration-200",
    "flex flex-col sm:flex-row sm:items-center justify-between gap-4"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Привязанные аккаунты</h3>
      
      <div className="flex flex-wrap gap-4">
        
        {/* --- TELEGRAM --- */}
        <div className={cardBaseClass}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors",
                     linkedAccounts.telegram 
                        ? "text-white"
                        : "bg-[#229ED9]/10 text-[#229ED9]"
                )}
                style={linkedAccounts.telegram ? { background: 'var(--telegram-gradient)' } : undefined}
                >
                    <TelegramLogoIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Telegram</span>
                    <span className={cn(
                        "text-xs font-medium",
                        linkedAccounts.telegram ? "text-brand-green" : "text-muted-foreground"
                    )}>
                        {linkedAccounts.telegram ? "Подключен" : "Не подключен"}
                    </span>
                </div>
            </div>

            {(!linkedAccounts.telegram || connectedCount > 1) && (
              <Button
                  size="sm"
                  variant={linkedAccounts.telegram ? "outline" : "default"}
                  onClick={toggleTelegram}
                  disabled={!!activeAction}
                  className={cn(
                    "font-medium shadow-none w-full sm:w-auto transition-all",
                    linkedAccounts.telegram 
                      ? "border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive" // Стиль "Отвязать"
                      : "text-white border-0 hover:opacity-90"
                  )}
                  style={!linkedAccounts.telegram ? { background: "var(--telegram-gradient)" } : undefined}
              >
                  {activeAction === "tg_link" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      linkedAccounts.telegram ? "Отвязать" : "Привязать"
                  )}
              </Button>
            )}
        </div>

        {/* --- MAX ID --- */}
        <div className={cardBaseClass}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors",
                     linkedAccounts.max 
                        ? "text-white"
                        : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                )}
                style={linkedAccounts.max ? { background: 'var(--max-gradient)' } : undefined}
                >
                    <MaxLogoIcon className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">MAX ID</span>
                    <span className={cn(
                        "text-xs font-medium",
                        linkedAccounts.max ? "text-brand-green" : "text-muted-foreground"
                    )}>
                        {linkedAccounts.max ? "Подключен" : "Не подключен"}
                    </span>
                </div>
            </div>

            {(!linkedAccounts.max || connectedCount > 1) && (
              <Button
                  size="sm"
                  variant={linkedAccounts.max ? "outline" : "default"}
                  onClick={toggleMax}
                  disabled={!!activeAction}
                  className={cn(
                    "font-medium shadow-none w-full sm:w-auto transition-all",
                    linkedAccounts.max 
                      ? "border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      : "text-white border-0 hover:opacity-90"
                  )}
                  style={!linkedAccounts.max ? { background: "var(--max-gradient)" } : undefined}
              >
                  {activeAction === "max_link" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      linkedAccounts.max ? "Отвязать" : "Привязать"
                  )}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}