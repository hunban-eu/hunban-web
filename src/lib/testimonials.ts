import { getSupabase } from "@/lib/supabase";

// Founder and investor quotes, edited by Adam in the Supabase "testimonials" table.
//
// Row Level Security only returns rows that are published AND have consent,
// so a quote can never go live without the person's written yes.
// "audience" decides where a quote belongs (founder or investor pages),
// "is_featured" puts it on the homepage, and "sort_order" sets the order.

export type Testimonial = {
  id: string;
  person_name: string;
  role: string | null;
  company: string | null;
  quote: string;
  audience: "founder" | "investor";
  photo_url: string | null;
};

export async function getTestimonials(opts: { featured?: boolean; audience?: Testimonial["audience"] } = {}) {
  const supabase = getSupabase();
  if (!supabase) return [] as Testimonial[];

  let query = supabase
    .from("testimonials")
    .select("id, person_name, role, company, quote, audience, photo_url")
    .eq("is_published", true)
    .eq("consent_given", true);
  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.audience) query = query.eq("audience", opts.audience);

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Testimonial[]>();

  if (error) {
    console.error("Could not load testimonials:", error.message);
    return [];
  }
  return data ?? [];
}
