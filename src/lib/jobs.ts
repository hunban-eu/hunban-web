import { getSupabase } from "@/lib/supabase";

// Shared job board settings and helpers.

export const LISTING_DAYS = 15; // a listing is live this many days after publish/refresh
export const REMINDER_DAY = 13; // reminder email goes out on this day

export const employmentTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
] as const;

export const workModes = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
] as const;

export type EmploymentType = (typeof employmentTypes)[number]["value"];
export type WorkMode = (typeof workModes)[number]["value"];

export type Listing = {
  id: string;
  startup_id: string;
  position: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  city: string | null;
  description: string | null;
  apply_url: string;
  refreshed_at: string;
};

export function labelOf(list: readonly { value: string; label: string }[], value: string) {
  return list.find((x) => x.value === value)?.label ?? value;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function expiresAt(refreshedAt: string) {
  return new Date(new Date(refreshedAt).getTime() + LISTING_DAYS * DAY_MS);
}

export function isLive(refreshedAt: string, now = new Date()) {
  return expiresAt(refreshedAt) > now;
}

// Whole days left until a listing is hidden (0 = hidden today).
export function daysLeft(refreshedAt: string, now = new Date()) {
  return Math.max(0, Math.ceil((expiresAt(refreshedAt).getTime() - now.getTime()) / DAY_MS));
}

// Dates are always shown in Budapest time.
export const formatDate = (iso: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export type StartupJobs = { id: string; name: string; listings: Listing[] };

export type JobsResult =
  | { status: "ok"; startups: StartupJobs[] }
  | { status: "not-configured" }
  | { status: "error" };

// Public page: live listings grouped by startup, startups A to Z.
// Row Level Security already returns only live listings and only the
// startups that have at least one.
export async function getLiveJobs(): Promise<JobsResult> {
  const supabase = getSupabase();
  if (!supabase) return { status: "not-configured" };

  const [startups, listings] = await Promise.all([
    supabase.from("job_board_startups").select("id, name"),
    supabase
      .from("job_listings")
      .select("id, startup_id, position, employment_type, work_mode, city, description, apply_url, refreshed_at")
      .order("refreshed_at", { ascending: false })
      .limit(500),
  ]);

  if (startups.error || listings.error) {
    console.error("Could not load jobs:", startups.error?.message ?? listings.error?.message);
    return { status: "error" };
  }

  return { status: "ok", startups: groupByStartup(startups.data ?? [], (listings.data ?? []) as Listing[]) };
}

export function groupByStartup(startups: { id: string; name: string }[], listings: Listing[]): StartupJobs[] {
  return startups
    .map((s) => ({ ...s, listings: listings.filter((l) => l.startup_id === s.id) }))
    .filter((s) => s.listings.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}
