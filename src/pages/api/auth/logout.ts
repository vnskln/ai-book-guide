import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals }) => {
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Logged out successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Logout failed" }), { status: 500 });
  }
};
