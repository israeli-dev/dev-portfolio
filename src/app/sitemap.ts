import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getOwnerPortfolio } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/templates`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/signup`, changeFrequency: "yearly", priority: 0.5 },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  let publishedRoutes: MetadataRoute.Sitemap = [];

  try {
    const owner = await getOwnerPortfolio();
    projectRoutes =
      owner?.view.projects.map((project) => ({
        url: `${base}/projects/${project.slug}`,
        lastModified: project.lastPushedAt ? new Date(project.lastPushedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })) ?? [];

    const published = await db.portfolio.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });
    publishedRoutes = published.map((portfolio) => ({
      url: `${base}/u/${portfolio.slug}`,
      lastModified: portfolio.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // A cold database must not break the sitemap; static routes still serve.
  }

  return [...staticRoutes, ...projectRoutes, ...publishedRoutes];
}
