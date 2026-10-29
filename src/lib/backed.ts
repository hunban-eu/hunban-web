import { getSupabase } from "@/lib/supabase";

// Founders backed by HunBAN members, edited by Adam in the Supabase
// "backed_founders" table. Row Level Security only returns published rows.
// The counter comes from backed_startups_count(): it counts startups, not
// founders, and includes unpublished rows that are switched to count.

export type BackedFounder = {
  id: string;
  full_name: string;
  position: string | null;
  startup_name: string;
  year: number | null;
};

export async function getBackedFounders(): Promise<{ founders: BackedFounder[]; startups: number | null }> {
  const supabase = getSupabase();
  if (!supabase) return { founders: [], startups: null };

  const [founders, count] = await Promise.all([
    supabase
      .from("backed_founders")
      .select("id, full_name, position, startup_name, year")
      .eq("is_published", true)
      .order("year", { ascending: false, nullsFirst: false })
      .order("startup_name", { ascending: true })
      .order("full_name", { ascending: true })
      .returns<BackedFounder[]>(),
    supabase.rpc("backed_startups_count"),
  ]);

  if (founders.error) console.error("Could not load backed founders:", founders.error.message);
  if (count.error) console.error("Could not load backed startups count:", count.error.message);

  return {
    founders: founders.data ?? [],
    startups: count.data === null || count.data === undefined ? null : Number(count.data),
  };
}
