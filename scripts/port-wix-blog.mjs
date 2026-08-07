/**
 * Fetch live Wix blog posts, download hero images, write MDX drafts.
 * Usage: node scripts/port-wix-blog.mjs
 */
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
} from "fs";
import { dirname, join } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "content", "blog");
const IMG_DIR = join(ROOT, "public", "images", "blog");
const UA = "Mozilla/5.0 (compatible; GoldenBayHolidayHomesBot/1.0; +blog-port)";

const POSTS = [
  {
    path: "/post/dog-friendly-golden-bay-the-best-spots-to-explore-with-your-four-legged-friend",
    slug: "dog-friendly-golden-bay",
    date: "2025-11-04",
  },
  {
    path: "/post/a-guide-to-golden-bay-s-variety-of-beaches-from-hidden-coves-to-long-golden-stretches-of-sand",
    slug: "golden-bay-beaches-guide",
    date: "2025-10-21",
  },
  {
    path: "/post/easy-family-walks-in-golden-bay-new-zealand",
    slug: "easy-family-walks-in-golden-bay",
    date: "2025-10-07",
  },
  {
    path: "/post/top-5-must-see-places-in-golden-bay-new-zealand",
    slug: "top-5-must-see-places-in-golden-bay",
    date: "2025-09-23",
  },
  {
    path: "/post/welcome-to-golden-bay-blog",
    slug: "welcome-to-golden-bay-blog",
    date: "2025-09-16",
  },
];

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
      .replace(/<(h2)[^>]*>/gi, "\n## ")
      .replace(/<(h3)[^>]*>/gi, "\n### ")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

async function download(url, dest) {
  if (existsSync(dest)) return;
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`img ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function fetchPost(path) {
  const url = `https://www.goldenbayholidayhomes.nz${path}`;
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function extractTitle(html) {
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
  if (og) return decode(og).replace(/\s*\|\s*.*$/, "").trim();
  const h = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  return stripTags(h || "Untitled").split("\n")[0].trim();
}

function extractDescription(html) {
  const og = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  if (og) return decode(og).trim();
  const meta = html.match(/name="description"\s+content="([^"]+)"/i)?.[1];
  return decode(meta || "").trim();
}

function extractOgImage(html) {
  return html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
}

function extractArticleBody(html) {
  // Prefer rich-content blocks; fall back to article
  const chunks = [...html.matchAll(/data-hook="post-description"[^>]*>([\s\S]*?)<\/div>/gi)].map(
    (m) => m[1],
  );
  if (chunks.length) return stripTags(chunks.join("\n\n"));

  const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0];
  if (article) return stripTags(article);

  // Wix often embeds text in JSON
  const texts = [...html.matchAll(/"text":"((?:\\.|[^"\\])*)"/g)]
    .map((m) =>
      decode(m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\")),
    )
    .filter((t) => t.length > 40 && !/cookie|privacy|wix/i.test(t));
  return texts.slice(0, 40).join("\n\n");
}

function cleanBody(text) {
  return text
    .replace(/Write a comment[\s\S]*$/i, "")
    .replace(/Comments\s*$/im, "")
    .replace(/top of page|bottom of page/gi, "")
    .replace(/[🐾🌿👉🌺✨🌊☀️🌅🦭🍦☕🎉]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  mkdirSync(BLOG_DIR, { recursive: true });
  mkdirSync(IMG_DIR, { recursive: true });

  // Remove old stubs
  for (const f of readdirSync(BLOG_DIR)) {
    if (f.endsWith(".mdx") || f.endsWith(".md")) {
      unlinkSync(join(BLOG_DIR, f));
      console.log("removed", f);
    }
  }

  for (const post of POSTS) {
    console.log("Fetching", post.path);
    const html = await fetchPost(post.path);
    const title = extractTitle(html);
    const description = extractDescription(html) || title;
    let body = cleanBody(extractArticleBody(html));
    if (body.length < 200) {
      console.warn("  thin body; keeping extracted text length", body.length);
    }

    const og = extractOgImage(html);
    let image = "/images/brand/hero.jpg";
    if (og) {
      const ext = og.includes(".png") ? ".png" : ".jpg";
      const rel = `/images/blog/${post.slug}${ext}`;
      await download(decode(og), join(ROOT, "public", rel.slice(1)));
      image = rel;
      console.log("  hero", rel);
    }

    const mdx = `---
title: ${JSON.stringify(title)}
slug: "${post.slug}"
date: "${post.date}"
description: ${JSON.stringify(description)}
image: "${image}"
---

${body}
`;
    writeFileSync(join(BLOG_DIR, `${post.slug}.mdx`), mdx);
    console.log("  wrote", post.slug, `(${body.length} chars)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
