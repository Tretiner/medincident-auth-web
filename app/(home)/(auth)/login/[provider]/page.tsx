import { notFound } from "next/navigation";
import { TelegramLoginCard } from "../telegram-login-card";
import { MaxLoginCard } from "../max-login-card";

interface Props {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProviderLoginPage({
  params,
  searchParams,
}: Props) {
  const { provider } = await params;
  const resolvedSearchParams = await searchParams;

  const from = resolvedSearchParams.from || resolvedSearchParams.redirectTo || "/profile";

  const backParams = new URLSearchParams();
  if (resolvedSearchParams.from) backParams.set("from", resolvedSearchParams.from);
  if (resolvedSearchParams.redirectTo) backParams.set("redirectTo", resolvedSearchParams.redirectTo);

  const backLink = `/login?${backParams.toString()}`;

  let content = null;

  switch (provider) {
    case "telegram":
      content = <TelegramLoginCard backLink={backLink} redirectPath={from} />;
      break
    case "max":
      content = <MaxLoginCard backLink={backLink} redirectPath={from} />;
      break
    default:
      return notFound();
  }
  
return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden">
        <div className="w-full flex justify-center max-w-full">
            {content}
        </div>
    </div>
);
}
