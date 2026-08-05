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
  image: string;
};

export function getExplorePlaces(): ExplorePlace[] {
  return JSON.parse(fs.readFileSync(EXPLORE_FILE, "utf8")) as ExplorePlace[];
}
