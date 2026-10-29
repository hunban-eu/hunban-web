import { getSupabase } from "@/lib/supabase";

// The people and organisations behind HunBAN, for the About page.
//
// Members and institutions are only listed when they agreed to be shown:
// Row Level Security returns members who are published AND gave consent,
// and institutions that are published. The counter is different: it comes
// from the network_counts() database function, which returns only two totals,
// never names: angel memberships that count (not second representatives, not
// institutional representatives) and institutions.

export type NetworkMember = {
  id: string;
  full_name: string;
  photo_url: string | null;
  linkedin_url: string | null;
  position: string | null;
  institution: string | null;
  // "angel" = own angel membership, listed under Our members.
  // "institutional" = represents `institution`, listed under Institutional members.
  membership: "angel" | "institutional";
};

export type NetworkInstitution = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export type NetworkData = {
  counts: { angels: number; institutions: number } | null;
  members: NetworkMember[];
  institutions: NetworkInstitution[];
};

type MemberRow = Omit<NetworkMember, "institution"> & { institutions: { name: string } | null };

const byName = (a: { name?: string; full_name?: string }, b: { name?: string; full_name?: string }) =>
  (a.full_name ?? a.name ?? "").localeCompare(b.full_name ?? b.name ?? "", "hu");

export async function getNetwork(): Promise<NetworkData> {
  const empty: NetworkData = { counts: null, members: [], institutions: [] };
  const supabase = getSupabase();
  if (!supabase) return empty;

  const [counts, members, institutions] = await Promise.all([
    supabase.rpc("network_counts").single<{ angels: number; institutions: number }>(),
    supabase
      .from("members")
      .select("id, full_name, photo_url, linkedin_url, position, membership, institutions(name)")
      .eq("is_published", true)
      .eq("consent_given", true)
      .returns<MemberRow[]>(),
    supabase
      .from("institutions")
      .select("id, name, logo_url, website_url")
      .eq("is_published", true)
      .returns<NetworkInstitution[]>(),
  ]);

  if (counts.error) console.error("Could not load network counts:", counts.error.message);
  if (members.error) console.error("Could not load members:", members.error.message);
  if (institutions.error) console.error("Could not load institutions:", institutions.error.message);

  return {
    counts: counts.data ? { angels: Number(counts.data.angels), institutions: Number(counts.data.institutions) } : null,
    members: (members.data ?? [])
      .map(({ institutions: inst, ...m }) => ({ ...m, institution: inst?.name ?? null }))
      .sort(byName),
    institutions: (institutions.data ?? []).sort(byName),
  };
}
