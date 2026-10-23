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

// Footer documents. TODO(Adam): add the URLs of the privacy notice and the GEP document.
export const documents = [
  { label: "Privacy notice", href: "" },
  { label: "Gender Equality Plan (GEP)", href: "" },
];

// Social profiles. Links with an empty href are not shown.
export const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hunban/" },
  { label: "Facebook", href: "" }, // TODO(Adam): add the URL, or delete this line
  { label: "Luma calendar", href: "https://luma.com/hunban" },
];
