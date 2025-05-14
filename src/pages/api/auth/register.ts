import type { APIRoute } from "astro";
import { z } from "zod";
import { validateRequest } from "../../../middleware/validation";
import { BadRequestError } from "../../../lib/errors/http";
import { logger } from "../../../lib/utils/logger";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    passwordConfirmation: z.string(),
  })
  .strict();

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    logger.info("Starting user registration process");

    const data = await validateRequest(request, registerSchema);
    logger.info("Request validation passed", { email: data.email });

    if (data.password !== data.passwordConfirmation) {
      logger.warn("Password confirmation mismatch", { email: data.email });
      throw new BadRequestError("Passwords don't match");
    }

    logger.info("Attempting Supabase signup", { email: data.email });
    const { data: authData, error } = await locals.supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      logger.error("Supabase signup failed", {
        error: error.message,
        code: error.status,
        email: data.email,
      });
      throw new BadRequestError(error.message);
    }

    logger.info("User registration successful", {
      userId: authData.user?.id,
      email: data.email,
    });

    return new Response(JSON.stringify({ user: authData.user }), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn("Registration validation error", {
        error: error.message,
        code: error.statusCode,
      });
      return new Response(JSON.stringify({ error: error.message }), { status: error.statusCode });
    }

    logger.error("Unexpected error during registration", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(JSON.stringify({ error: "Registration failed" }), { status: 500 });
  }
};
