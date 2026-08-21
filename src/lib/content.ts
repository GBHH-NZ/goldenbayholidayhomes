import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const EXPLORE_FILE = path.join(
  process.cwd(),
  "content",
  "explore",
  "places.json",
);
const SITE_FILE = path.join(process.cwd(), "content", "site.json");

export type SiteMedia = {
  logo: string;
  heroImage: string;
  heroAlt: string;
  ogImage: string;
  heroHeading: string;
  heroLine: string;
};

export function getSiteMedia(): SiteMedia {
  return JSON.parse(fs.readFileSync(SITE_FILE, "utf8")) as SiteMedia;
}

export function getPageContent<T = Record<string, unknown>>(
  slug: string,
): T {
  const file = path.join(PAGES_DIR, `${slug}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export type BlogPostMeta = {
  title: string;
  slug: string;
  date: string;
  description: string;
  image?: string;
};

export type BlogPost = BlogPostMeta & { content: string };

export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data } = matter(raw);
      return {
        title: String(data.title),
        slug: String(data.slug ?? file.replace(/\.mdx?$/, "")),
        date: String(data.date),
        description: String(data.description ?? ""),
        image: data.image ? String(data.image) : undefined,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | null {
  const fileMdx = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileMd = path.join(BLOG_DIR, `${slug}.md`);
  const file = fs.existsSync(fileMdx)
    ? fileMdx
    : fs.existsSync(fileMd)
      ? fileMd
      : null;
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    title: String(data.title),
    slug: String(data.slug ?? slug),
    date: String(data.date),
    description: String(data.description ?? ""),
    image: data.image ? String(data.image) : undefined,
    content,
  };
}

export type ExplorePlace = {
  slug: string;
  name: string;
  category: string;
  location: string;
  summary: string;
  detail?: string;
  image: string;
  /** Outbound DOC / venue link when available */
  url?: string;
  /** FareHarbor (or similar) embed URL for an in-page Book a Ride panel */
  bookUrl?: string;
  bookLabel?: string;
};

export function getExplorePlaces(): ExplorePlace[] {
  return JSON.parse(fs.readFileSync(EXPLORE_FILE, "utf8")) as ExplorePlace[];
}

export function getExplorePlace(slug: string): ExplorePlace | null {
  return getExplorePlaces().find((place) => place.slug === slug) ?? null;
}

export type GuestReview = {
  quote: string;
  name: string;
  location: string;
  homeSlug?: string | null;
  rating?: number;
};

type GuestReviewsFile = {
  intro?: string;
  reviews: GuestReview[];
};

const GUEST_REVIEWS_FILE = path.join(
  process.cwd(),
  "content",
  "guest-reviews.json",
);

export function getGuestReviews(): GuestReview[] {
  if (!fs.existsSync(GUEST_REVIEWS_FILE)) return [];
  const data = JSON.parse(
    fs.readFileSync(GUEST_REVIEWS_FILE, "utf8"),
  ) as GuestReviewsFile;
  return Array.isArray(data.reviews) ? data.reviews : [];
}

export function getGuestReviewsForHome(slug: string): GuestReview[] {
  return getGuestReviews().filter((review) => review.homeSlug === slug);
}
