import { Metadata } from "next";
import { getUserProfile } from "../actions";
import { UserHeaderCard } from "./components/user-header-card";
import { ProfileForm } from "./components/profile-form";

export const metadata: Metadata = {
  title: "Мои данные",
  description: "Редактирование личной информации",
};

export default async function PersonalDataPage() {
  const user = await getUserProfile();
  return (
    <div className="space-y-6"> 
      <UserHeaderCard user={user} />
      
      <div>
        <h3 className="text-lg font-bold text-foreground">Мои данные</h3>
        <p className="text-sm text-muted-foreground">Редактирование личной информации и контактов</p>
      </div>

      {/* Форма */}
      <ProfileForm user={user} />
    </div>
  );
}