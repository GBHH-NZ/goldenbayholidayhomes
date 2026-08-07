import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllHomes } from "@/lib/homes";
import { getAllBlogPosts } from "@/lib/content";

export const dynamic = "force-static";

const STATIC_PATHS = [
  "/",
  "/homes",
  "/about-us",
  "/list-your-home",
  "/owner-faqs",
  "/what-our-homeowners-say",
  "/price-match",
  "/explore-golden-bay",
  "/contact-and-support",
  "/blog",
  "/cancellation-policy",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const homes = getAllHomes();
  const posts = getAllBlogPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" || path === "/homes" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/homes" ? 0.9 : 0.7,
  }));

  const homeEntries: MetadataRoute.Sitemap = homes.map((h) => ({
    url: absoluteUrl(`/homes/${h.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...homeEntries, ...blogEntries];
}
