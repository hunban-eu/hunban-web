import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Logged-in connection for the job board dashboard.
//
// Same PUBLISHABLE key as the public site, but it carries the founder's
// login (a session cookie), so Row Level Security knows who is asking and
// only lets them see and change their own startup's listings.
// Only the /jobs login and dashboard pages use this, so the rest of the
// site still sets no cookies.
export async function createAuthSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components can't set cookies; the proxy (src/proxy.ts)
        // refreshes the session there instead, so this may safely fail.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
