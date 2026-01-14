import { Metadata } from "next";
import { getPersonalInfo } from "../actions";
import { PageHeader } from "../_components/page-header";
import { UserHeaderCard } from "./_components/user-header-card"; // This component needs to accept PersonalInfo, not User
import { ProfileDetailsView } from "./profile-view";
import { UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Мои данные",
};

export default async function PersonalDataPage() {
  const data = await getPersonalInfo();

  return (
    <div className="space-y-4"> 
      <PageHeader 
        title="Мои данные" 
        description="Редактирование личной информации и контактов"
        icon={UserRound}
      />

      <UserHeaderCard user={data} />

      <ProfileDetailsView initialData={data} />
    </div>
  );
}