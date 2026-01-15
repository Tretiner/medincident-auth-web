"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MaxLogoIcon } from "@/components/icons";
import { useSocialAuth } from "../login.hooks";

interface Props {
  redirectPath: string;
  onBack: () => void;
}

export function MaxLoginCard({ onBack }: Props) {
  const { login, isLoading } = useSocialAuth();

  return (
    <Card className="w-full max-w-[420px] shadow-none border-border bg-card overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground -ml-2 h-8 px-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад
        </Button>
      </div>

      <CardHeader className="pt-12 pb-2 text-center flex flex-col items-center">
        {/* Gradient from globals.css variables */}
        <div className="w-20 h-20 bg-[image:var(--max-gradient)] rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
          <MaxLogoIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Вход через MAX ID</h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          Единая система доступа
        </p>
      </CardHeader>

      <CardContent className="p-6 pb-10 flex flex-col items-center">
        <Button 
            onClick={() => login("max")} 
            disabled={isLoading}
            className="w-full bg-[image:var(--max-gradient)] text-white hover:opacity-90 transition-opacity"
        >
            {isLoading ? "Перенаправление..." : "Продолжить"}
        </Button>
      </CardContent>
    </Card>
  );
}