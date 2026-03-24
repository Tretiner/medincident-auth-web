"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";

import { PersonalInfo } from "@/domain/profile/types";
import { personalInfoSchema } from "@/domain/profile/schema";
import { useProfileStore } from "../profile.store";

// Импортируем наши новые Server Actions
import { getProfileDataAction, updateProfileDataAction } from "./profile.actions";

export type ProfileFormData = z.infer<typeof personalInfoSchema>;

export interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

const PROFILE_API_KEY = "profile-me"; // Локальный ключ для SWR

// --- 1. HOOK FOR FETCHING ---
export function useProfileData() {
  const setProfileStore = useProfileStore((s) => s.setProfile);
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<PersonalInfo>(
    PROFILE_API_KEY,
    getProfileDataAction, // Напрямую отдаем Server Action
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        setProfileStore({
          firstName: data.firstName,
          lastName: data.lastName,
          photoUrl: data.avatarUrl,
          email: data.email,
        });
      },
    },
  );

  return {
    user: data,
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}

// --- 2. HOOK FOR MUTATION (UPDATE) ---
export function useFormProfileDetails(user?: PersonalInfo) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || "",
        email: user.email,
      });
    }
  }, [user, form]);

  const handleSubmit = form.handleSubmit((data) => {
    setMessage(null);

    startTransition(async () => {
      // Вызываем Server Action вместо fetch PATCH
      const result = await updateProfileDataAction(data);

      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      // Обновляем локальный кэш SWR новыми данными из ответа
      await mutate(PROFILE_API_KEY, result.data, false);

      // Обновляем Server Components (например, Sidebar)
      router.refresh();

      // Сбрасываем isDirty, чтобы кнопка "Сохранить" задизейблилась
      form.reset({
        ...form.getValues(),
        firstName: result.data.firstName,
        lastName: result.data.lastName,
      });

      setMessage({ type: "success", text: "Данные успешно сохранены" });
      setTimeout(() => setMessage(null), 3000);
    });
  });

  return {
    state: {
      form,
      isSaving: isPending,
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      message,
    },
    actions: {
      onSubmit: handleSubmit,
      dismissMessage: () => setMessage(null),
    },
  };
}