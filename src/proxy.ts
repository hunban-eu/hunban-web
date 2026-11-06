import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_HOURS } from "@/lib/jobs";

// Runs before the job board's private pages only (see matcher below).
// It keeps the founder's login fresh and sends logged-out visitors from the
// dashboard to the login page. Public pages never pass through here.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookieOptions: { maxAge: LOGIN_HOURS * 60 * 60 },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Hard limit: a login lasts at most 8 hours from the moment the founder
  // clicked their magic link, active or not. After that, log out and ask
  // for a new link. (Supabase's own session limit is a paid feature.)
  const signedIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  if (user && Date.now() - signedIn > LOGIN_HOURS * 60 * 60 * 1000) {
    await supabase.auth.signOut();
    user = null;
  }

  if (!user && request.nextUrl.pathname.startsWith("/jobs/dashboard")) {
    const login = request.nextUrl.clone();
    login.pathname = "/jobs/login";
    login.search = "";
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/jobs/dashboard/:path*", "/jobs/login"],
};
