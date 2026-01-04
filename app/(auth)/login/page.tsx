'server only'

import { Metadata } from "next";
import { fetchQrCode } from "./actions";
import { LoginForm } from "./loginForm";

export const metadata: Metadata = {
  title: "Вход",
  description: "Авторизация в системе",
};

export default async function LoginPage() {
  const initialQrUrl = await fetchQrCode();

  return (
    <main>
      <LoginForm initialQrUrl={initialQrUrl} />
    </main>
  );
}