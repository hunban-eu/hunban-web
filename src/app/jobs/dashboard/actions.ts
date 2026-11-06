"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthSupabase } from "@/lib/supabase-auth";
import { employmentTypes, workModes } from "@/lib/jobs";

// Every action runs as the logged-in founder. The database's security rules
// decide what they may touch: a founder can only change their own startup's
// listings, and only an admin can act on another startup's.

export type SaveState = { ok?: boolean; error?: string };

function done() {
  revalidatePath("/jobs");
  revalidatePath("/jobs/dashboard");
}

function readListing(formData: FormData) {
  const text = (k: string) => String(formData.get(k) ?? "").trim();
  const position = text("position");
  const employment_type = text("employment_type");
  const work_mode = text("work_mode");
  const city = text("city");
  const description = text("description");
  const apply_url = text("apply_url");

  if (!position) return { error: "Add a position name." };
  if (position.length > 120) return { error: "Keep the position name under 120 characters." };
  if (!employmentTypes.some((t) => t.value === employment_type)) return { error: "Choose an employment type." };
  if (!workModes.some((m) => m.value === work_mode)) return { error: "Choose a work mode." };
  if (work_mode !== "remote" && !city) return { error: "Add a city for hybrid and on-site roles." };
  if (description.length > 160) return { error: "Keep the description to 160 characters." };
  try {
    const u = new URL(apply_url);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
  } catch {
    return { error: "Add the full link to the page where candidates apply, starting with https://" };
  }

  return {
    data: {
      position,
      employment_type,
      work_mode,
      city: work_mode === "remote" ? city || null : city,
      description: description || null,
      apply_url,
    },
  };
}

export async function saveListing(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const parsed = readListing(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createAuthSupabase();
  const id = String(formData.get("id") ?? "");
  const startup_id = String(formData.get("startup_id") ?? "");

  const { error } = id
    ? await supabase.from("job_listings").update(parsed.data).eq("id", id)
    : await supabase.from("job_listings").insert({ ...parsed.data, startup_id });

  if (error) {
    console.error("Could not save listing:", error.message);
    return { error: "The listing could not be saved. Please try again, or write to info@hunban.eu." };
  }
  done();
  return { ok: true };
}

// Refresh and Reactivate are the same thing: the database resets the
// listing's date to now, which restarts its 15 days.
export async function refreshListing(formData: FormData) {
  const supabase = await createAuthSupabase();
  const { error } = await supabase
    .from("job_listings")
    .update({ refreshed_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  if (error) console.error("Could not refresh listing:", error.message);
  done();
}

export async function deleteListing(formData: FormData) {
  const supabase = await createAuthSupabase();
  const { error } = await supabase.from("job_listings").delete().eq("id", String(formData.get("id")));
  if (error) console.error("Could not delete listing:", error.message);
  done();
}

export async function signOut() {
  const supabase = await createAuthSupabase();
  await supabase.auth.signOut();
  redirect("/jobs/login");
}
