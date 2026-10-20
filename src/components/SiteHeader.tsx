import Link from "next/link";
import { nav } from "@/lib/site";

// Navy header with the white logo. On phones the links fold into a
// "Menu" toggle built with <details>, so it works without JavaScript.
export default function SiteHeader() {
  return (
    <header className="on-brand bg-surface-brand text-on-brand">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Link href="/" className="shrink-0" aria-label="HunBAN home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hunban-logo-white.svg"
            alt="HunBAN, Hungarian Business Angel Network"
            width={147}
            height={44}
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-yellow">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-sm border border-on-brand-muted px-3 py-1.5 text-sm font-medium">
            Menu
          </summary>
          <nav
            aria-label="Main"
            className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-navy-ink p-2"
          >
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-sm px-3 py-2 hover:text-yellow">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
