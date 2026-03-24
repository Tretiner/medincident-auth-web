"server only";

import { z } from "zod";

export const ZitadelIntentDetailsSchema = z.object({
  sequence: z.string().optional(),
  changeDate: z.string().optional(),
  resourceOwner: z.string().optional(),
});

export const ZitadelGenericUpdateResponseSchema = z.object({
  details: ZitadelIntentDetailsSchema.optional()
}).catchall(z.any());

export type TextFilterMethod = 
  | 'TEXT_FILTER_METHOD_EQUALS'
  | 'TEXT_FILTER_METHOD_EQUALS_IGNORE_CASE'
  | 'TEXT_FILTER_METHOD_STARTS_WITH'
  | 'TEXT_FILTER_METHOD_STARTS_WITH_IGNORE_CASE'
  | 'TEXT_FILTER_METHOD_CONTAINS'
  | 'TEXT_FILTER_METHOD_CONTAINS_IGNORE_CASE'
  | 'TEXT_FILTER_METHOD_ENDS_WITH'
  | 'TEXT_FILTER_METHOD_ENDS_WITH_IGNORE_CASE';

export interface PaginationRequest {
  offset?: number | string;
  limit?: number;
  asc?: boolean;
}