import Link from "next/link";

// Temporary homepage until the real one (feature 1) is built.
export default function Home() {
  return (
    <section className="on-brand bg-surface-brand text-on-brand">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-brand-muted">
          Hungarian Business Angel Network
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.01em] sm:text-5xl sm:leading-[52px]">
          The home of angel investing in <span className="text-yellow">Hungary</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-on-brand-muted">
          The new hunban.eu is being built. Founders, investors and ecosystem
          events, all in one place.
        </p>
        <Link
          href="/events"
          className="mt-8 inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent"
        >
          See upcoming events
        </Link>
      </div>
    </section>
  );
}
