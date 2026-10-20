import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read-only connection to the HunBAN Supabase database.
//
// It uses the PUBLISHABLE key, which is safe to expose: Row Level Security
// only lets it read rows marked as published, and it can never write.
// The secret key is never used by the website.
//
// Returns null when the two environment variables are missing (for example
// before they are added in Vercel), so pages can show a friendly message
// instead of crashing the build.

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    client = null;
    return client;
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
