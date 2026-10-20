"use client";

import { useState } from "react";
import type { EventItem } from "@/lib/events";

// Dates are always shown in Budapest time, whatever the visitor's own time zone.
const TZ = "Europe/Budapest";
const day = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" });
const month = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" });
const full = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const time = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

function when(e: EventItem) {
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : null;
  const sameDay = end && full.format(start) === full.format(end);
  if (!end) return `${full.format(start)}, ${time.format(start)}`;
  if (sameDay) return `${full.format(start)}, ${time.format(start)}–${time.format(end)}`;
  return `${full.format(start)} to ${full.format(end)}`;
}

type Filter = "all" | "hunban";

export default function EventList({ events }: { events: EventItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "hunban" ? events.filter((e) => e.is_hunban) : events;

  return (
    <div>
      <div role="group" aria-label="Show events" className="inline-flex rounded-sm border border-line p-1">
        {(
          [
            ["all", "All events"],
            ["hunban", "HunBAN events"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-sm px-4 py-2 text-sm font-semibold ${
              filter === value ? "bg-surface-brand text-on-brand" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          {filter === "hunban"
            ? "No HunBAN events are scheduled right now. Check back soon, or see all events."
            : "No upcoming events right now. Check back soon."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {shown.map((e) => {
            const start = new Date(e.starts_at);
            const Card = e.registration_url ? "a" : "div";
            return (
              <li key={e.id}>
                <Card
                  {...(e.registration_url
                    ? { href: e.registration_url, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`flex gap-5 rounded-md bg-surface-alt p-5 sm:gap-6 sm:p-6 ${
                    e.registration_url ? "group hover:ring-2 hover:ring-line" : ""
                  }`}
                >
                  <div
                    className={`flex w-16 shrink-0 self-start flex-col items-center justify-center rounded-sm py-2 sm:w-20 ${
                      e.is_hunban ? "bg-surface-brand text-on-brand" : "bg-surface text-ink"
                    }`}
                    aria-hidden="true"
                  >
                    <span className="font-display text-4xl leading-none tracking-[0.04em]">{day.format(start)}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                      {month.format(start)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {e.is_hunban && (
                      <span className="inline-block rounded-sm bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-accent">
                        HunBAN event
                      </span>
                    )}
                    <h2 className="mt-1 text-lg font-semibold leading-snug sm:text-xl">{e.title}</h2>
                    <p className="mt-2 text-[13px] font-medium leading-[18px] text-ink-muted">
                      {when(e)}
                      {e.venue && <>, {e.venue}</>}
                    </p>
                    {e.organiser && !e.is_hunban && (
                      <p className="mt-1 text-[13px] leading-[18px] text-ink-muted">Organised by {e.organiser}</p>
                    )}
                    {e.registration_url && (
                      <p className="mt-3 text-sm font-semibold underline-offset-4 group-hover:underline">
                        Details and registration <span aria-hidden="true">↗</span>
                      </p>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
