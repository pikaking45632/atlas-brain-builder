import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let browserClient: SupabaseClient<Database> | null = null;

export const getBackendClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || typeof window === "undefined") {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(url, key, {
      auth: {
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
};
