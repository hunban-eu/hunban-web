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

// Footer documents, stored in the public "docs" bucket on Supabase.
// To update a document, upload the new PDF there under the same file name.
// Links with an empty href are not shown. TODO(Adam): add the URL of the GEP document.
const docsBucket =
  "https://cnxdwkqgydlivbrokoim.supabase.co/storage/v1/object/public/docs";

export const documents = [
  {
    label: "Privacy notice",
    href: `${docsBucket}/HunBAN%20Privacy%20Notice%20effective%20from%2005.11.2026.pdf`,
  },
  {
    label: "Member Code of Conduct",
    href: `${docsBucket}/HunBAN%20Member%20Code%20of%20Conduct.pdf`,
  },
  { label: "Gender Equality Plan (GEP)", href: "" },
];

// Social profiles. Links with an empty href are not shown.
export const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hunban/" },
  { label: "Luma calendar", href: "https://luma.com/hunban" },
];
