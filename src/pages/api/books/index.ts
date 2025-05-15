import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const { data, error } = await locals.supabase.from("books").select("*");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const book = await request.json();

    const { data, error } = await locals.supabase.from("books").insert(book).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data[0] || null), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create book" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
