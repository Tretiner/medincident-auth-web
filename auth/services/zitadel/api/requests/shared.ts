"server only";

import { z } from "zod";

export type TextFilterMethod =
  | "TEXT_FILTER_METHOD_EQUALS"
  | "TEXT_FILTER_METHOD_EQUALS_IGNORE_CASE"
  | "TEXT_FILTER_METHOD_CONTAINS"
  | "TEXT_FILTER_METHOD_CONTAINS_IGNORE_CASE";

export interface PaginationRequest {
  offset?: number | string;
  limit?: number;
  asc?: boolean;
}

// ZITADEL почти всегда возвращает объект details с метаданными операции
export const ZitadelDetailsSchema = z.object({
  sequence: z.string().optional(),
  changeDate: z.string().optional(),
  resourceOwner: z.string().optional(),
}).catchall(z.any());

export const ZitadelGenericUpdateResponseSchema = z.object({
  details: ZitadelDetailsSchema.optional(),
}).catchall(z.any());
