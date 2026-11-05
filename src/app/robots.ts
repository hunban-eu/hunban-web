import type { MetadataRoute } from "next";

// Search engines may index the whole site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
