import type { MetadataRoute } from "next";

// PRE-LAUNCH: block all crawlers while the site is being built.
// On launch day, replace with rules that allow indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
