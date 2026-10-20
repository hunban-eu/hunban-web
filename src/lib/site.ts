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
// TODO(Adam): fill in the registration and tax numbers before launch.
export const legal = {
  name: "Magyar Üzleti Angyal Egyesület",
  englishName: "Hungarian Business Angel Network (HunBAN)",
  seat: "", // registered seat (székhely), e.g. "1234 Budapest, ..."
  registrationNumber: "", // nyilvántartási szám
  taxNumber: "", // adószám
  email: "info@hunban.eu",
};

// Footer documents. TODO(Adam): add the URLs of the privacy notice and the GEP document.
export const documents = [
  { label: "Privacy notice", href: "" },
  { label: "Gender Equality Plan (GEP)", href: "" },
];

// Social profiles. Links with an empty href are not shown.
// TODO(Adam): confirm the URLs.
export const social = [
  { label: "LinkedIn", href: "" },
  { label: "Facebook", href: "" },
  { label: "Luma calendar", href: "" },
];
