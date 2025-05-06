import { z } from "zod";

export const createPreferencesSchema = z.object({
  reading_preferences: z.string().max(1000, "Reading preferences cannot exceed 1000 characters"),
  preferred_language: z.string().min(2, "Language code must be at least 2 characters"),
});

export type CreatePreferencesInput = z.infer<typeof createPreferencesSchema>;
