import z from "zod";

export const ServiceAuthResponseSchema = z.object({
  UserID: z.uuid(),
  AccessToken: z.string(),
  AccessExpiresAt: z.iso.datetime().pipe(z.coerce.date()), // ISO 8601 string from Go time.Time
  RefreshToken: z.string(), // base64 encoded
  RefreshExpiresAt: z.iso.datetime().pipe(z.coerce.date()),
});

export type ServiceAuthResponse = z.infer<typeof ServiceAuthResponseSchema>;
