import type { APIRoute } from "astro";
import { createUserBookSchema } from "../../lib/schemas/user-books.schema";
import { UserBooksService } from "../../lib/services/user-books.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { getUserBooksQuerySchema } from "../../lib/schemas/user-books.schema";
import { BadRequestError } from "../../lib/errors/http";

export const prerender = false;

const JSON_RESPONSE_HEADERS = {
  "Content-Type": "application/json",
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createUserBookSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: JSON_RESPONSE_HEADERS,
        }
      );
    }

    // Create user book
    const userBooksService = new UserBooksService(locals.supabase);
    const result = await userBooksService.createUserBook(DEFAULT_USER_ID, validationResult.data);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: JSON_RESPONSE_HEADERS,
    });
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Book already exists in user's collection") {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 409,
          headers: JSON_RESPONSE_HEADERS,
        });
      }
      if (error.message === "Invalid recommendation_id") {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: JSON_RESPONSE_HEADERS,
        });
      }
    }

    // Handle unexpected errors
    console.error("Error creating user book:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: JSON_RESPONSE_HEADERS,
    });
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Use DEFAULT_USER_ID instead of checking auth
    const userId = DEFAULT_USER_ID;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get("status") || undefined,
      is_recommended: url.searchParams.get("is_recommended") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    };

    const validationResult = getUserBooksQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      throw new BadRequestError(
        "Invalid query parameters: " +
          validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      );
    }

    // Get user books through service
    const userBooksService = new UserBooksService(locals.supabase);
    const userBooks = await userBooksService.getUserBooks(userId, validationResult.data);

    // Return successful response
    return new Response(JSON.stringify(userBooks), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.error("Error in GET /api/user-books:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
