"use client";

import { ProfileForm, SECTION_CLASS } from "./_components/profile-form";
import { UserHeaderCard } from "./_components/user-header-card";
import { useProfileData, useFormProfileDetails } from "./profile.hooks";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className={SECTION_CLASS}>
      {children}
    </div>
  );
}

export function ProfileUserHeaderView() {
  const { user, isLoading, isError } = useProfileData();

  if (isLoading) return (
    <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <div className="relative overflow-hidden w-17 h-17 rounded-full bg-primary/15">
            <div className="shimmer shimmer-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="relative overflow-hidden h-6 w-44 rounded-md bg-primary/15">
            <div className="shimmer shimmer-primary" />
          </div>
          <div className="relative overflow-hidden h-4 w-32 rounded-md bg-primary/10">
            <div className="shimmer shimmer-primary" />
          </div>
          <div className="relative overflow-hidden h-3.5 w-20 rounded-md bg-primary/10">
            <div className="shimmer shimmer-primary" />
          </div>
        </div>
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
    <div className="space-y-3 animate-in fade-in duration-500">

      <SectionSkeleton>
        <Skeleton className="h-3.5 w-28" />
        <div className="grid grid-cols-2 gap-4">
          {[{ w: "w-10" }, { w: "w-16" }].map(({ w }, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className={cn("h-3", w)} />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <Skeleton className="h-3.5 w-20" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-9 w-full" />
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <Skeleton className="h-3.5 w-32" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </SectionSkeleton>

      <div className="flex justify-end pt-4 mt-4">
        <Skeleton className="h-8 w-[120px]" />
      </div>
    </div>
  );

  if (!user) return null;
  return (
    <ProfileForm
      form={formState.form}
      isSaving={formState.isSaving}
      message={formState.message}
      isEmailVerified={formState.isEmailVerified}
      onSubmit={actions.onSubmit}
      onCancel={actions.onCancel}
    />
  );
}