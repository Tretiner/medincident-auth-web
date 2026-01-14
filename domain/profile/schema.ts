import { z } from "zod";

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  middleName: z.string().optional().or(z.literal('')),
  email: z.email("Введите корректный email адрес"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const toggleLinkSchema = z.object({
  provider: z.enum(['telegram', 'max']),
});