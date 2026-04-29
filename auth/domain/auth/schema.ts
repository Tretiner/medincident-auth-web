import z from "zod";
import { TelegramUser } from "./types";

export const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
})
.transform((data) => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  username: data.username,
  photoUrl: data.photo_url,
  authDate: data.auth_date,
  hash: data.hash,
})) satisfies z.ZodType<TelegramUser>;