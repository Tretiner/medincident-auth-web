import { SidebarNav } from "./_components/sidebar-nav";
import { MobileNav } from "./_components/mobile-nav";
import { MobileTopBar } from "./_components/mobile-top-bar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          // 3. Важно: min-h-0 позволяет flex-контейнеру сжиматься, активируя скролл внутри
          "flex-1 min-h-0", 

          "md:max-w-[1050px] md:mx-auto md:h-full", // Убрали md:h-[85vh], теперь заполняем доступное место
          "md:grid md:grid-cols-[280px_1fr] md:gap-4 md:items-start",
        )}
      >
        <aside className="hidden md:block h-full overflow-hidden h-fit">
          <Card className="flex flex-col bg-card border-border shadow-none overflow-hidden rounded-xl p-4">
             <Suspense>
              <SidebarNav />
            </Suspense>
          </Card>
        </aside>

        <main className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
          <Card
            className={cn(
              "w-full bg-card shadow-none flex flex-col overflow-hidden",
              "rounded-none border-0 h-full", 
              "md:rounded-xl md:border md:border-border",
            )}
          >
            {/* 4. Вот здесь работает .scrollbar-app. Он скроллит только контент внутри карточки */}
            <div className="flex-1 overflow-y-auto scrollbar-app relative p-4 md:p-8 md:max-w-4xl mx-auto w-full">
              {children}
            </div>
          </Card>
        </main>

        {/* 5. Изменено: Убрано sticky. Добавлено shrink-0 */}
        <div className="md:hidden border-t border-border bg-background/90 backdrop-blur-md p-3 pb-safe z-20 shrink-0">
          <Suspense>
            <MobileNav />
          </Suspense>
        </div>
      </div>
    </div>
  );
}