import { getUserProfile } from "./actions";
import { SidebarNav } from "./components/sidebar-nav";
import { Card } from "@/presentation/components/ui/card";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 font-sans">
      <Card className="w-full max-w-[1000px] h-[700px] overflow-hidden rounded-xl border border-border shadow-none bg-card grid md:grid-cols-[max-content_1fr]">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <aside className="bg-muted/30 p-4 border-r border-border flex flex-col h-full min-w-[240px]">
           <SidebarNav user={user} />
        </aside>

        {/* ПРАВАЯ КОЛОНКА */}
        <main className="p-6 h-full overflow-y-auto scrollbar-thin">
          {children}
        </main>

      </Card>
    </div>
  );
}