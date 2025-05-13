import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient as supabase } from "@/db/supabase.client";
import type { UpdateUserPreferencesDto } from "@/types";

const updatePreferencesSchema = z.object({
  reading_preferences: z
    .string()
    .min(1, "Reading preferences are required")
    .max(1000, "Reading preferences cannot exceed 1000 characters"),
  preferred_language: z.string().min(1, "Preferred language is required"),
});

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data: preferences, error } = await supabase.from("user_preferences").select("*").single();

    if (error) {
      return new Response(JSON.stringify({ error: { message: "Failed to fetch preferences" } }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as UpdateUserPreferencesDto;

    const validationResult = updatePreferencesSchema.safeParse(body);
    if (!validationResult.success) {
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

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .update({
        reading_preferences: body.reading_preferences,
        preferred_language: body.preferred_language,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: { message: "Failed to update preferences" } }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: { message: "Internal server error" } }), {
      status: 500,
    });
  }
};
