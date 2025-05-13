import type { APIRoute } from "astro";
import { z } from "zod";
import { validateRequest } from "../../../middleware/validation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
  try {
    const { email, password } = await validateRequest(request, loginSchema);

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Login failed" }), { status: 400 });
    }

    return new Response(JSON.stringify({ user: data.user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Login failed" }), { status: 400 });
  }
};
