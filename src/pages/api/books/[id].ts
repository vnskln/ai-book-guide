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

    const { data, error } = await locals.supabase.from("books").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Book not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch book" }), {
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

    const { data, error } = await locals.supabase.from("books").update(updates).eq("id", id).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data[0] || null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update book" }), {
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

    const { error } = await locals.supabase.from("books").delete().eq("id", id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete book" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
