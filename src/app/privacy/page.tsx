import type { Metadata } from "next";
import LegalDocument, { readDocument } from "@/components/LegalDocument";

// The text lives in content/privacy.md. Edit that file to change this page.
export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How HunBAN processes personal data of members, founders, network contacts, event participants and website visitors.",
};

export default function PrivacyPage() {
  return <LegalDocument markdown={readDocument("privacy.md")} />;
}
