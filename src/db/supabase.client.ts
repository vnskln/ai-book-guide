import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../db/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// Server-side client creation
export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get: (name: string) => {
        return context.cookies.get(name)?.value;
      },
      set: (name: string, value: string, options: CookieOptions) => {
        context.cookies.set(name, value, options);
      },
      remove: (name: string, options: CookieOptions) => {
        context.cookies.delete(name, options);
      },
    },
  });
};

// Browser-side client creation - only used in client components
let browserClient: ReturnType<typeof createServerClient<Database>> | null = null;

export const createBrowserSupabaseClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Browser client cannot be used on the server side");
  }

  if (!browserClient) {
    browserClient = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => {
          const cookies = document.cookie.split("; ");
          const cookie = cookies.find((row) => row.startsWith(name + "="));
          return cookie ? cookie.split("=")[1] : undefined;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          document.cookie = `${name}=${value}; path=${options.path}; ${
            options.secure ? "secure;" : ""
          } ${options.httpOnly ? "httpOnly;" : ""} samesite=${options.sameSite}`;
        },
        remove: (name: string, options: CookieOptions) => {
          document.cookie = `${name}=; path=${options.path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    });
  }

  return browserClient;
};

export type SupabaseClient = ReturnType<typeof createServerClient<Database>>;

export const DEFAULT_USER_ID = "4220c9de-b650-47a9-902e-18fca8f33b58";
