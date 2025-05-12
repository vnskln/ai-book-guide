import type { APIRoute } from "astro";
import { RecommendationsService } from "../../lib/services/recommendations.service";
import { UserBooksService } from "../../lib/services/user-books.service";
import {
  recommendationQuerySchema,
  recommendationResponseSchema,
  updateRecommendationStatusSchema,
} from "../../lib/schemas/recommendations.schema";
import { RecommendationStatus, UserBookStatus } from "../../types";
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
      status: params.status || undefined,
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
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Extract recommendation ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
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

      // Create user book entry for both accepted and rejected recommendations
      try {
        const userBooksService = new UserBooksService(locals.supabase);
        if (status === RecommendationStatus.ACCEPTED) {
          await userBooksService.createUserBookFromRecommendation(DEFAULT_USER_ID, id);
        } else if (status === RecommendationStatus.REJECTED) {
          // Get book details from recommendation
          const { data: recommendation } = await locals.supabase
            .from("recommendations")
            .select("book_id, books!inner(title, language, book_authors!inner(authors!inner(id, name)))")
            .eq("id", id)
            .single();

          if (recommendation) {
            await userBooksService.createUserBook(DEFAULT_USER_ID, {
              book: {
                title: recommendation.books.title,
                language: recommendation.books.language,
                authors: recommendation.books.book_authors.map((ba: any) => ({
                  name: ba.authors.name,
                })),
              },
              status: UserBookStatus.REJECTED,
              recommendation_id: id,
            });
          }
        }
      } catch (error) {
        // Log error but don't fail the request if user book creation fails
        logger.error("Failed to create user book from recommendation", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          recommendationId: id,
          userId: DEFAULT_USER_ID,
        });
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
