import type { APIRoute } from "astro";
import { RecommendationsService } from "../../../lib/services/recommendations.service";
import { UserBooksService } from "../../../lib/services/user-books.service";
import { updateRecommendationStatusSchema } from "../../../lib/schemas/recommendations.schema";
import { RecommendationStatus } from "../../../types";
import { logger } from "../../../lib/utils/logger";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Extract recommendation ID from URL params
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          details: "Recommendation ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      logger.warn("Invalid JSON in request body", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          details: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate request body against schema
    const result = updateRecommendationStatusSchema.safeParse(requestBody);
    if (!result.success) {
      logger.warn("Invalid request body", {
        errors: result.error.format(),
        body: requestBody,
      });

      return new Response(
        JSON.stringify({
          error: "Bad Request",
          details: "Invalid request body",
          validationErrors: result.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { status } = result.data;

    // Initialize services
    const recommendationsService = new RecommendationsService(locals.supabase);

    try {
      // Update recommendation status
      const updatedRecommendation = await recommendationsService.updateRecommendationStatus(
        id,
        DEFAULT_USER_ID,
        status
      );

      // If recommendation is accepted, create user book entry
      if (status === RecommendationStatus.ACCEPTED) {
        try {
          const userBooksService = new UserBooksService(locals.supabase);
          await userBooksService.createUserBookFromRecommendation(DEFAULT_USER_ID, id);
        } catch (error) {
          // Log error but don't fail the request if user book creation fails
          logger.error("Failed to create user book from recommendation", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            recommendationId: id,
            userId: DEFAULT_USER_ID,
          });
        }
      }

      // Return successful response
      return new Response(JSON.stringify(updatedRecommendation), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Recommendation not found") {
          return new Response(
            JSON.stringify({
              error: "Not Found",
              details: "Recommendation not found",
            }),
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        if (error.message === "User does not own this recommendation") {
          return new Response(
            JSON.stringify({
              error: "Forbidden",
              details: "You do not have permission to update this recommendation",
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      // Log any other errors
      logger.error("Error updating recommendation status", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        id,
        userId: DEFAULT_USER_ID,
        status,
      });

      // Return generic server error
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
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
  } catch (error) {
    // Catch any unexpected errors
    logger.error("Unexpected error in recommendation status update endpoint", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params,
    });

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
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
