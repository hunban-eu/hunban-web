import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HunBAN | Hungarian Business Angel Network",
  description:
    "Magyar Üzleti Angyal Egyesület, the community for early-stage startups and angel investors in Hungary.",
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
