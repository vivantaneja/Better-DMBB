import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Never let this site's crawl directives be confused with the official
      // site's. The sitemap below is OUR url, never dmbb.ie.
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
