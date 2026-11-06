"use client";

import { useState } from "react";
import { daysLeft, employmentTypes, expiresAt, formatDate, isLive, labelOf, workModes, type Listing } from "@/lib/jobs";
import { deleteListing, refreshListing } from "./actions";
import ListingForm from "./ListingForm";

const btn = "rounded-sm border border-line px-3 py-1.5 text-sm font-semibold hover:bg-surface";

export default function ListingCard({ listing: l }: { listing: Listing }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const live = isLive(l.refreshed_at);
  const left = daysLeft(l.refreshed_at);

  return (
    <li className={`rounded-md p-5 sm:p-6 ${live ? "bg-surface-alt" : "border border-dashed border-line"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              live ? (left <= 2 ? "bg-accent text-on-accent" : "bg-surface-brand text-on-brand") : "bg-surface-alt text-ink-muted"
            }`}
          >
            {live ? (left <= 1 ? "Live, hides tomorrow" : `Live, ${left} days left`) : "Hidden"}
          </span>
          <h3 className="mt-2 text-lg font-semibold leading-snug">{l.position}</h3>
          <p className="mt-1 text-[13px] font-medium text-ink-muted">
            {labelOf(employmentTypes, l.employment_type)}, {labelOf(workModes, l.work_mode)}
            {l.city && <>, {l.city}</>}
          </p>
          {l.description && <p className="mt-2 text-sm">{l.description}</p>}
          <p className="mt-2 break-all text-[12px] text-ink-muted">{l.apply_url}</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Posted {formatDate(l.refreshed_at)}
            {live ? `, hides on ${formatDate(expiresAt(l.refreshed_at))}` : `, hidden since ${formatDate(expiresAt(l.refreshed_at))}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <form action={refreshListing}>
            <input type="hidden" name="id" value={l.id} />
            <button
              type="submit"
              className={live ? btn : "rounded-sm bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"}
            >
              {live ? "Refresh" : "Reactivate"}
            </button>
          </form>
          <button type="button" className={btn} onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
            {editing ? "Close" : "Edit"}
          </button>
          {confirmDelete ? (
            <form action={deleteListing} className="flex gap-2">
              <input type="hidden" name="id" value={l.id} />
              <button type="submit" className={`${btn} border-ink`}>
                Yes, delete
              </button>
              <button type="button" className={btn} onClick={() => setConfirmDelete(false)}>
                Keep
              </button>
            </form>
          ) : (
            <button type="button" className={btn} onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 border-t border-line-subtle pt-6">
          <ListingForm listing={l} onDone={() => setEditing(false)} />
        </div>
      )}
    </li>
  );
}
