import type { Metadata } from "next";
import LegalDocument, { readDocument } from "@/components/LegalDocument";

// The text lives in content/code-of-conduct.md. Edit that file to change this page.
export const metadata: Metadata = {
  title: "Member Code of Conduct",
  description: "The standards every HunBAN member agrees to: how members use startup information, deal with founders and invest alongside each other.",
};

export default function CodeOfConductPage() {
  return <LegalDocument markdown={readDocument("code-of-conduct.md")} />;
}
