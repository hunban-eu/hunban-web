import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAuthSupabase } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The magic link in the email lands here. Logging in needs one click on the
// button, on purpose: corporate email scanners open every link in an email
// to check it, and if opening the link logged in by itself, the scanner
// would use up the one-time link before the founder ever clicked it.
async function confirm(formData: FormData) {
  "use server";
  const token_hash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;
  if (!token_hash) redirect("/jobs/login?error=link");

  const supabase = await createAuthSupabase();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (error) {
    console.warn("Magic link verification failed:", error.message);
    redirect("/jobs/login?error=link");
  }
  redirect("/jobs/dashboard");
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;
  if (!token_hash) redirect("/jobs/login?error=link");

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="text-3xl font-bold tracking-[-0.01em] sm:text-4xl">Log in to the job board</h1>
      <form action={confirm} className="mt-8">
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type ?? "email"} />
        <button
          type="submit"
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent"
        >
          Continue to my dashboard
        </button>
      </form>
    </section>
  );
}
