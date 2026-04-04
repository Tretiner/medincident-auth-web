"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleZitadelRequest } from "../client-helper";
import { zitadelApi } from "../client";

export const ZitadelCompleteAuthRequestResponseSchema = z.object({
  redirectUri: z.string().optional(),
  url: z.string().optional()
}).catchall(z.any());

export const ZitadelDeviceAuthorizationRequestSchema = z.object({
  deviceAuthorizationRequest: z.object({
    id: z.string(),
    clientId: z.string().optional(),
    scope: z.array(z.string()).optional(),
    appName: z.string().optional(),
    projectName: z.string().optional(),
  }).optional(),
}).catchall(z.any());

export async function getDeviceAuthorization(
  userCode: string
): Promise<Result<z.infer<typeof ZitadelDeviceAuthorizationRequestSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.get(`/v2/oidc/device_authorization/${userCode}`),
    ZitadelDeviceAuthorizationRequestSchema
  );
}

export async function approveDeviceAuthorization(
  id: string,
  sessionId: string,
  sessionToken: string
): Promise<Result<Record<string, never>>> {
  return handleZitadelRequest(
    () => zitadelApi.post(`/v2/oidc/device_authorization/${id}`, {
      session: { sessionId, sessionToken },
    }),
    z.object({}).passthrough()
  );
}

export async function completeAuthRequest(
  requestId: string,
  sessionId: string,
  sessionToken: string
): Promise<Result<z.infer<typeof ZitadelCompleteAuthRequestResponseSchema>>> {
  const isOidc = requestId.startsWith("oidc_");
  const isSaml = requestId.startsWith("saml_");

  if (!isOidc && !isSaml) {
    return {
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: "Неизвестный тип requestId. Ожидается префикс oidc_ или saml_",
      }
    };
  }

  const endpoint = isOidc ? `/v2/oidc/auth_requests/${requestId}` : `/v2/saml/auth_requests/${requestId}`;

  return handleZitadelRequest(
    () => zitadelApi.post(endpoint, {
      session: { sessionId, sessionToken }
    }),
    ZitadelCompleteAuthRequestResponseSchema
  );
}
