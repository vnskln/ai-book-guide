import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/new-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });
  locals.supabase = supabase;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Add user data to locals if session exists
  if (session) {
    locals.user = {
      id: session.user.id,
      email: session.user.email,
    };
  } else if (!PUBLIC_PATHS.includes(new URL(request.url).pathname)) {
    // Redirect to login for protected routes
    return redirect("/login");
  }

  return next();
});
