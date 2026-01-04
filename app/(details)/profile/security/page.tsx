import { Metadata } from "next";
import { getUserProfile, getUserSessions } from "../actions";
import { UserHeaderCard } from "../components/user-header-card";
import { SecurityView } from "./security-view";

// Метаданные для вкладки безопасности
export const metadata: Metadata = {
  title: "Безопасность",
  description: "Управление доступом и сессиями",
};

export default async function SecurityPage() {
  // Параллельная загрузка данных
  const [user, sessions] = await Promise.all([
    getUserProfile(),
    getUserSessions()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Шапка (SSR) */}
      <UserHeaderCard user={user} />
      
      {/* Заголовок раздела */}
      <div>
        <h3 className="text-lg font-medium text-foreground">Безопасность и вход</h3>
        <p className="text-sm text-muted-foreground">Управление доступом к аккаунту</p>
      </div>

      {/* Клиентская часть с логикой */}
      <SecurityView user={user} sessions={sessions} />
    </div>
  );
}