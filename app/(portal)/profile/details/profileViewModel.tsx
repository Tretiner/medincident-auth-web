'use client';

import { useState, useTransition } from "react";
import { User } from "@/domain/profile/types";
import { updateUserProfile } from "../actions"; // Наш Server Action
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Схема данных формы (можно вынести в отдельный файл валидации)
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
}

export const useProfileViewModel = (initialUser: User) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // Для управления состоянием загрузки Server Actions
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Инициализируем форму данными, пришедшими с сервера (SSR)
  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      middleName: initialUser.middleName || "",
      email: initialUser.email,
      phone: initialUser.phone,
    }
  });

  // Intent: SAVE_CLICKED
  const saveProfile = form.handleSubmit((data) => {
    setMessage(null); // Сброс сообщений
    
    startTransition(async () => {
      try {
        // 1. Вызываем Server Action
        await updateUserProfile({
          id: initialUser.id,
          ...data
        });

        // 2. Обновляем данные на странице (Next.js обновит серверные компоненты)
        router.refresh(); 

        setMessage({ type: 'success', text: 'Данные успешно сохранены' });
        
        // Скрываем сообщение через 3 сек
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
      message
    },
    saveProfile
  };
};