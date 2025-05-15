/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
      supabase: SupabaseClient<Database>;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_API_URL?: string;
  readonly OPENROUTER_DEFAULT_MODEL?: string;
  readonly SITE_URL?: string;
  readonly SITE_TITLE?: string;
  // more env variables...
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
