import { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { MonitorSmartphone } from "lucide-react";
import { SessionsView } from "./sessions-view";

export const metadata: Metadata = {
  title: "Сессии",
  description: "Управление активными сессиями",
};

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление сессиями"
        description="Просмотр и завершение активных сессий на ваших устройствах"
        icon={MonitorSmartphone}
      />

      <SessionsView />
    </div>
  );
}
