import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">404</p>
      <h1 className="mt-3 text-3xl font-semibold">This page isn&apos;t here (yet).</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        We&apos;re building the new hunban.eu page by page. Some sections are still on their way.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent">
        Back to the homepage
      </Link>
    </section>
  );
}
