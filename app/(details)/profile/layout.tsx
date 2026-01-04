import { getUserProfile } from "./actions"; // Наш мок-экшен
import { SidebarNav } from "./components/sidebar-nav";
import { Card } from "@/presentation/components/ui/card";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Загружаем данные (SSR)
  // Мы вызываем это здесь, чтобы убедиться, что пользователь авторизован,
  // но данные юзера мы будем передавать внутри children-страниц, 
  // так как layout не может передавать пропсы в children напрямую.
  // Next.js Request Memoization позволит нам вызвать getUserProfile() 
  // еще раз внутри page.tsx без лишних запросов к базе.
  await getUserProfile();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4 md:p-8">
      {/* Главная карточка - контейнер */}
      <Card className="w-full max-w-[1100px] min-h-[700px] overflow-hidden rounded-[2rem] border border-gray-200 shadow-xl bg-white grid md:grid-cols-[280px_1fr]">
        
        {/* ЛЕВАЯ КОЛОНКА: Навигация */}
        <div className="bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col">
           <div className="mb-8 pl-2">
             <h1 className="text-xl font-bold text-gray-900">Профиль</h1>
             <p className="text-xs text-gray-400 mt-1">Настройки аккаунта</p>
           </div>
           
           <SidebarNav />
        </div>

        {/* ПРАВАЯ КОЛОНКА: Динамический контент (children) */}
        <div className="p-8 md:p-12 h-full overflow-y-auto max-h-[90vh]">
          {/* Здесь будут рендериться page.tsx или security/page.tsx */}
          {children}
        </div>

      </Card>
    </div>
  );
}