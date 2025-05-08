import type { APIRoute } from "astro";
import { supabaseClient } from "../../db/supabase.client";
import { RecommendationsService } from "../../lib/services/recommendations.service";
import { recommendationResponseSchema } from "../../lib/schemas/recommendations.schema";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    const recommendationsService = new RecommendationsService(supabaseClient);
    const recommendation = await recommendationsService.generateRecommendation();

    // Validate response
    const validatedResponse = recommendationResponseSchema.parse(recommendation);

    return new Response(JSON.stringify(validatedResponse), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating recommendation:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate recommendation",
        details: error instanceof Error ? error.message : "Unknown error",
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
