import { z } from "zod";
import { RecommendationStatus } from "../../types";

// Author schema for nested validation
const authorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

// Book schema for nested validation
const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  language: z.string().min(2),
  authors: z.array(authorSchema),
});

// Main recommendation response schema
export const recommendationResponseSchema = z.object({
  id: z.string().uuid(),
  book: bookSchema,
  plot_summary: z.string().min(1),
  rationale: z.string().min(1),
  ai_model: z.string(),
  execution_time: z.number().positive(),
  status: z.nativeEnum(RecommendationStatus),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;
