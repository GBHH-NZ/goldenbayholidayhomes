import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllBlogPosts, getExplorePlaces } from "@/lib/content";
import { getAllHomes, homePhotos } from "@/lib/homes";
import { getActiveLocationPages } from "@/lib/location-pages";
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

function firstListingImage(photos: string[]): string | undefined {
  const photo = photos.find((src) => src && !src.includes("placeholder"));
  return photo ? absoluteAssetUrl(photo) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homes = getAllHomes();
  const posts = getAllBlogPosts();
  const places = getExplorePlaces();
  const locations = getActiveLocationPages();
  const homesModified = fileModified("content/homes.json");
  const locationsModified = fileModified("content/locations.json");
  const exploreModified = fileModified("content/explore/places.json");

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: fileModified(page.file),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const locationEntries: MetadataRoute.Sitemap = locations.map((page) => {
    const image = firstListingImage(
      page.homes.flatMap((home) => homePhotos(home)),
    );
    return {
      url: absoluteUrl(`/holiday-homes/${page.slug}`),
      lastModified: locationsModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      ...(image ? { images: [image] } : {}),
    };
  });

  const homeEntries: MetadataRoute.Sitemap = homes.map((home) => {
    const image = firstListingImage(homePhotos(home));
    return {
      url: absoluteUrl(`/homes/${home.slug}`),
      lastModified: homesModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(image ? { images: [image] } : {}),
    };
  });

  const exploreEntries: MetadataRoute.Sitemap = places.map((place) => {
    const image =
      place.image && !place.image.includes("placeholder")
        ? absoluteAssetUrl(place.image)
        : undefined;
    return {
      url: absoluteUrl(`/explore-golden-bay/${place.slug}`),
      lastModified: exploreModified,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      ...(image ? { images: [image] } : {}),
    };
  });

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const mdxPath = `content/blog/${post.slug}.mdx`;
    const mdPath = `content/blog/${post.slug}.md`;
    const contentModified = fs.existsSync(path.join(process.cwd(), mdxPath))
      ? fileModified(mdxPath)
      : fs.existsSync(path.join(process.cwd(), mdPath))
        ? fileModified(mdPath)
        : new Date(post.date);
    const published = new Date(post.date);
    const lastModified =
      contentModified > published ? contentModified : published;
    const image = post.image ? absoluteAssetUrl(post.image) : undefined;
    return {
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(image ? { images: [image] } : {}),
    };
  });

  return [
    ...staticEntries,
    ...locationEntries,
    ...homeEntries,
    ...exploreEntries,
    ...blogEntries,
  ];
}
