import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  middleName: z.string().optional().or(z.literal('')),
  email: z.email("Введите корректный email адрес"),
  phone: z.e164("Введите корректный телефон"),
});

export type ProfileInput = z.infer<typeof profileSchema>;