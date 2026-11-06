import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAuthSupabase } from "@/lib/supabase-auth";
import { LISTING_DAYS, REMINDER_DAY, isLive, type Listing } from "@/lib/jobs";
import { signOut } from "./actions";
import ListingCard from "./ListingCard";
import ListingForm from "./ListingForm";

export const metadata: Metadata = {
  title: "Job board dashboard",
  robots: { index: false, follow: false },
};

// Always fresh: this page shows the founder's own data.
export const dynamic = "force-dynamic";

const SELECT = "id, startup_id, position, employment_type, work_mode, city, description, apply_url, refreshed_at";

// Live listings first (newest first), hidden ones after.
function sortListings(a: Listing, b: Listing) {
  const live = Number(isLive(b.refreshed_at)) - Number(isLive(a.refreshed_at));
  return live || b.refreshed_at.localeCompare(a.refreshed_at);
}

export default async function DashboardPage() {
  const supabase = await createAuthSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/jobs/login");

  const { data: me } = await supabase
    .from("job_board_users")
    .select("startup_id, startup_name, is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  const header = (title: string) => (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">Job board</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.01em] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Logged in as {user.email}</p>
      </div>
      <div className="flex gap-4 text-sm font-semibold">
        <a href="/jobs" target="_blank" rel="noopener" className="underline underline-offset-4">
          View public page <span aria-hidden="true">↗</span>
        </a>
        <form action={signOut}>
          <button type="submit" className="underline underline-offset-4">
            Log out
          </button>
        </form>
      </div>
    </div>
  );

  if (!me) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        {header("No access")}
        <p className="mt-8 max-w-xl">
          This email is no longer registered for the HunBAN job board. If you think this is a mistake, write to{" "}
          <a href="mailto:info@hunban.eu" className="font-semibold underline underline-offset-4">
            info@hunban.eu
          </a>
          .
        </p>
      </section>
    );
  }

  const [{ data: listings }, { data: startups }] = await Promise.all([
    supabase.from("job_listings").select(SELECT).limit(1000),
    supabase.from("job_board_startups").select("id, name").order("name"),
  ]);
  const all = ((listings ?? []) as Listing[]).sort(sortListings);
  const startupList = startups ?? [];

  const rules = (
    <p className="mt-4 max-w-2xl text-sm text-ink-muted">
      New listings go live on the public jobs page straight away and stay up for {LISTING_DAYS} days. On day{" "}
      {REMINDER_DAY} we email you a reminder: press Refresh to keep a role up for another {LISTING_DAYS} days.
      Hidden listings stay here for 3 months, so you can bring them back with Reactivate. Using the job board
      is free and creates no contract; we trust your common sense, and remove listings or access if we see
      misuse.
    </p>
  );

  // Admin view: every startup's listings.
  if (me.is_admin) {
    const groups = startupList
      .map((s) => ({ ...s, listings: all.filter((l) => l.startup_id === s.id) }))
      .sort((a, b) => b.listings.length - a.listings.length || a.name.localeCompare(b.name));
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        {header("All listings (admin)")}
        {rules}

        <details className="mt-10 rounded-md bg-surface-alt p-5 sm:p-6">
          <summary className="cursor-pointer font-semibold">Add a listing for a startup</summary>
          <div className="mt-6">
            {startupList.length ? (
              <ListingForm startups={startupList} />
            ) : (
              <p className="text-sm text-ink-muted">No startups yet. Add a user in Supabase first.</p>
            )}
          </div>
        </details>

        <div className="mt-12 grid gap-12">
          {groups.map((g) => (
            <section key={g.id}>
              <h2 className="text-2xl font-bold">
                {g.name} <span className="text-base font-medium text-ink-muted">({g.listings.length})</span>
              </h2>
              {g.listings.length ? (
                <ul className="mt-4 grid gap-4">
                  {g.listings.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">No listings.</p>
              )}
            </section>
          ))}
        </div>
      </section>
    );
  }

  // Founder view: their startup's listings.
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
      {header(me.startup_name ?? "Your startup")}
      {rules}

      <details className="mt-10 rounded-md bg-surface-alt p-5 sm:p-6" open={all.length === 0}>
        <summary className="cursor-pointer font-semibold">Add a listing</summary>
        <div className="mt-6">
          <ListingForm startupId={me.startup_id ?? undefined} />
        </div>
      </details>

      <h2 className="mt-12 text-2xl font-bold">Your listings</h2>
      {all.length ? (
        <ul className="mt-4 grid gap-4">
          {all.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">No listings yet.</p>
      )}
    </section>
  );
}
