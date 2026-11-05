// Site-wide settings in one place: navigation, legal details, social links.
// Edit the values here and every page picks them up.

export const nav = [
  { href: "/about", label: "About" },
  { href: "/founders", label: "For founders" },
  { href: "/investors", label: "For investors" },
  { href: "/events", label: "Events" },
  { href: "/map", label: "Ecosystem map" },
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

// Footer documents. Each has a short address on the site (hunban.eu/privacy),
// which forwards to the current PDF in the public "docs" bucket on Supabase.
// Forms and emails always use the short address, so a new version only needs
// a new upload: under the same file name nothing changes, under a new file
// name only "file" changes here. The forwarding rules live in next.config.ts.
// Entries with an empty path are not shown. TODO(Adam): add the GEP document.
export const docsBucket =
  "https://cnxdwkqgydlivbrokoim.supabase.co/storage/v1/object/public/docs";

export const documents = [
  {
    label: "Privacy notice",
    path: "/privacy",
    file: "HunBAN Privacy Notice effective from 05.11.2026.pdf",
  },
  {
    label: "Member Code of Conduct",
    path: "/code-of-conduct",
    file: "HunBAN Member Code of Conduct.pdf",
  },
  { label: "Gender Equality Plan (GEP)", path: "", file: "" },
];

// Social profiles. Links with an empty href are not shown.
export const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hunban/" },
  { label: "Luma calendar", href: "https://luma.com/hunban" },
];
