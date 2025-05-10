import { z } from "zod";
import { RecommendationStatus } from "../../types";

// Schema for query parameters validation
export const recommendationQuerySchema = z.object({
  status: z.nativeEnum(RecommendationStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).optional().default(20),
});

// Schema for pagination info
export const paginationInfoSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
});

// Schema for author in response
export const authorResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// Schema for book in response
export const bookResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  language: z.string(),
  authors: z.array(authorResponseSchema),
});

// Schema for single recommendation in response
export const recommendationResponseSchema = z.object({
  id: z.string().uuid(),
  book: bookResponseSchema,
  plot_summary: z.string(),
  rationale: z.string(),
  ai_model: z.string(),
  execution_time: z.number(),
  status: z.nativeEnum(RecommendationStatus),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

// Schema for paginated recommendations response
export const paginatedRecommendationResponseSchema = z.object({
  data: z.array(recommendationResponseSchema),
  pagination: paginationInfoSchema,
});

// Type exports
export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
export type PaginatedRecommendationResponse = z.infer<typeof paginatedRecommendationResponseSchema>;

export const updateRecommendationStatusSchema = z.object({
  status: z.enum([RecommendationStatus.ACCEPTED, RecommendationStatus.REJECTED]),
});

export type UpdateRecommendationStatus = z.infer<typeof updateRecommendationStatusSchema>;
