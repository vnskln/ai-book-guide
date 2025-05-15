import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Book ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await locals.supabase.from("books").select("*").eq("id", id).single();

    if (result.error) {
      if (result.error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Book not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch book";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Book ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updates = await request.json();
    const result = await locals.supabase.from("books").update(updates).eq("id", id).select();

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.data[0] || null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update book";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Book ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await locals.supabase.from("books").delete().eq("id", id);

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete book";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
