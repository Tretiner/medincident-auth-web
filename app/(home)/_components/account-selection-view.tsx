// app/_components/account-selection-view.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { selectAccountAction } from "../(auth)/login/callback/success/actions";

interface SessionItem {
  id: string;
  token: string;
  user?: {
    displayName?: string;
    loginName?: string;
    avatarUrl?: string;
  };
}

interface Props {
  sessions: SessionItem[];
  requestId?: string;
}

export function AccountSelectionView({ sessions, requestId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAccount = (sessionId: string, sessionToken: string) => {
    setActiveSessionId(sessionId);
    setError(null);

    startTransition(async () => {
      const result = await selectAccountAction(sessionId, sessionToken, requestId);
      
      // Если вернулась ошибка (сессия невалидна в момент сабмита)
      if (result && !result.success) {
        setError("Сессия устарела. Пожалуйста, войдите заново.");
        setActiveSessionId(null);
      }
    });
  };

  const handleAddAccount = () => {
    router.push(`/login${requestId ? `?requestId=${requestId}` : ""}`);
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="border-b border-border bg-card pb-6 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <UserRound className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary tracking-tight">
          Выберите аккаунт
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Для продолжения работы в системе
        </p>
      </CardHeader>

      <CardContent className="p-0 bg-secondary/10">
        <div className="flex flex-col">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2 border-b border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="divide-y divide-border">
            {sessions.map((session) => {
              const displayName = session.user?.displayName || "Пользователь";
              const loginName = session.user?.loginName || "Неизвестный email";
              const initials = displayName.substring(0, 2).toUpperCase();
              const isLoadingThis = activeSessionId === session.id;

              return (
                <button
                  key={session.id}
                  onClick={() => handleSelectAccount(session.id, session.token)}
                  disabled={isPending}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 transition-all text-left group",
                    isPending && !isLoadingThis ? "opacity-50 grayscale-[50%]" : "hover:bg-secondary/50"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0 border border-primary/10 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarImage src={session.user?.avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden flex flex-col gap-0.5">
                    <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {displayName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {loginName}
                    </p>
                  </div>

                  {isLoadingThis && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <Button
              variant="outline"
              onClick={handleAddAccount}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 shadow-none hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
              Сменить / Добавить аккаунт
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}