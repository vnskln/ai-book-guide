import type { APIContext } from "astro";
import { ZodError, type AnyZodObject } from "zod";
import { BadRequestError } from "../lib/errors";

export async function validateRequest<T extends AnyZodObject>(request: Request, schema: T): Promise<T["_output"]> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestError(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
    }
    throw error;
  }
}

export function createValidationMiddleware<T extends AnyZodObject>(schema: T) {
  return async (context: APIContext) => {
    if (context.request.method === "POST" || context.request.method === "PUT") {
      const clonedRequest = context.request.clone();
      await validateRequest(clonedRequest, schema);
    }
    return context;
  };
}
