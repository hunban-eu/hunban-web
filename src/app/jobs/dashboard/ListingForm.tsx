"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { employmentTypes, workModes, type Listing } from "@/lib/jobs";
import { saveListing, type SaveState } from "./actions";

const field = "rounded-sm border border-line bg-surface px-3 py-2 text-base font-normal";
const labelCls = "grid gap-1.5 text-sm font-semibold";

// Add or edit one listing. Startups is only passed for the admin, who picks
// which startup a new listing belongs to.
export default function ListingForm({
  listing,
  startupId,
  startups,
  onDone,
}: {
  listing?: Listing;
  startupId?: string;
  startups?: { id: string; name: string }[];
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveListing, {});
  const [mode, setMode] = useState(listing?.work_mode ?? "remote");
  const [desc, setDesc] = useState(listing?.description ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (!listing) {
        formRef.current?.reset();
        setMode("remote");
        setDesc("");
      }
      onDone?.();
    }
  }, [state, listing, onDone]);

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      {!listing &&
        (startups ? (
          <label className={labelCls}>
            Startup
            <select name="startup_id" required className={field} defaultValue="">
              <option value="" disabled>
                Choose a startup
              </option>
              {startups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="startup_id" value={startupId} />
        ))}

      <label className={labelCls}>
        Position
        <input name="position" required maxLength={120} defaultValue={listing?.position} className={field} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelCls}>
          Employment type
          <select name="employment_type" defaultValue={listing?.employment_type ?? "full-time"} className={field}>
            {employmentTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Work mode
          <select
            name="work_mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className={field}
          >
            {workModes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          City {mode === "remote" && <span className="font-normal text-ink-muted">(optional)</span>}
          <input
            name="city"
            required={mode !== "remote"}
            maxLength={80}
            defaultValue={listing?.city ?? ""}
            className={field}
          />
        </label>
      </div>

      <label className={labelCls}>
        <span>
          One-line description <span className="font-normal text-ink-muted">(optional, {160 - desc.length} characters left)</span>
        </span>
        <input
          name="description"
          maxLength={160}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className={field}
        />
      </label>

      <label className={labelCls}>
        <span>
          Apply link <span className="font-normal text-ink-muted">(the page where candidates apply)</span>
        </span>
        <input
          name="apply_url"
          type="url"
          required
          maxLength={500}
          placeholder="https://"
          defaultValue={listing?.apply_url}
          className={field}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-medium">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
      >
        {pending ? "Saving..." : listing ? "Save changes" : "Publish listing"}
      </button>
    </form>
  );
}
