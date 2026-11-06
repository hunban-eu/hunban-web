// Site-wide settings in one place: navigation, legal details, social links.
// Edit the values here and every page picks them up.

export const nav = [
  { href: "/about", label: "About" },
  { href: "/founders", label: "For founders" },
  { href: "/investors", label: "For investors" },
  { href: "/events", label: "Events" },
  { href: "/map", label: "Ecosystem map" },
  { href: "/jobs", label: "Jobs" },
];

// Legal imprint, required on an organisation's site under Hungarian law.
// Source: HunBAN's internal "Tudnivalók" document (public registry data).
export const legal = {
  name: "Magyar Üzleti Angyal Egyesület",
  englishName: "Hungarian Business Angel Network (HunBAN)",
  seat: "1132 Budapest, Váci út 16. Fsz. 12.", // székhely
  registrationNumber: "01-02-0016487", // nyilvántartási szám
  taxNumber: "18900950-2-41", // adószám
  email: "info@hunban.eu",
};

// Footer documents: pages on the site, with their text in /content as
// Markdown files. Entries with an empty href are not shown.
export const documents = [
  { label: "Privacy notice", href: "/privacy" },
  { label: "Member Code of Conduct", href: "/code-of-conduct" },
];

// Social profiles. Links with an empty href are not shown.
export const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hunban/" },
  { label: "Luma calendar", href: "https://luma.com/hunban" },
];
