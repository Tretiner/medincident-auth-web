'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { User } from "@/domain/profile/types";
import { updateUserProfile } from "../actions";

const profileSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  middleName: z.string().optional(),
  email: z.email("Введите корректный email адрес"),
  phone: z.e164("Некорректный формат телефона").min(10, "Телефон слишком короткий"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileMessage {
  type: 'success' | 'error';
  text: string;
}

export function useProfileDetails(initialUser: User) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
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
    }
  };
}