"use client";

import { Button } from "@/components/ui/button";
import { MaxLogoIcon } from "@/components/icons";
import { useAuthNavigation, useSocialAuth } from "../login.hooks";
import { LinkServiceCard } from "./_components/link-service-card";

const MaxIcon = () => (
  <div className="w-20 h-20 bg-[image:var(--max-gradient)] rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
    <MaxLogoIcon className="w-10 h-10 text-white" />
  </div>
);

export function MaxLoginCard() {
  const { redirectPath, backLink } = useAuthNavigation();
  const { login, isLoading } = useSocialAuth();

  return (
    <LinkServiceCard
      title="Вход через MAX ID"
      description="Единая система доступа"
      serviceIcon={MaxIcon}
      backLink={backLink}
    >
      <Button
        onClick={() => login("max")}
        disabled={isLoading}
        className="w-full bg-[image:var(--max-gradient)] text-white hover:opacity-90 transition-opacity"
      >
        {isLoading ? "Перенаправление..." : "Продолжить"}
      </Button>
    </LinkServiceCard>
  );
}
