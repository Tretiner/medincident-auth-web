import { Metadata } from "next";
import { ProfileDetailsView, ProfileUserHeaderView } from "./profile-view";

export const metadata: Metadata = {
  title: "Мои данные",
};

export default function PersonalDataPage() {
  return (
    <div className="space-y-4">
      <ProfileUserHeaderView />
      <ProfileDetailsView />
    </div>
  );
}