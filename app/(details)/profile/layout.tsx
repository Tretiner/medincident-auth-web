import { getUserProfile } from "./actions";
import { SidebarNav } from "./components/sidebar-nav";
import { Card } from "@/presentation/components/ui/card";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getUserProfile();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 md:p-8 font-sans">
      <Card className="w-full max-w-[1100px] min-h-[700px] overflow-hidden rounded-[2rem] border border-border shadow-none bg-card grid md:grid-cols-[280px_1fr]">
        
        {/* ЛЕВАЯ КОЛОНКА: Семантически это "aside" (боковая панель) */}
        <aside className="bg-muted/30 p-8 border-r border-border flex flex-col">
           <div className="mb-8 pl-2">
             <h1 className="text-xl font-bold text-foreground">Профиль</h1>
             <p className="text-xs text-muted-foreground mt-1">Настройки аккаунта</p>
           </div>
           
           <SidebarNav />
        </aside>

        {/* ПРАВАЯ КОЛОНКА: Это ГЛАВНОЕ содержимое страницы */}
        <main className="p-8 md:p-12 h-full overflow-y-auto">
          {children}
        </main>

      </Card>
    </div>
  );
}