// app/profile/details/page.tsx
import { getUserProfile } from "../actions"; // Путь к экшенам мог измениться на уровень выше
import { UserHeaderCard } from "../components/user-header-card";
import { ProfileForm } from "../components/profile-form";

export default async function PersonalDataPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-8">
      <UserHeaderCard user={user} />
      
      <div>
        <h3 className="text-lg font-medium text-gray-900">Мои данные</h3>
        <p className="text-sm text-gray-500">Редактирование личной информации</p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}