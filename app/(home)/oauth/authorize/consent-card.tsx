import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  Link2,
  Loader2,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Database,
  CreditCard,
  FileText,
  MapPin,
  Lock,
  Smartphone,
} from "lucide-react";
import { AppLogoIcon } from "@/components/icons";
import type { CheckConsentResponse } from "@/domain/consent/schema";
import { cn } from "@/lib/utils";

interface ConsentCardProps {
  clientName: string;
  clientLogo?: string;
  scopes: CheckConsentResponse["scopes"];
  hostname: string;
  isConsenting: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

// Хелпер для выбора иконки на основе названия scope
const getScopeIcon = (scopeName: string) => {
  const name = scopeName.toLowerCase();

  if (name.includes("email")) return Mail;
  if (name.includes("phone") || name.includes("mobile")) return Phone;
  if (
    name.includes("profile") ||
    name.includes("user") ||
    name.includes("name")
  )
    return User;
  if (name.includes("offline") || name.includes("access")) return Database;
  if (name.includes("address") || name.includes("location")) return MapPin;
  if (
    name.includes("payment") ||
    name.includes("wallet") ||
    name.includes("card")
  )
    return CreditCard;
  if (name.includes("file") || name.includes("doc")) return FileText;
  if (name.includes("device")) return Smartphone;
  if (name.includes("openid") || name.includes("id")) return Lock;

  return Check; // Дефолтная иконка
};

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
    <Card className="w-full max-w-[420px] shadow-none border-border bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER */}
      <CardHeader className="pt-10 pb-2 text-center flex flex-col items-center">
        <div className="flex flex-row items-center justify-center gap-4 mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <AppLogoIcon className="w-7 h-7" />
          </div>
          <div className="text-muted-foreground/40">
            <Link2 className="w-5 h-5" />
          </div>
          <div className="w-14 h-14 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shadow-sm relative">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage src={clientLogo || ""} className="object-cover" />
              <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xl font-bold w-full h-full flex items-center justify-center rounded-none">
                {clientName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
          Доступ к аккаунту
        </h2>
        <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">
          Приложение{" "}
          <span className="font-semibold text-foreground">{clientName}</span>{" "}
          запрашивает доступ к вашим данным на {hostname}.
        </p>
      </CardHeader>

      <CardContent className="p-6 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Разрешения
            </h3>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
              Всего: {scopes.length}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border/40 gap-2">
            {scopes.map((scope, idx) => {
              const Icon = getScopeIcon(scope.name);

              return (
                <div
                  key={idx}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 rounded-md transition-all duration-300",
                    "bg-transparent border border-border/40",
                    "hover:bg-muted/30 hover:border-primary/20",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300",
                      "bg-background text-muted-foreground border border-border/50",
                      "group-hover:text-primary group-hover:border-primary/10",
                    )}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {scope.name}
                    </span>

                    {scope.description && (
                      <span className="text-xs text-muted-foreground leading-snug">
                        {scope.description}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-3 font-medium">
            Вы сможете отозвать права в любой момент в настройках профиля.
          </p>
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="p-6 pt-4 flex flex-col sm:flex-row-reverse gap-3">
        <Button
          className="w-full bg-primary text-primary-foreground font-semibold text-base shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
          onClick={onAllow}
          disabled={isConsenting}
        >
          {isConsenting ?
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Подключение...
            </>
          : "Разрешить"}
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground font-medium"
          onClick={onDeny}
          disabled={isConsenting}
        >
          Отменить
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ConsentErrorCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="p-6 bg-destructive/5 text-destructive rounded-xl border border-destructive/20 max-w-md text-center animate-in fade-in zoom-in-95 shadow-none">
      <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h1 className="font-bold text-lg mb-2">{title}</h1>
      <p className="text-sm opacity-90">{message}</p>
    </div>
  );
}
