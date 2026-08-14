import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { getAllHomes, homePhotos } from "@/lib/homes";
import { absoluteAssetUrl, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const STATIC_PAGES: {
  path: string;
  file: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", file: "src/app/page.tsx", changeFrequency: "daily", priority: 1 },
  {
    path: "/homes",
    file: "src/app/homes/page.tsx",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/explore-golden-bay",
    file: "src/app/explore-golden-bay/page.tsx",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/list-your-home",
    file: "content/pages/list-your-home.json",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/about-us",
    file: "content/pages/about-us.json",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/contact-and-support",
    file: "content/pages/contact-and-support.json",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/price-match",
    file: "content/pages/price-match.json",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/blog",
    file: "src/app/blog/page.tsx",
    changeFrequency: "weekly",
    priority: 0.5,
  },
  {
    path: "/owner-faqs",
    file: "content/pages/owner-faqs.json",
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    path: "/what-our-homeowners-say",
    file: "content/pages/what-our-homeowners-say.json",
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    path: "/cancellation-policy",
    file: "content/pages/cancellation-policy.json",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/privacy-policy",
    file: "content/pages/privacy-policy.json",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms-and-conditions",
    file: "content/pages/terms-and-conditions.json",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

function fileModified(relPath: string): Date {
  try {
    return fs.statSync(path.join(process.cwd(), relPath)).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homes = getAllHomes();
  const posts = getAllBlogPosts();
  const homesModified = fileModified("content/homes.json");

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: fileModified(page.file),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const homeEntries: MetadataRoute.Sitemap = homes.map((home) => {
    const photo = homePhotos(home)[0];
    const image =
      photo && !photo.includes("placeholder")
        ? [absoluteAssetUrl(photo)]
        : undefined;
    return {
      url: absoluteUrl(`/homes/${home.slug}`),
      lastModified: homesModified,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(image ? { images: image } : {}),
    };
  });

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...homeEntries, ...blogEntries];
}
