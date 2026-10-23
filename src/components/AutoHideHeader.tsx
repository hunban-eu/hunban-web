"use client";

import { useEffect, useRef, useState } from "react";

// Sticky header that gets out of the way while reading:
// it slides up when you scroll down, and comes back as soon as you scroll up.
// It always shows near the top of the page, and never hides while the
// phone menu is open.
export default function AutoHideHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const header = ref.current;
      const height = header?.offsetHeight ?? 80;
      const menuOpen = Boolean(header?.querySelector("details[open]"));
      const delta = y - lastY;

      if (y <= height || menuOpen) setHidden(false); // near the top, or menu in use
      else if (delta > 4) setHidden(true); // scrolling down: reading
      else if (delta < -4) setHidden(false); // scrolling up: looking for something

      // Small jitters (under 4px) don't toggle the header.
      if (Math.abs(delta) > 4) lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={ref}
      // Keyboard users tabbing into the header always see it.
      onFocusCapture={() => setHidden(false)}
      className={`on-brand sticky top-0 z-40 bg-surface-brand text-on-brand transition-transform duration-200 motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </header>
  );
}
