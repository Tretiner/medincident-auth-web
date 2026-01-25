import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRightLeft, Loader2, ShieldAlert } from "lucide-react";
import { AppLogoIcon } from "@/components/icons";
import type { CheckConsentResponse } from "@/domain/consent/schema";

interface ConsentCardProps {
  clientName: string;
  clientLogo?: string;
  scopes: CheckConsentResponse["scopes"];
  hostname: string;
  isConsenting: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function ConsentCard({
  clientName,
  clientLogo,
  scopes,
  hostname,
  isConsenting,
  onAllow,
  onDeny,
}: ConsentCardProps) {
  return (
    <Card className="w-full max-w-[440px] shadow-lg border-border bg-card animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER */}
      <CardHeader className="pt-8 pb-2 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6 relative">
          {/* Service Logo (Medsafety) */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-card shadow-sm text-primary">
              <AppLogoIcon className="w-8 h-8" />
            </div>
          </div>

          {/* Connection Icon */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 text-muted-foreground/30">
            <ArrowRightLeft className="w-8 h-8" />
          </div>

          {/* Client App Logo */}
          <div className="relative z-10">
            <Avatar className="w-16 h-16 border-4 border-card shadow-sm rounded-xl">
              <AvatarImage src={clientLogo || ""} className="object-cover" />
              <AvatarFallback className="bg-indigo-500/10 text-indigo-500 rounded-xl text-xl font-bold">
                {clientName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center leading-tight">
          Разрешить доступ приложению «{clientName}»?
        </h2>

        <p className="text-sm text-muted-foreground text-center mt-2 px-4">
          Приложение получит доступ к вашему аккаунту на <span className="font-medium text-foreground">{hostname}</span>.
        </p>
      </CardHeader>

      {/* BODY: SCOPES */}
      <CardContent className="p-0">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Запрашиваемые права:
          </h3>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 scrollbar-app">
            {scopes.map((scope, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {scope.name}
                  </span>
                  {scope.description && (
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {scope.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="px-6 py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Это безопасное действие. Вы сможете отозвать права позже в настройках профиля.
          </p>
        </div>
      </CardContent>

      {/* FOOTER: ACTIONS */}
      <CardFooter className="p-6 flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="ghost"
          className="w-full sm:w-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onDeny}
          disabled={isConsenting}
        >
          Отмена
        </Button>
        <Button
          className="w-full sm:flex-1 bg-primary text-primary-foreground font-semibold shadow-md"
          onClick={onAllow}
          disabled={isConsenting}
        >
          {isConsenting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isConsenting ? "Подключение..." : "Разрешить"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Simple error card for consistent styling
export function ConsentErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-6 bg-destructive/5 text-destructive rounded-xl border border-destructive/20 max-w-md text-center animate-in fade-in zoom-in-95 shadow-sm">
      <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h1 className="font-bold text-lg mb-2">{title}</h1>
      <p className="text-sm opacity-90">{message}</p>
    </div>
  );
}