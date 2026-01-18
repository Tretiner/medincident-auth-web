import { SidebarNav } from "./_components/sidebar-nav";
import { MobileNav } from "./_components/mobile-nav";
import { MobileTopBar } from "./_components/mobile-top-bar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center min-h-[100dvh] w-full bg-background md:p-6 lg:p-8 font-sans">
      
      <div className="md:hidden w-full sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-1">
         <MobileTopBar />
      </div>

      <div className={cn(
        "w-full flex flex-col transition-all duration-300",
        
        // MOBILE
        "flex-1",
        
        "md:max-w-[1050px] md:mx-auto md:h-[85vh] md:min-h-[400px]",
        "md:grid md:grid-cols-[280px_1fr] md:gap-4" 
      )}>

        <aside className="hidden md:block h-fit">
          <Card className="h-full flex flex-col bg-card border-border shadow-none overflow-hidden rounded-xl p-4">
            <SidebarNav />
          </Card>
        </aside>

        <main className="flex-1 min-h-0 h-full">
            <Card className={cn(
                "w-full bg-card shadow-none flex flex-col overflow-hidden",
                "rounded-none border-0 h-full", // Mobile
                "md:rounded-xl md:border md:border-border md:h-fit" // Desktop
            )}>
                <div className="flex-1 overflow-y-auto scrollbar-app relative p-4 md:p-8 md:max-w-4xl mx-auto w-full">
                     {children}
                </div>
            </Card>
        </main>
        
        <div className="md:hidden border-t border-border bg-background/90 backdrop-blur-md p-3 pb-safe z-20 shrink-0 sticky bottom-0 z-30">
            <MobileNav />
        </div>
      </div>
    </div>
  );
}