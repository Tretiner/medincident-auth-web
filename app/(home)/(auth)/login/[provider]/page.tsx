import { notFound } from "next/navigation";
import { TelegramLoginCard } from "./telegram-login-card";
import { MaxLoginCard } from "./max-login-card";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export async function generateStaticParams() {
  return [
    { provider: "telegram" }, 
    { provider: "max" }
  ];
}

interface Props {
  params: Promise<{ provider: string }>;
}

export default async function ProviderLoginPage({ params }: Props) {
  const { provider } = await params;

  let content = null;

  switch (provider) {
    case "telegram":
      content = <TelegramLoginCard />;
      break;
    case "max":
      content = <MaxLoginCard />;
      break;
    default:
      return notFound();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className="w-full flex justify-center max-w-full">
        <Suspense fallback={<Loader2 className="animate-spin text-primary" />}>
          {content}
        </Suspense>
      </div>
    </div>
  );
}
