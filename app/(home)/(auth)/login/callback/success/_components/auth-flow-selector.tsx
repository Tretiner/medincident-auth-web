// app/login/callback/success/_components/auth-flow-selector.tsx
"use client";

import { useState } from "react";
import { handleLoginAction, handleLinkAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFlowSelectorProps {
  requestId?: string;
  intentId: string;
  intentToken: string;
  userId?: string;
  idpInformation: any;
}

export function AuthFlowSelector({
  requestId,
  intentId,
  intentToken,
  userId,
  idpInformation,
}: AuthFlowSelectorProps) {
  const rawInformation = idpInformation?.rawInformation;
  
  const [email, setEmail] = useState(rawInformation?.email || "");
  const [targetUserId, setTargetUserId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    if (!userId) {
      setError("Этот аккаунт еще не привязан (нет userId в URL). Используйте Регистрацию или Привязку.");
      return;
    }
    setLoading("login");
    setError(null);
    try {
      await handleLoginAction(userId, intentId, intentToken, requestId);
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  const onLink = async () => {
    if (!targetUserId) {
      setError("Укажите ID существующего пользователя");
      return;
    }
    setLoading("link");
    setError(null);
    try {
      await handleLinkAction(targetUserId, intentId, intentToken, idpInformation, requestId);
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 1. ЛОГИН */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-3">
        <div>
          <h3 className="font-bold">1. Логин (Login)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Для пользователей, которые уже привязали аккаунт.
          </p>
        </div>
        <Button className="w-full" onClick={onLogin} disabled={!!loading || !userId}>
          {loading === "login" ? "Вход..." : "Выполнить вход"}
        </Button>
      </div>

      {/* 3. ПРИВЯЗКА */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-3">
        <div>
          <h3 className="font-bold">3. Привязка (Link to existing)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Привязывает текущий вход к уже существующему аккаунту ZITADEL.
          </p>
        </div>
        <Input 
          type="text" 
          placeholder="ID существующего пользователя" 
          value={targetUserId} 
          onChange={(e) => setTargetUserId(e.target.value)}
        />
        <Button className="w-full" variant="outline" onClick={onLink} disabled={!!loading}>
          {loading === "link" ? "Привязка..." : "Привязать и войти"}
        </Button>
      </div>
    </div>
  );
}