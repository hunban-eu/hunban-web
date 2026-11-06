"use server";

import { headers } from "next/headers";
import { createAuthSupabase } from "@/lib/supabase-auth";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

// Sends a magic login link. The answer is the same whether or not the email
// is registered, so the form can't be used to find out who is on the board.
// The real gate is in the database: the "Before User Created" hook refuses
// any email that is not in job_board_users.
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const redirectTo = `${proto}://${host}/jobs/auth/confirm`;

  const supabase = await createAuthSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    if (error.status === 429) {
      return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
    }
    // Unregistered emails land here too (the hook says no). Don't reveal it.
    console.warn("Magic link not sent:", error.status, error.message);
  }

  return {
    status: "sent",
    message: `If ${email} is registered for the HunBAN job board, a login link is on its way. It works once and expires in an hour.`,
  };
}
