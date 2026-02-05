import z from "zod";

export const AccessTokenSchema = z
  .object({
    token: z.string(),
    expiresIn: z.number().int(),
  })
  .transform((x) => ({
    token: x.token,
    expiresInMillis: x.expiresIn * 1000,
  }));

export const RefreshTokenResponseSchema = z.object({
  accessToken: AccessTokenSchema,
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export const LoginByTelegramWidgetResponseSchema = z.object({
  accessToken: AccessTokenSchema,

  profile: z.object({
    id: z.uuid(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
  }),
});

export type LoginByTelegramWidgetResponse = z.infer<
  typeof LoginByTelegramWidgetResponseSchema
>;

export const EmptyBody = z.any();
