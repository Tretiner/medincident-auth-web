"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { AlertCircle, Loader2, Plus, Check } from "lucide-react";
import { AppLogoIcon } from "@/components/icons";
import { cn } from "@/shared/lib/utils";
import { selectAccountAction } from "../(auth)/login/callback/success/actions";
import { setCurrentSessionId } from "@/services/zitadel/current-session";
import { toast } from "sonner";

export interface AccountDisplayItem {
  id: string;
  token: string;
  title: string;
  subtitle: string;
  avatarUrl?: string;
  initials: string;
}

interface AccountSelectionViewProps {
  accounts: AccountDisplayItem[];
  requestId?: string;
  defaultSelectedId?: string;
  addAccountLink: string,
  localContinueLink: string;
}

export function AccountSelectionView({ accounts, requestId, defaultSelectedId, addAccountLink, localContinueLink }: AccountSelectionViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);

  const handleAddAccount = () => router.push(addAccountLink);
  
  const handleContinue = () => {
    if (!selectedId) return;
    const account = accounts.find(a => a.id === selectedId);
    if (!account) return;

    startTransition(async () => {
      try {
        if (!requestId) {
          await setCurrentSessionId(account.id);
          router.push(localContinueLink);
          return;
        }

        const result = await selectAccountAction(account.id, account.token, requestId);
        
        if (result && !result.success) {
          // Показываем красивый Toast с ошибкой
          toast.error("Ошибка авторизации", {
            description: "Сессия устарела. Пожалуйста, войдите заново.",
          });
          console.error("Zitadel Select Account Error:", result.error);
        }
      } catch (error) {
        toast.error("Системная ошибка", {
          description: "Не удалось продолжить. Попробуйте обновить страницу.",
        });
        console.error("Account selection error:", error);
      }
    });
  };

  return (
    <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-500 mx-auto min-h-[500px] flex flex-col justify-between">
      {/* Декоративные шары */}
      <div className="absolute -top-[80%] -left-[80%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[60%] -right-[60%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="flex flex-col relative z-10 py-6 sm:py-8 flex-1">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 text-primary border border-primary/20">
            <AppLogoIcon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight text-center">
            Выберите аккаунт
          </h1>
        </div>

        {/* УЗКИЙ СПИСОК (Аккаунты + Добавить) */}
        <div className="flex flex-col rounded-xl border border-border bg-card backdrop-blur-sm divide-y divide-border overflow-hidden shadow-none max-w-[480px] mx-auto w-full">
          {accounts.map((account) => {
            const isSelected = selectedId === account.id;

            return (
              <button
                key={account.id}
                onClick={() => setSelectedId(account.id)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-center gap-3 p-3 transition-all text-left",
                  "hover:bg-secondary/20",
                  isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                <Avatar className={cn(
                    "h-12 w-12 shrink-0 border transition-transform",
                    isSelected ? "border-primary/30 scale-105" : "border-primary/10"
                )}>
                  <AvatarImage src={account.avatarUrl} alt={account.title} />
                  <AvatarFallback className={cn(
                      "font-bold text-sm",
                      isSelected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                  )}>
                    {account.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <p className={cn(
                      "font-semibold text-md truncate transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {account.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {account.subtitle}
                  </p>
                </div>

                {/* КАСТОМНАЯ РАДИО-КНОПКА */}
                <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30 bg-transparent"
                )}>
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full bg-card transition-transform duration-200",
                        isSelected ? "scale-100" : "scale-0"
                    )} />
                </div>
              </button>
            );
          })}

          {/* КНОПКА "ДОБАВИТЬ АККАУНТ" ВНУТРИ ТОГО ЖЕ СПИСКА */}
          <button
            onClick={handleAddAccount}
            disabled={isPending}
            className={cn(
              "w-full flex items-center ml-1.5 gap-3 pl-3 pr-3 pt-2 pb-2 transition-all text-left hover:bg-secondary/50",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
             <div className="h-8 w-8 shrink-0 rounded-full border border-dashed border-primary/30 flex items-center justify-center bg-primary/5 text-primary transition-colors">
                <Plus className="w-4 h-4" />
             </div>
             <div className="flex-1 ml-2 font-medium text-sm text-foreground">
                Добавить другой аккаунт
             </div>
          </button>
        </div>

        {/* НИЖНИЙ БЛОК С КНОПКОЙ ПРОДОЛЖИТЬ ОТДЕЛЕН БОЛЬШИМ МАРДЖИНОМ */}
        <div className="flex justify-center mt-6 mb-4">
          <Button
            onClick={handleContinue}
            disabled={isPending || !selectedId}
            className="w-full max-w-[200px]"
          >
            {isPending ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : null}
            Продолжить
          </Button>
        </div>
        
      </div>
    </div>
  );
}