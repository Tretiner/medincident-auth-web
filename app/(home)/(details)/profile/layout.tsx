import { redirect } from "next/navigation";
import { SidebarNav } from "./_components/sidebar-nav";
import { MobileNav } from "./_components/mobile-nav";
import { MobileTopBar } from "./_components/mobile-top-bar";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { Suspense } from "react";
import { getUserById } from "@/services/zitadel/api";
import { auth } from "@/services/zitadel/user/auth";
import { getUserIdFromNextAuth } from "@/services/zitadel/session";
import { AutoSignIn } from "../../(auth)/login/_components/auto-sign-in";
import { Skeleton } from "@/shared/ui/skeleton";

async function EmailGuardedContent({ children }: { children: React.ReactNode }) {
  const userId = await getUserIdFromNextAuth();

  if (userId) {
    const userRes = await getUserById(userId);
    const isVerified: boolean = userRes.success
      ? (userRes.data?.user?.human?.email?.isVerified ?? false)
      : false;

    if (!isVerified) {
      redirect("/login/verify");
    }
  }

  return <>{children}</>;
}

function ContentSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-3 mt-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    return <AutoSignIn provider="zitadel" redirectTo="/profile" />;
  }

  return (
    <div className="flex flex-col items-center h-[100dvh] w-full bg-background md:p-6 lg:p-8 font-sans overflow-hidden">

      <Suspense>
        <div className="md:hidden w-full z-30 bg-background/80 backdrop-blur-sm border-b border-border px-1 shrink-0">
          <MobileTopBar />
        </div>
      </Suspense>

      <div
        className={cn(
          "w-full flex flex-col transition-all duration-300",
          // Важно: min-h-0 позволяет flex-контейнеру сжиматься, активируя скролл внутри
          "flex-1 min-h-0",

          "md:max-w-[1050px] md:mx-auto md:h-full",
          "md:grid md:grid-cols-[280px_1fr] md:gap-4 md:items-start",
        )}
      >
        <aside className="hidden md:block overflow-hidden h-fit">
          <Card className="flex flex-col bg-card border-border overflow-hidden rounded-xl p-4">
             <Suspense>
              <SidebarNav />
            </Suspense>
          </Card>
        </aside>

        <main className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
          <Card
            className={cn(
              "w-full bg-card flex flex-col overflow-hidden",
              "rounded-none border-0 h-full",
              "md:rounded-xl md:border md:border-border",
            )}
          >
            <div className="flex-1 overflow-y-auto scrollbar-app relative p-4 md:p-8 md:max-w-4xl mx-auto w-full">
              <Suspense fallback={<ContentSkeleton />}>
                <EmailGuardedContent>{children}</EmailGuardedContent>
              </Suspense>
            </div>
          </Card>
        </main>

        <div className="md:hidden border-t border-border bg-background/90 backdrop-blur-md p-3 pb-safe z-20 shrink-0">
          <Suspense>
            <MobileNav />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
