import { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { ShieldCheck } from "lucide-react";
import { SecurityView } from "./security-view";

export const metadata: Metadata = {
  title: "Безопасность",
  description: "Управление доступом и сессиями",
};

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Безопасность и вход"
        description="Управление привязанными аккаунтами и активными сессиями"
        icon={ShieldCheck}
      />
      
      <SecurityView />
    </div>
  );
}