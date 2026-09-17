import type { MetadataRoute } from "next";
import { getDmbbData } from "@/lib/data/dmbb";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getDmbbData();
  const lastModified = new Date(data.capturedAt);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/fixtures-results`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/competitions`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/news`, lastModified, changeFrequency: "weekly", priority: 0.4 },
    { url: `${siteConfig.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...data.competitions.map((competition) => ({
      url: `${siteConfig.url}/competitions/${competition.id}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
