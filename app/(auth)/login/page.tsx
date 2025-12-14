'server only'

import { fetchQrCode } from "./actions";
import { LoginForm } from "./loginForm";

export default async function LoginPage() {
  const initialQrUrl = await fetchQrCode();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoginForm initialQrUrl={initialQrUrl} />
    </div>
  );
}