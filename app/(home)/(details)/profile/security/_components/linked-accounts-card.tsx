"use client";

import { Button } from "@/components/ui/button";
import { TelegramLogoIcon, MaxLogoIcon } from "@/components/icons";
import { Loader2, Link2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

// --- ТИПЫ И КОНФИГУРАЦИЯ ---

// Интерфейс элемента, который приходит из Smart-контейнера
export interface LinkedAccountItemProps {
  id: string;
  provider: 'telegram' | 'max';
  isConnected: boolean;
  isLoading: boolean;
  canUnlink: boolean;
}

interface Props {
  items: LinkedAccountItemProps[];
  onToggle: (id: string) => void;
}

const PROVIDER_CONFIG = {
  telegram: {
    label: "Telegram",
    icon: TelegramLogoIcon,
    gradient: "var(--telegram-gradient)",
    textColor: "text-brand-telegram",
    bgColor: "bg-brand-telegram/10",
  },
  max: {
    label: "MAX ID",
    icon: MaxLogoIcon,
    gradient: "var(--max-gradient)",
    textColor: "text-brand-max",
    bgColor: "bg-brand-max/10",
  }
};

// --- ДОЧЕРНИЙ КОМПОНЕНТ ---

function LinkedAccountItem({ 
  id,
  provider, 
  isConnected, 
  isLoading, 
  canUnlink, 
  onToggle 
}: LinkedAccountItemProps & { onToggle: () => void }) {
  const config = PROVIDER_CONFIG[provider];
  const Icon = config.icon;

  const showButton = !isConnected || canUnlink;

  return (
    <div className="flex-1 min-w-[300px] p-4 rounded-xl border border-border bg-card transition-all duration-200 flex items-center justify-between gap-4">
      
      {/* Левая часть */}
      <div className="flex items-center gap-4">
        <div 
          className={cn(
            "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
            isConnected ? "text-white" : cn("bg-muted text-muted-foreground")
          )}
          style={isConnected ? { background: config.gradient } : undefined}
        >
          <Icon className={provider === 'max' ? "w-7 h-7" : "w-6 h-6"} />
        </div>
        
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{config.label}</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-primary" : "bg-muted-foreground/30")} />
            <span className={cn(
              "text-xs font-medium",
              isConnected ? "text-primary" : "text-muted-foreground"
            )}>
              {isConnected ? "Подключен" : "Не подключен"}
            </span>
          </div>
        </div>
      </div>

      {/* Правая часть */}
      {showButton && (
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          onClick={onToggle}
          disabled={isLoading}
          className={cn(
            "h-8 px-3 font-medium shadow-none transition-all",
            isConnected 
              ? "border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 bg-transparent"
              : "text-white border-0 hover:opacity-90"
          )}
          style={!isConnected ? { background: config.gradient } : undefined}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            isConnected ? (
                <>
                    <Unlink className="w-4 h-4 mr-2" />
                    Отвязать
                </>
            ) : (
                <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Привязать
                </>
            )
          )}
        </Button>
      )}
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export function LinkedAccountsCard({ items, onToggle }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
        Социальные сети и сервисы
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <LinkedAccountItem
            key={item.id}
            {...item}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}