"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PersonalInfo } from "@/domain/profile/types";
import { PersonalInfoFormData, personalInfoSchema } from "@/domain/profile/schema";
import { updatePersonalInfo } from "../actions";
import { ProfileForm, FormMessage } from "./_components/profile-form";

export function ProfileDetailsView({ initialData }: { initialData: PersonalInfo }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<FormMessage | null>(null);

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      middleName: initialData.middleName || "",
      email: initialData.email,
    },
    mode: "onChange"
  });

  const handleSubmit = form.handleSubmit((data) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updatePersonalInfo(data);
      
      if (!result.success) {
        setMessage({ type: 'error', text: result.error.message });
        return;
      }

      // Обновляем состояние формы, чтобы isDirty сбросился
      form.reset(data); 
      
      setMessage({ type: 'success', text: 'Данные успешно сохранены' });
      setTimeout(() => setMessage(null), 3000);
    });
  });

  return (
    <ProfileForm 
      form={form} 
      isSaving={isPending} 
      message={message}
      onSubmit={handleSubmit} 
    />
  );
}