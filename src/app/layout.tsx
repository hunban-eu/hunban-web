import type { Metadata } from "next";
// Fonts are installed as npm packages and served from our own domain,
// so visitors' browsers never contact Google (better for GDPR).
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-ext-400.css";
import "@fontsource/poppins/latin-ext-500.css";
import "@fontsource/poppins/latin-ext-600.css";
import "@fontsource/poppins/latin-ext-700.css";
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource/bebas-neue/latin-ext-400.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HunBAN | Hungarian Business Angel Network",
    template: "%s | HunBAN",
  },
  description:
    "The home of angel investing in Hungary. A trusted circle of investors and a curated network of founders, investors and ecosystem enablers.",
  // PRE-LAUNCH: keep search engines away while the site is being built.
  // Remove this block (and src/app/robots.ts) on launch day.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
