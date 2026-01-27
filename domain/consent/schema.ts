import { z } from "zod";

export const consentUrlParamsSchema = z.object({
  client_id: z.string().min(1),
  response_type: z.string().min(1),
  redirect_uri: z.string(),
  scope: z.string().optional().default(""),
  state: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.string().optional(),
});

const consentScopeItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
});

export interface CheckConsentRequest {
    clientId: string;
    scopes: string[];
    redirectUri: string;
}

// Ответ от POST /consent/check
export const checkConsentResponseSchema = z.object({
  name: z.string(),
  hostname: z.string(),
  photoUrl: z.url().optional().or(z.literal("")),
  valid: z.boolean(),
  scopes: z.array(consentScopeItemSchema),
});

export type CheckConsentResponse = z.infer<typeof checkConsentResponseSchema>;