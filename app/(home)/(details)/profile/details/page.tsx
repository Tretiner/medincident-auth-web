import { Metadata } from "next";
import { PageHeader } from "../_components/page-header";
import { UserRound } from "lucide-react";
import { ProfileDetailsView, ProfileHeaderView } from "./profile-view";

export const metadata: Metadata = {
  title: "Мои данные",
};

export default function PersonalDataPage() {
  return (
    <div className="space-y-4"> 
      <PageHeader 
        title="Мои данные" 
        description="Редактирование личной информации и контактов"
        icon={UserRound}
      />
      
      <ProfileHeaderView />

      <ProfileDetailsView />
    </div>
  );
}