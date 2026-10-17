import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HunBAN | Hungarian Business Angel Network",
  description:
    "Magyar Üzleti Angyal Egyesület, the community for early-stage startups and angel investors in Hungary.",
  // PRE-LAUNCH: keep search engines away while the site is being built.
  // Remove this block (and src/app/robots.ts) on launch day.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body className="antialiased">{children}</body>
    </html>
  );
}
