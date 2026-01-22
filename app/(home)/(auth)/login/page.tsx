import { Metadata } from "next";
import { LoginForm } from "./login-form";
import { getUserFromSession } from "@/services/session/session-service";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getUserFromSession()

  const resolvedSearchParams = await searchParams as Record<string, string>;
  const queryString = new URLSearchParams(resolvedSearchParams).toString()

  if (user) redirect("/profile" + queryString ? `?${queryString}` : "")

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden">
      <div className="w-full flex justify-center max-w-full">
        <LoginForm searchParams={resolvedSearchParams} />
      </div>
    </main>
  );
}