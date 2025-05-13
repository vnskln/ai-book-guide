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
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });
  locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add user data to locals if user exists
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email || undefined,
    };
  } else if (!PUBLIC_PATHS.includes(new URL(request.url).pathname)) {
    // Redirect to login for protected routes
    return redirect("/login");
  }

  return next();
});
