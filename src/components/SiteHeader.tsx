import Link from "next/link";
import { nav } from "@/lib/site";
import NavLink from "@/components/NavLink";
import MobileMenu from "@/components/MobileMenu";
import AutoHideHeader from "@/components/AutoHideHeader";

// Navy header with the white logo. On phones the links fold into a
// "Menu" toggle (see MobileMenu). It sticks to the top, hiding while you
// scroll down and returning when you scroll up (see AutoHideHeader).
export default function SiteHeader() {
  return (
    <AutoHideHeader>
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
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu />
      </div>
    </AutoHideHeader>
  );
}
