import Link from "next/link";
import { documents, legal, nav, social } from "@/lib/site";

export default function SiteFooter() {
  const docs = documents.filter((d) => d.href);
  const links = social.filter((s) => s.href);

  return (
    <footer className="on-brand bg-navy-ink text-on-brand-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-semibold text-on-brand">{legal.englishName}</p>
          <p className="mt-2">The home of angel investing in Hungary.</p>
          <p className="mt-4">
            <a href={`mailto:${legal.email}`} className="text-on-brand hover:text-yellow">
              {legal.email}
            </a>
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-brand">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-yellow">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-brand">
            Follow and legal
          </p>
          <ul className="mt-3 space-y-2">
            {links.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-yellow">
                  {s.label}
                </a>
              </li>
            ))}
            {docs.map((d) => (
              <li key={d.label}>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="hover:text-yellow">
                  {d.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal imprint */}
      <div className="border-t border-line-subtle">
        <div className="mx-auto max-w-6xl px-4 py-6 text-[13px] leading-[18px] sm:px-8">
          <p>
            {legal.name}
            {legal.seat && <>, seat: {legal.seat}</>}
            {legal.registrationNumber && <>, registration no. {legal.registrationNumber}</>}
            {legal.taxNumber && <>, tax no. {legal.taxNumber}</>}
            . Member of EBAN, the European Business Angels Network.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} HunBAN</p>
        </div>
      </div>
    </footer>
  );
}
