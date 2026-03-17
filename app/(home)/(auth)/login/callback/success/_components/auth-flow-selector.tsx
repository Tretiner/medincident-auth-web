// app/login/callback/success/_components/auth-flow-selector.tsx
"use client";

import { useState } from "react";
import { handleLoginAction, handleRegisterAction, handleLinkAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFlowSelectorProps {
  intentId: string;
  intentToken: string;
  userId?: string;
  idpInformation: any;
}

export function AuthFlowSelector({
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
      await handleLoginAction(userId, intentId, intentToken);
    } catch (e: any) {
      setError(e.message);
      setLoading(null);
    }
  };

  const onRegister = async () => {
    if (!email || !email.includes("@")) {
      setError("Укажите корректный email для регистрации");
      return;
    }
    setLoading("register");
    setError(null);
    try {
      const nameString = rawInformation?.name?.trim() || idpInformation?.userName?.trim() || "Пользователь";
      const [givenName, ...familyNames] = nameString.split(/\s+/);
      const familyName = familyNames.join(" ") || "Господин Абрамович";
    
      const requestBody = rawInformation.User ? rawInformation.User : {
        username: rawInformation.preferred_username,
        profile: {
          givenName: givenName,
          familyName: familyName,
          preferredLanguage: rawInformation.preferredLanguage === "und" ? "ru" : (rawInformation.preferredLanguage || "ru"),
        },
        email: { 
          email: email, 
          isVerified: false 
        },
        idpLinks: [
          {
            idpId: idpInformation.idpId,
            userId: idpInformation.userId,
            userName: idpInformation.userName,
          }
        ]
      };
      console.log("Request body for createHumanUser:", JSON.stringify(requestBody, null, 2));
      await handleRegisterAction(intentId, intentToken, requestBody);
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
      await handleLinkAction(targetUserId, intentId, intentToken, idpInformation);
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

      {/* 2. РЕГИСТРАЦИЯ */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-3">
        <div>
          <h3 className="font-bold">2. Регистрация (Register)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Создает нового пользователя. Укажите email (если провайдер его не передал).
          </p>
        </div>
        <Input 
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button className="w-full" variant="secondary" onClick={onRegister} disabled={!!loading}>
          {loading === "register" ? "Регистрация..." : "Зарегистрировать и войти"}
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