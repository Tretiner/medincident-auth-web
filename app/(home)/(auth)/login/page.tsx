"server only";

import { Metadata } from "next";
import { AuthFlow } from "./auth-flow";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const redirectPath =
    typeof resolvedSearchParams.from === "string"
      ? resolvedSearchParams.from
      : "/profile";

  return (
    <main>
      <AuthFlow redirectPath={redirectPath} />
    </main>
  );
}
