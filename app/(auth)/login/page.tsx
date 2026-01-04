'server only'

import { fetchQrCode } from "./actions";
import { LoginForm } from "./loginForm";

export default async function LoginPage() {
  const initialQrUrl = await fetchQrCode();

  return (
    <div className="container">
      <LoginForm initialQrUrl={initialQrUrl} />
    </div>
  );
}