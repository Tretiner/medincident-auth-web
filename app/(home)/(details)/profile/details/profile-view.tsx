"use client";

import { ProfileForm } from "./_components/profile-form";
import { UserHeaderCard } from "./_components/user-header-card";
import { useProfileData, useFormProfileDetails } from "./profile.hooks";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";

export function ProfileUserHeaderView() {
  const { user, isLoading, isError } = useProfileData();

  if (isLoading) return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
      <Skeleton className="h-16 w-16 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-[20px] w-48" />
        <Skeleton className="h-[15px] w-32" />
        <Skeleton className="h-[14px] w-20" />
      </div>
    </div>
  );
  
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
  const { state: formState, actions } = useFormProfileDetails(user);

  if (isLoading) return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[36px] w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-6 border-t border-border">
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <ProfileForm 
      form={formState.form} 
      isSaving={formState.isSaving} 
      message={formState.message}
      onSubmit={actions.onSubmit} 
    />
  );
}