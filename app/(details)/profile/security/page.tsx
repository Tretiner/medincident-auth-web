import { getUserProfile, getUserSessions } from "../actions";
import { UserHeaderCard } from "../components/user-header-card";
import { SecurityView } from "./security-view"; // Wrapper клиентский

export default async function SecurityPage() {
  // Загружаем данные параллельно для скорости
  const [user, sessions] = await Promise.all([
    getUserProfile(),
    getUserSessions()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Шапка (SSR) */}
      <UserHeaderCard user={user} />
      
      {/* Заголовок */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Безопасность и вход</h3>
        <p className="text-sm text-gray-500">Управление доступом к аккаунту</p>
      </div>

      {/* Клиентская часть с логикой */}
      <SecurityView user={user} sessions={sessions} />
    </div>
  );
}