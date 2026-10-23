"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site";
import NavLink from "@/components/NavLink";

// Phone menu. Built on <details>, so it still opens without JavaScript.
// The header stays mounted when Next.js changes pages, so the menu would
// stay open after a tap; this closes it on every page change, on a tap
// outside the menu, and on Escape.
export default function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // Close whenever the page changes.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  // Close on a tap outside the menu, or on Escape.
  useEffect(() => {
    const close = () => {
      if (ref.current) ref.current.open = false;
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        close();
        ref.current?.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details ref={ref} className="relative md:hidden">
      <summary className="cursor-pointer list-none rounded-sm border border-on-brand-muted px-3 py-1.5 text-sm font-medium">
        Menu
      </summary>
      <nav
        aria-label="Main"
        className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-navy-ink p-2"
        // Any link tap closes the menu, including the link to the page you're already on.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a") && ref.current) ref.current.open = false;
        }}
      >
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} className="block rounded-sm px-3 py-2">
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
