import { Metadata } from "next";
import { getUserProfile } from "../actions";
import { UserHeaderCard } from "./components/user-header-card";
import { ProfileForm } from "./components/profile-form";
import { PageHeader } from "../components/page-header";
import { UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Мои данные",
  description: "Редактирование личной информации",
};

export default async function PersonalDataPage() {
  const user = await getUserProfile();
  return (
    <div className="space-y-4"> 
      <PageHeader 
        title="Мои данные" 
        description="Редактирование личной информации и контактов"
        icon={UserRound}
      />

      <UserHeaderCard user={user} />

      {/* Форма */}
      <ProfileForm user={user} />
    </div>
  );
}