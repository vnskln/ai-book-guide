import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const result = await locals.supabase.from("books").select("*");
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.data || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch books";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const book = await request.json();
    const result = await locals.supabase.from("books").insert(book).select();

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.data[0] || null), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create book";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
