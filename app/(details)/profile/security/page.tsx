import { Metadata } from "next";
import { getUserProfile, getUserSessions } from "../actions";
import { SecurityView } from "./security-view";

export const metadata: Metadata = {
  title: "Безопасность",
  description: "Управление доступом и сессиями",
};

export default async function SecurityPage() {
  const [user, sessions] = await Promise.all([
    getUserProfile(),
    getUserSessions()
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Заголовок и описание */}
      <div>
        <h3 className="text-lg font-bold text-foreground">Безопасность и вход</h3>
        <p className="text-sm text-muted-foreground">Управление привязанными аккаунтами и сессиями</p>
      </div>
      
      {/* Контент */}
      <SecurityView user={user} sessions={sessions} />
    </div>
  );
}