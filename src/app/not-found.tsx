import Link from "next/link";
import { legal, nav } from "@/lib/site";

// Shown for any address that doesn't exist, including old links from the previous site.
export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">404</p>
      <h1 className="mt-3 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        The link may be mistyped, or the page may have moved with our new website. Try one of these instead, or write
        to us at{" "}
        <a href={`mailto:${legal.email}`} className="font-semibold text-ink underline underline-offset-4">
          {legal.email}
        </a>
        .
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
        {nav.map((n) => (
          <li key={n.href}>
            <Link href={n.href} className="text-ink underline underline-offset-4">
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-8 inline-block rounded-sm bg-accent px-5 py-3 font-semibold text-on-accent">
        Back to the homepage
      </Link>
    </section>
  );
}
