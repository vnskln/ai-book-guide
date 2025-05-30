import type { APIRoute } from "astro";
import { z } from "zod";
import type { UpdateUserPreferencesDto } from "@/types";
import { logger } from "@/lib/utils/logger";

const updatePreferencesSchema = z.object({
  reading_preferences: z
    .string()
    .min(1, "Reading preferences are required")
    .max(1000, "Reading preferences cannot exceed 1000 characters"),
  preferred_language: z.string().min(1, "Preferred language is required"),
});

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { data: preferences, error } = await locals.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", locals.user.id)
      .single();

    if (error) {
      logger.error("Failed to fetch preferences:", { error });
      return new Response(JSON.stringify({ error: { message: "Failed to fetch preferences" } }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
    });
  } catch (error) {
    logger.error("Internal server error in GET /api/preferences:", { error });
    return new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = (await request.json()) as UpdateUserPreferencesDto;

    const validationResult = updatePreferencesSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Invalid preferences input:", { errors: validationResult.error.errors });
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid input",
            details: validationResult.error.errors,
          },
        }),
        { status: 400 }
      );
    }

    // Log the update attempt
    logger.info("Attempting to update preferences:", {
      reading_preferences: body.reading_preferences.substring(0, 50) + "...",
      preferred_language: body.preferred_language,
    });

    const { data: preferences, error } = await locals.supabase
      .from("user_preferences")
      .update({
        reading_preferences: body.reading_preferences,
        preferred_language: body.preferred_language,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", locals.user.id)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update preferences in Supabase:", { error });
      return new Response(
        JSON.stringify({ error: { message: "Failed to update preferences", details: error.message } }),
        {
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
    });
  } catch (error) {
    logger.error("Internal server error in PUT /api/preferences:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = (await request.json()) as UpdateUserPreferencesDto;

    const validationResult = updatePreferencesSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Invalid preferences input:", { errors: validationResult.error.errors });
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid input",
            details: validationResult.error.errors,
          },
        }),
        { status: 400 }
      );
    }

    // Check if preferences already exist
    const { data: existingPreferences } = await locals.supabase
      .from("user_preferences")
      .select()
      .eq("user_id", locals.user.id)
      .single();

    if (existingPreferences) {
      logger.warn("Preferences already exist for user:", { userId: locals.user.id });
      return new Response(
        JSON.stringify({
          error: {
            message: "Preferences already exist for this user",
            details: "Use PUT /api/preferences to update existing preferences",
          },
        }),
        { status: 409 }
      );
    }

    // Log the creation attempt
    logger.info("Attempting to create preferences:", {
      reading_preferences: body.reading_preferences.substring(0, 50) + "...",
      preferred_language: body.preferred_language,
    });

    const { data: preferences, error } = await locals.supabase
      .from("user_preferences")
      .insert([
        {
          user_id: locals.user.id,
          reading_preferences: body.reading_preferences,
          preferred_language: body.preferred_language,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Failed to create preferences in Supabase:", { error });
      return new Response(
        JSON.stringify({ error: { message: "Failed to create preferences", details: error.message } }),
        {
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify(preferences), {
      status: 201,
    });
  } catch (error) {
    logger.error("Internal server error in POST /api/preferences:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
      status: 500,
    });
  }
};
