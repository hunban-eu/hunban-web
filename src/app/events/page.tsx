import type { Metadata } from "next";
import EventList from "@/components/EventList";
import { getUpcomingEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming HunBAN and partner events for founders and investors in the Hungarian startup ecosystem.",
};

// Rebuild this page in the background at most every 5 minutes,
// so new events in Supabase appear within 5 minutes without a redeploy.
export const revalidate = 300;

export default async function EventsPage() {
  const result = await getUpcomingEvents();

  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="text-balance text-3xl font-bold tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            Where angels and founders <span className="text-yellow">meet</span>
          </h1>
          <p className="mt-4 max-w-2xl text-on-brand-muted">
            Startup Arena, HunBAN's own events and the partner events worth your evening.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        {result.status === "ok" ? (
          <EventList events={result.events} />
        ) : (
          <p className="text-ink-muted">
            Events can&apos;t be loaded right now. Please try again a little later.
          </p>
        )}
      </section>
    </>
  );
}
