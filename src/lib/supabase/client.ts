import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Browser client using the publishable key only.
 * Tables are protected by RLS with no public policies, so this client
 * cannot read or write application data. All mutations go through
 * Next.js server actions and the service-role client.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase browser credentials are not configured.");
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
