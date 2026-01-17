'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { PersonalInfo } from "@/domain/profile/types";
import { handleFetch } from "@/lib/fetch-helper";
import { personalInfoSchema } from "@/domain/profile/schema";

const ApiResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
}).loose(); 

export type ProfileFormData = z.infer<typeof personalInfoSchema>;

export interface ProfileMessage {
  type: 'success' | 'error';
  text: string;
}

export function useProfileDetails(initialUser: PersonalInfo) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      middleName: initialUser.middleName || "",
      email: initialUser.email,
    }
  });

  const handleSubmit = form.handleSubmit((data) => {
    setMessage(null);
    
    startTransition(async () => {
        // REST API вызов вместо Server Action
        const result = await handleFetch(
            () => fetch("/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }),
            ApiResponseSchema
        );

        if (!result.success) {
            setMessage({ type: 'error', text: result.error.message });
            return;
        }

        router.refresh(); 
        
        // Обновляем состояние формы полученными данными
        form.reset({
             ...data,
             // Если API вернул отформатированные поля, можно использовать result.data
        }); 
        
        setMessage({ type: 'success', text: 'Данные успешно сохранены' });
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
    }
  };
}