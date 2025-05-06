import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { logger } from "../../lib/utils/logger";
import { PreferencesService } from "../../lib/services/preferences.service";
import { APIError } from "../../lib/errors";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPreferencesSchema } from "../../lib/schemas/preferences.schema";
import { validateRequest } from "../../middleware/validation";

export const prerender = false;

interface Locals {
  supabase: SupabaseClient;
  user?: {
    id: string;
  };
}

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;

  try {
    const preferencesService = new PreferencesService(supabase);
    const preferences = await preferencesService.getPreferences(DEFAULT_USER_ID);

    if (!preferences) {
      logger.info("Preferences not found for user", { userId: DEFAULT_USER_ID });
      return new Response(JSON.stringify({ error: "Preferences not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    logger.info("Preferences retrieved successfully", { userId: DEFAULT_USER_ID });
    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Error in preferences endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const typedLocals = locals as Locals;
    const supabase = typedLocals.supabase;

    // Validate request body
    const validatedBody = await validateRequest(request, createPreferencesSchema);
    logger.info("Received valid preferences creation request", { userId: DEFAULT_USER_ID });

    // Create preferences using service
    const preferencesService = new PreferencesService(supabase);
    const preferences = await preferencesService.createPreferences(DEFAULT_USER_ID, validatedBody);

    logger.info("Preferences created successfully", { userId: DEFAULT_USER_ID, preferencesId: preferences.id });
    return new Response(JSON.stringify(preferences), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error;
    }

    // Handle known errors
    if (error instanceof APIError) {
      logger.warn("API error in preferences creation", {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
            code: error.code,
          },
        }),
        {
          status: error.statusCode,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle unknown errors
    logger.error("Unexpected error in preferences creation:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
