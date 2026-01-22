import z from "zod";

export const LoginByTelegramWidgetResponseSchema = z.object({
  accessToken: z.object({
    token: z.string(),
    expiresIn: z.number().int(),
  }),

  profile: z.object({
    id: z.uuid(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
  }),
});

export type LoginByTelegramWidgetResponse = z.infer<typeof LoginByTelegramWidgetResponseSchema>;