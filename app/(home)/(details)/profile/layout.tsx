import { getPersonalInfo } from "./actions";
import { SidebarNav } from "./_components/sidebar-nav";
import { MobileNav } from "./_components/mobile-nav";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getPersonalInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full bg-background md:p-6 lg:p-8 font-sans">
      
      <Card className={cn(
        // Базовые стили контейнера
        "w-full bg-card overflow-hidden flex flex-col transition-all duration-300",
        
        // MOBILE: Полный экран, сброс границ
        "h-[100dvh] rounded-none border-0 shadow-none",
        
        // DESKTOP: Центрированная карточка, сетка
        "md:max-w-[1050px] md:h-[85vh] md:min-h-[400px]",
        "md:rounded-xl md:border md:border-border md:shadow-none",
        "md:grid md:grid-cols-[260px_1fr]"
      )}>

        {/* SIDEBAR (Desktop Only) */}
        <aside className="hidden md:flex flex-col h-full bg-muted/25 border-r border-border p-4 overflow-y-auto scrollbar-none">
            <SidebarNav user={user} />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-app relative">
          <div className="p-4 md:p-8 md:max-w-3xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
        
        {/* MOBILE NAV (Bottom Sticky) */}
        <div className="md:hidden border-t border-border bg-card/90 backdrop-blur-md p-3 pb-safe z-20 shrink-0">
            <MobileNav />
        </div>

      </Card>
    </div>
  );
}