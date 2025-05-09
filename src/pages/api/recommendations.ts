import type { APIRoute } from "astro";
import { RecommendationsService } from "../../lib/services/recommendations.service";
import { recommendationQuerySchema, recommendationResponseSchema } from "../../lib/schemas/recommendations.schema";
import { logger } from "../../lib/utils/logger";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const recommendationsService = new RecommendationsService(locals.supabase);
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
    logger.error("Error generating recommendation:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

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

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const params = {
      status: url.searchParams.get("status"),
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    };

    // Validate query parameters
    const result = recommendationQuerySchema.safeParse({
      status: params.status,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });

    if (!result.success) {
      logger.warn("Invalid query parameters", {
        errors: result.error.format(),
        params,
      });

      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { status, page, limit } = result.data;

    // Initialize service and fetch recommendations using DEFAULT_USER_ID
    const recommendationsService = new RecommendationsService(locals.supabase);
    const recommendations = await recommendationsService.getRecommendations(DEFAULT_USER_ID, status, page, limit);

    // Return successful response
    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Log error details
    logger.error("Error in recommendations endpoint", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: "An unexpected error occurred while processing your request",
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
