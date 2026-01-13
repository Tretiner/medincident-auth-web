import { Metadata } from "next";
import { getUserProfile, getUserSessions } from "../actions";
import { SecurityView } from "./security-view";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "../_components/page-header";

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
    <div className="space-y-6">
      
      <PageHeader 
        title="Безопасность и вход"
        description="Управление привязанными аккаунтами и активными сессиями"
        icon={ShieldCheck}
      />
      
      <SecurityView user={user} sessions={sessions} />
    </div>
  );
}