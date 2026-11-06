import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAuthSupabase } from "@/lib/supabase-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Job board login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  link: "That login link has expired or was already used. Request a new one below.",
};

export default async function JobsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createAuthSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/jobs/dashboard");

  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="text-3xl font-bold tracking-[-0.01em] sm:text-4xl">Post a job</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        For startups in the HunBAN network. Enter the email HunBAN registered for your startup and we&apos;ll
        send you a login link. No password needed.
      </p>
      <div className="mt-8">
        <LoginForm initialError={error ? errors[error] : undefined} />
      </div>
      <p className="mt-10 text-sm text-ink-muted">
        Not registered yet? Write to{" "}
        <a href="mailto:info@hunban.eu" className="font-semibold text-ink underline underline-offset-4">
          info@hunban.eu
        </a>
        .
      </p>
    </section>
  );
}
