'use client';

import { useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { User } from "@/domain/profile/types";
import { updateUserProfile } from "../actions";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
}

export interface ProfileMessage {
  type: 'success' | 'error';
  text: string;
}

export function useProfileDetails(initialUser: User) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      middleName: initialUser.middleName || "",
      email: initialUser.email,
      phone: initialUser.phone,
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    setMessage(null);
    
    startTransition(async () => {
      try {
        await updateUserProfile({
          id: initialUser.id,
          ...data
        });

        router.refresh(); 
        form.reset(data); // Reset dirty state with new values
        setMessage({ type: 'success', text: 'Данные успешно сохранены' });
        
        // Auto-hide success message
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Не удалось сохранить изменения' });
      }
    });
  });

  return {
    state: {
      form,
      isSaving: isPending,
      isDirty: form.formState.isDirty,
      message,
    },
    actions: {
      onSubmit: handleSubmit,
      dismissMessage: () => setMessage(null),
    }
  };
}