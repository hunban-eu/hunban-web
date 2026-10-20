import { getSupabase } from "@/lib/supabase";

export type EventItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  organiser: string | null;
  registration_url: string | null;
  is_hunban: boolean;
};

export type EventsResult =
  | { status: "ok"; events: EventItem[] }
  | { status: "not-configured" }
  | { status: "error" };

// Upcoming published events, soonest first.
// "Upcoming" = not finished yet: either it ends in the future, or it has
// no end time and started less than 6 hours ago (so an event that is on
// right now still shows). Row Level Security already hides unpublished rows.
export async function getUpcomingEvents(): Promise<EventsResult> {
  const supabase = getSupabase();
  if (!supabase) return { status: "not-configured" };

  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("events")
    .select("id, title, starts_at, ends_at, venue, organiser, registration_url, is_hunban")
    .or(
      `ends_at.gte.${now.toISOString()},and(ends_at.is.null,starts_at.gte.${sixHoursAgo.toISOString()})`,
    )
    .order("starts_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Could not load events:", error.message);
    return { status: "error" };
  }
  return { status: "ok", events: data ?? [] };
}
