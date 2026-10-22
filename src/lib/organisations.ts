import { getSupabase } from "@/lib/supabase";

export type MapLabel = { name: string; slug: string; sort_order: number };

export type MapOrganisation = {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  is_highlighted: boolean;
  labels: MapLabel[];
};

export type MapResult =
  | { status: "ok"; organisations: MapOrganisation[]; labels: MapLabel[] }
  | { status: "not-configured" }
  | { status: "error" };

type Row = Omit<MapOrganisation, "labels" | "latitude" | "longitude"> & {
  latitude: number | null;
  longitude: number | null;
  organisation_labels: { labels: MapLabel | null }[];
};

// Published organisations with their type labels, for the ecosystem map.
// Row Level Security already hides unpublished entries; the database also
// guarantees every published entry has coordinates.
export async function getMapData(): Promise<MapResult> {
  const supabase = getSupabase();
  if (!supabase) return { status: "not-configured" };

  const { data, error } = await supabase
    .from("organisations")
    .select(
      "id, name, description, website_url, linkedin_url, city, latitude, longitude, is_highlighted, organisation_labels(labels(name, slug, sort_order))",
    )
    .eq("is_published", true)
    .order("name")
    .limit(2000)
    .returns<Row[]>();

  if (error) {
    console.error("Could not load map data:", error.message);
    return { status: "error" };
  }

  const organisations: MapOrganisation[] = (data ?? [])
    .filter((o) => o.latitude !== null && o.longitude !== null)
    .map(({ organisation_labels, ...o }) => ({
      ...o,
      latitude: o.latitude as number,
      longitude: o.longitude as number,
      labels: organisation_labels
        .map((ol) => ol.labels)
        .filter((l): l is MapLabel => l !== null)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

  // Only offer filters for types that actually have entries on the map.
  const bySlug = new Map<string, MapLabel>();
  organisations.forEach((o) => o.labels.forEach((l) => bySlug.set(l.slug, l)));
  const labels = [...bySlug.values()].sort((a, b) => a.sort_order - b.sort_order);

  return { status: "ok", organisations, labels };
}
