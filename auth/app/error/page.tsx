import { Suspense } from "react";
import { AuthErrorView } from "./_components/auth-error-view";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 font-sans">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthErrorView />
    </Suspense>
  );
}
