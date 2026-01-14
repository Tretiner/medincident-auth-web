"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoginForm } from "./_components/login-form";
import { TelegramLoginCard } from "./_components/telegram-login-card";
import { MaxLoginCard } from "./_components/max-login-card";

interface AuthFlowProps {
  redirectPath: string;
}

type AuthView = "main" | "telegram" | "max";
type Direction = "forward" | "back";

export function AuthFlow({ redirectPath }: AuthFlowProps) {
  const [view, setView] = useState<AuthView>("main");
  const [direction, setDirection] = useState<Direction>("forward");

  const changeView = (newView: AuthView, direction: Direction = "forward") => {
    setDirection(direction);
    setView(newView);
  };

  const ViewComponents: Record<AuthView, React.ReactNode> = {
    main: (
      <LoginForm
        onTelegramClick={() => changeView("telegram")}
        onMaxClick={() => changeView("max")}
      />
    ),
    telegram: <TelegramLoginCard redirectPath={redirectPath} onBack={() => changeView("main", "back")} />,
    max: <MaxLoginCard redirectPath={redirectPath} onBack={() => changeView("main", "back")} />,
  };

  const animationClass = cn(
    "duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] animate-in fill-mode-both",
    view !== "main" && "slide-in-from-right-6 fade-in delay-0",
    view === "main" && direction === "back" && "slide-in-from-left-6 fade-in delay-0",
    view === "main" && direction === "forward" && "fade-in duration-500"
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className={cn("w-full flex justify-center max-w-full", animationClass)} key={view}>
        {ViewComponents[view]}
      </div>
    </div>
  );
}