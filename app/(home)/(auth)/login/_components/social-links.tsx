// app/login/_components/social-links.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MaxLogoIcon, TelegramLogoIcon } from "@/components/icons";
import { ZitadelIdp } from "@/lib/zitadel/zitadel-api";
import { loginWithProviderAction } from "../actions"; // Импортируем Action

interface AuthButtonProps {
  requestId: string;
  idpId: string;
}

interface GenericButtonProps extends AuthButtonProps {
  name: string;
}

// Заметьте: убрали asChild и <Link>, добавили type="submit"
export const GenericButton = ({ requestId, idpId, name }: GenericButtonProps) => (
  <form action={loginWithProviderAction.bind(null, idpId, requestId)} className="w-full">
    <Button
      type="submit"
      variant="outline"
      size="lg"
      className="w-full relative py-6 text-base group shadow-none transition-all active:scale-[0.98]"
    >
      <span>{name}</span>
    </Button>
  </form>
);

const TelegramButton = ({ requestId, idpId }: AuthButtonProps) => (
  <form action={loginWithProviderAction.bind(null, idpId, requestId)} className="w-full">
    <Button
      type="submit"
      variant="telegram"
      size="lg"
      className="w-full relative py-6 text-base group shadow-none transition-all active:scale-[0.98]"
    >
      <TelegramLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">Telegram</span>
    </Button>
  </form>
);

const MaxButton = ({ requestId, idpId }: AuthButtonProps) => (
  <form action={loginWithProviderAction.bind(null, idpId, requestId)} className="w-full">
    <Button
      type="submit"
      variant="max"
      size="lg"
      className="w-full relative py-6 text-base group shadow-none transition-all active:scale-[0.98]"
    >
      <MaxLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110" />
      <span className="pl-4">MAX</span>
    </Button>
  </form>
);

const STYLED_PROVIDERS: Record<string, React.FC<AuthButtonProps>> = {
  telegram: TelegramButton,
  max: MaxButton,
};

interface ExternalIdentityProvidersProps {
  requestId: string;
  providers: ZitadelIdp[];
}

export function ExternalIdentityProviders({ requestId, providers }: ExternalIdentityProvidersProps) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="grid gap-2 md:gap-3">
      {providers.map((provider) => {
        const lowerCaseName = provider.name.toLowerCase();
        const StyledProvider = STYLED_PROVIDERS[lowerCaseName];
        
        if (StyledProvider) {
          return <StyledProvider key={provider.id} requestId={requestId} idpId={provider.id} />;
        }

        return (
          <GenericButton 
            key={provider.id} 
            requestId={requestId}
            idpId={provider.id} 
            name={provider.name} 
          />
        );
      })}
    </div>
  );
}