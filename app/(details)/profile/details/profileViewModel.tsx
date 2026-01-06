'use client';

import { useState, useTransition } from "react";
import { User } from "@/domain/profile/types";
import { updateUserProfile } from "../actions";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
}

export const useProfileViewModel = (initialUser: User) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      middleName: initialUser.middleName || "",
      email: initialUser.email,
      phone: initialUser.phone,
    }
  });

  const saveProfile = form.handleSubmit((data) => {
    setMessage(null);
    
    startTransition(async () => {
      try {
        await updateUserProfile({
          id: initialUser.id,
          ...data
        });

        router.refresh(); 
        form.reset(data); 

        setMessage({ type: 'success', text: 'Данные успешно сохранены' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Не удалось сохранить изменения' });
      }
    });
  });

  return {
    form,
    state: {
      isSaving: isPending,
      isDirty: form.formState.isDirty, // Экспортируем флаг изменений
      message
    },
    saveProfile
  };
};