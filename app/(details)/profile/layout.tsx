import { getUserProfile } from "./actions";
import { SidebarNav } from "./components/sidebar-nav";
import { MobileNav } from "./components/mobile-nav";
import { Card } from "@/presentation/components/ui/card";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();

  return (
    // Контейнер на весь экран (dvh для мобилок) с отступами
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full bg-background p-3 md:p-8 font-sans">
      
      <Card className="
        w-full max-w-[1000px] 
        
        /* MOBILE: Растягиваем на доступную высоту (с учетом паддингов родителя) */
        h-[calc(100dvh-24px)] 
        
        /* PC: Высота по контенту (wrap), но с ограничениями */
        md:h-auto md:min-h-[500px] md:max-h-[85vh]
        
        overflow-hidden rounded-2xl border border-border shadow-sm bg-card 
        flex flex-col md:grid md:grid-cols-[260px_1fr]
      ">

        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden md:flex bg-muted/30 p-4 border-r border-border flex-col h-full">
           <SidebarNav user={user} />
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto scrollbar-app scroll-smooth relative">
          {children}
        </main>
        
        {/* --- MOBILE BOTTOM TABS --- */}
        <div className="md:hidden border-t border-border p-3 bg-card/95 backdrop-blur-sm z-10 shrink-0 pb-safe">
           <MobileNav />
        </div>

      </Card>
    </div>
  );
}