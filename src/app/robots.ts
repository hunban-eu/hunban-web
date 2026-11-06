import type { MetadataRoute } from "next";

// Search engines may index the whole site, except the job board's private pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/jobs/login", "/jobs/dashboard", "/jobs/auth"],
    },
  };
}
