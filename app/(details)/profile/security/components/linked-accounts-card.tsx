'use client';

import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { TelegramLogoIcon, MaxLogoIcon } from "@/presentation/components/icons/auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- ТИПЫ И КОНФИГУРАЦИЯ ---

type ProviderType = 'telegram' | 'max';

interface AccountItemProps {
  provider: ProviderType;
  isConnected: boolean;
  isLoading: boolean;
  canUnlink: boolean;
  onToggle: () => void;
}

const PROVIDER_CONFIG = {
  telegram: {
    label: "Telegram",
    icon: TelegramLogoIcon,
    gradient: "var(--telegram-gradient)",
    bgClass: "bg-brand-telegram/10",
    textClass: "text-brand-telegram"
  },
  max: {
    label: "MAX ID",
    icon: MaxLogoIcon,
    gradient: "var(--max-gradient)",
    bgClass: "bg-brand-max/10",
    textClass: "text-brand-max"
  }
};

// --- ДОЧЕРНИЙ КОМПОНЕНТ КАРТОЧКИ ---

function LinkedAccountItem({ 
  provider, 
  isConnected, 
  isLoading, 
  canUnlink, 
  onToggle 
}: AccountItemProps) {
  const config = PROVIDER_CONFIG[provider];
  const Icon = config.icon;

  // Логика отображения кнопки
  const showButton = !isConnected || canUnlink;

  return (
    <div className="flex-1 min-w-[300px] p-4 rounded-xl border border-border bg-card transition-all duration-200 flex flex-row items-center justify-between gap-4">
      
      {/* Левая часть: Иконка и Текст */}
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors",
            isConnected ? "text-white" : cn(config.bgClass, config.textClass)
          )}
          style={isConnected ? { background: config.gradient } : undefined}
        >
          <Icon className={provider === 'max' ? "w-7 h-7" : "w-6 h-6"} />
        </div>
        
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{config.label}</span>
          <span className={cn(
            "text-xs font-medium",
            isConnected ? "text-primary" : "text-muted-foreground"
          )}>
            {isConnected ? "Подключен" : "Не подключен"}
          </span>
        </div>
      </div>

      {/* Правая часть: Кнопка действия */}
      {showButton && (
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          onClick={onToggle}
          disabled={isLoading}
          className={cn(
            "font-medium shadow-none w-auto transition-all",
            isConnected 
              ? "border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              : "text-white border-0 hover:opacity-90"
          )}
          style={!isConnected ? { background: config.gradient } : undefined}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            isConnected ? "Отвязать" : "Привязать"
          )}
        </Button>
      )}
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---

interface Props {
  user: User;
  activeActionId: string | null;
  onToggleTelegram: () => void;
  onToggleMax: () => void;
}

export function LinkedAccountsCard({ user, activeActionId, onToggleTelegram, onToggleMax }: Props) {
  const { linkedAccounts } = user;
  
  // Вычисляем, можно ли отвязывать аккаунты (должен остаться хотя бы один)
  const connectedCount = (linkedAccounts.telegram ? 1 : 0) + (linkedAccounts.max ? 1 : 0);
  const canUnlink = connectedCount > 1;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Привязанные аккаунты</h3>
      
      <div className="flex flex-wrap gap-4">
        
        <LinkedAccountItem
          provider="telegram"
          isConnected={linkedAccounts.telegram}
          isLoading={activeActionId === "tg_link"}
          canUnlink={canUnlink}
          onToggle={onToggleTelegram}
        />

        <LinkedAccountItem
          provider="max"
          isConnected={linkedAccounts.max}
          isLoading={activeActionId === "max_link"}
          canUnlink={canUnlink}
          onToggle={onToggleMax}
        />

      </div>
    </div>
  );
}