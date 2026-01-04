import { Metadata } from "next";
import { getUserProfile } from "../actions";
import { UserHeaderCard } from "../components/user-header-card";
import { ProfileForm } from "../components/profile-form";

// Добавляем метаданные для этой страницы
export const metadata: Metadata = {
  title: "Мои данные",
  description: "Редактирование личной информации",
};

export default async function PersonalDataPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <UserHeaderCard user={user} />
      
      <div>
        <h3 className="text-lg font-medium text-foreground">Мои данные</h3>
        <p className="text-sm text-muted-foreground">Редактирование личной информации</p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}