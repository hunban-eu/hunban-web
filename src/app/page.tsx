import Link from "next/link";

// Temporary homepage while the site is in preview. It points to the pages
// that are already built and flags that the data behind them is seeded.
// Replace with the real homepage before launch.

const pages = [
  {
    href: "/about",
    title: "About",
    text: "Who we are, how we work, the board, the team and the members behind HunBAN.",
  },
  {
    href: "/founders",
    title: "For founders",
    text: "What selected startups get, how it works, and the form to apply to pitch.",
  },
  {
    href: "/investors",
    title: "For investors",
    text: "Why HunBAN exists, what members get back, and how to get to know us first.",
  },
  {
    href: "/events",
    title: "Events",
    text: "Upcoming HunBAN and partner events in the Hungarian ecosystem.",
  },
  {
    href: "/map",
    title: "Ecosystem map",
    text: "VCs, coworking spaces, incubators, scaleups and more, filterable by type.",
  },
];

export default function Home() {
  return (
    <>
      <section className="on-brand bg-surface-brand text-on-brand">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-brand-muted">
            Hungarian Business Angel Network
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
            The home of angel investing in <span className="text-yellow">Hungary</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-on-brand-muted">
            The new hunban.eu is in preview. Founders, investors and ecosystem events, all in one place.
          </p>
          <Link
            href="/events"
            className="mt-8 inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent"
          >
            See upcoming events
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div role="note" className="rounded-md border-l-4 border-yellow bg-surface-alt p-5">
          <p className="font-semibold">Preview: the data is not complete yet</p>
          <p className="mt-1 text-ink-muted">
            The events, the ecosystem map and the member listings currently show seeded sample data, not the full
            picture. We&apos;re filling them in before launch.
          </p>
        </div>

        <h2 className="mt-12 text-[28px] font-semibold leading-9">What&apos;s on the site so far</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="block h-full rounded-md bg-surface-alt p-6 ring-1 ring-transparent transition hover:ring-line"
              >
                <p className="text-xl font-semibold leading-7">{p.title}</p>
                <p className="mt-2 text-ink-muted">{p.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
