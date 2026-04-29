import { z } from "zod";

export const nameField = (label: string) =>
  z.string()
    .min(2, `${label}: минимум 2 символа`)
    .max(50, `${label} слишком длинное`)
    .refine(
      (val) => !val || /^[а-яА-ЯёЁ\s-]+$/.test(val),
      "Только русские буквы, пробелы и дефисы",
    );

export const nameFieldsSchema = z.object({
  givenName: nameField("Имя"),
  familyName: nameField("Фамилия"),
  middleName: z.union([nameField("Отчество"), z.literal("")]).optional(),
});

export const personalInfoSchema = z.object({
  firstName: nameField("Имя"),
  lastName: nameField("Фамилия"),
  middleName: z.union([
    nameField("Отчество"),
    z.literal(""),
  ]).optional(),
  email: z.email("Введите корректный email адрес"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;