import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/products", "/delivery", "/faq", "/contact"];
  const categories = (await getCatalog()).map((c) => `/products/${c.slug}`);
  return [...pages, ...categories].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
