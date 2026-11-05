import type { NextConfig } from "next";
import { docsBucket, documents } from "./src/lib/site";

const nextConfig: NextConfig = {
  // Short addresses for the legal documents, e.g. hunban.eu/privacy.
  // Temporary redirects (307), so browsers always ask again and a new PDF
  // version takes effect immediately.
  async redirects() {
    return documents
      .filter((d) => d.path && d.file)
      .map((d) => ({
        source: d.path,
        destination: `${docsBucket}/${encodeURIComponent(d.file)}`,
        permanent: false,
      }));
  },
};

export default nextConfig;
