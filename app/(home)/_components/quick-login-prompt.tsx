"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { AccountSelectionView } from "./account-selection-view";
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
  currentSession: SessionItem;
  sessions: SessionItem[];
  requestId: string;
}

export function QuickLoginPrompt({ currentSession, sessions, requestId }: Props) {
  const [showList, setShowList] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Если пользователь решил выбрать другой аккаунт
  if (showList) {
    return (
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => setShowList(false)} 
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <AccountSelectionView sessions={sessions} requestId={requestId} />
      </div>
    );
  }

  const displayName = currentSession.user?.displayName || "Пользователь";
  const loginName = currentSession.user?.loginName || "Неизвестный email";
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleContinue = () => {
    startTransition(() => {
      selectAccountAction(currentSession.id, currentSession.token, requestId);
    });
  };

  return (
    <Card className="w-full max-w-sm shadow-lg border-border animate-in fade-in zoom-in-95 duration-500 text-center">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Продолжить вход?</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-20 w-20 border shadow-sm">
            <AvatarImage src={currentSession.user?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-lg">{displayName}</p>
            <p className="text-sm text-muted-foreground">{loginName}</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleContinue} 
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            Продолжить как {displayName.split(" ")[0]}
          </Button>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowList(true)}
            disabled={isPending}
          >
            Выбрать другой аккаунт
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}