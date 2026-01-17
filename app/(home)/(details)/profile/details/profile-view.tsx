"use client";

import { ProfileForm } from "./_components/profile-form";
import { UserHeaderCard } from "./_components/user-header-card";
import { useProfileData, useProfileDetails } from "./profile.hooks";
import { ProfileHeaderSkeleton, ProfileFormSkeleton } from "../skeletons";
import { AlertCircle } from "lucide-react";

export function ProfileHeaderView() {
  const { user, isLoading, isError } = useProfileData();

  if (isLoading) return <ProfileHeaderSkeleton />;
  
  if (isError) return (
    <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex gap-2 items-center">
      <AlertCircle className="w-5 h-5" />
      <span>Не удалось загрузить профиль</span>
    </div>
  );

  if (!user) return null;

  return <UserHeaderCard user={user} />;
}

export function ProfileDetailsView() {
  const { user, isLoading } = useProfileData();
  const { state, actions } = useProfileDetails(user);

  if (isLoading) return <ProfileFormSkeleton />;

  if (!user) return null;

  return (
    <ProfileForm 
      form={state.form} 
      isSaving={state.isSaving} 
      message={state.message}
      onSubmit={actions.onSubmit} 
    />
  );
}