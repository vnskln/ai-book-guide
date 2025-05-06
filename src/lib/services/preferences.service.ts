import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateUserPreferencesDto, UserPreferencesResponseDto } from "../../types";
import { BadRequestError, ConflictError } from "../errors";
import { createPreferencesSchema } from "../schemas/preferences.schema";
import { logger } from "../utils/logger";

export class PreferencesService {
  constructor(private supabase: SupabaseClient) {}

  async getPreferences(userId: string): Promise<UserPreferencesResponseDto | null> {
    const { data, error } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      logger.error("Failed to fetch preferences", { error, userId });
      throw new Error(`Database error: ${error.message}`);
    }
    return data;
  }

  async createPreferences(userId: string, data: CreateUserPreferencesDto): Promise<UserPreferencesResponseDto> {
    const validationResult = createPreferencesSchema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestError("Invalid input data");
    }

    const existingPrefs = await this.getPreferences(userId);
    if (existingPrefs) {
      throw new ConflictError("Preferences already exist for this user");
    }

    const { data: newPrefs, error } = await this.supabase
      .from("user_preferences")
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      logger.error("Failed to create preferences", { error, userId });
      throw new Error(`Database error: ${error.message}`);
    }
    return newPrefs;
  }
}
