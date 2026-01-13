"server only";

import { Metadata } from "next";
import { fetchQrCode } from "./actions";
import { LoginForm } from "./loginForm";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const initialQrUrl = await fetchQrCode();

  const resolvedSearchParams = await searchParams;
  const redirectPath =
    typeof resolvedSearchParams.from === "string"
      ? resolvedSearchParams.from
      : "/profile";

  return (
    <main>
      <LoginForm initialQrUrl={initialQrUrl} redirectPath={redirectPath} />
    </main>
  );
}
