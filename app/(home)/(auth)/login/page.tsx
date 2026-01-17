import { Metadata } from "next";
import { LoginForm } from "./login-form";
import { TelegramLoginCard } from "./telegram-login-card";
import { MaxLoginCard } from "./max-login-card";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  
  const authProvider = resolvedSearchParams.provider;
  const from =
    typeof resolvedSearchParams.from === "string"
      ? resolvedSearchParams.from
      : "/profile";
  
  const backParams = new URLSearchParams();
  if (resolvedSearchParams.from) {
    backParams.set("from", resolvedSearchParams.from.toString());
  }
  const backLink = `/login?${backParams.toString()}`;

  const renderView = () => {
    switch (authProvider) {
      case "telegram":
        return <TelegramLoginCard backLink={backLink} redirectPath={from} />;
      case "max":
        return <MaxLoginCard backLink={backLink} redirectPath={from} />;
      default:
        return <LoginForm searchParams={resolvedSearchParams as Record<string, string>} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className="w-full flex justify-center max-w-full">
        {renderView()}
      </div>
    </div>
  );
}