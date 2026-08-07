/**
 * Download Wix CDN (and other remote) images into public/images/ and rewrite
 * content JSON to local paths so the site can retire Wix hosting.
 *
 * Usage: node scripts/mirror-wix-assets.mjs
 */
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, extname, join } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public", "images");
const HOMES_PATH = join(ROOT, "content", "homes.json");
const SITE_PATH = join(ROOT, "content", "site.json");
const EXPLORE_PATH = join(ROOT, "content", "explore", "places.json");
const UA =
  "Mozilla/5.0 (compatible; GoldenBayHolidayHomesBot/1.0; +local-mirror)";

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function extFromUrl(url, fallback = ".jpg") {
  try {
    const u = new URL(url);
    const base = u.pathname.split("/").pop() || "";
    const ext = extname(base).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function isRemote(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

async function download(url, destPath) {
  if (existsSync(destPath)) return { skipped: true };
  ensureDir(dirname(destPath));
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  if (!res.body) throw new Error(`No body: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
  return { skipped: false };
}

async function mirrorUrl(url, destRel) {
  if (!isRemote(url)) return url;
  const destPath = join(ROOT, "public", destRel.replace(/^\//, ""));
  const result = await download(url, destPath);
  if (!result.skipped) console.log("  ↓", destRel);
  else console.log("  ·", destRel, "(cached)");
  return destRel.startsWith("/") ? destRel : `/${destRel}`;
}

async function mirrorHomes() {
  console.log("\nHomes card photos…");
  const homes = JSON.parse(readFileSync(HOMES_PATH, "utf8"));
  ensureDir(join(PUBLIC, "homes"));
  let mirrored = 0;
  for (const home of homes) {
    if (!Array.isArray(home.photos) || home.photos.length === 0) continue;
    const next = [];
    for (let i = 0; i < home.photos.length; i++) {
      const url = home.photos[i];
      if (!isRemote(url)) {
        next.push(url);
        continue;
      }
      const ext = extFromUrl(url);
      const rel = `/images/homes/${home.slug}${i === 0 ? "" : `-${i}`}${ext}`;
      next.push(await mirrorUrl(url, rel));
      mirrored += 1;
    }
    home.photos = next;
  }
  writeFileSync(HOMES_PATH, JSON.stringify(homes, null, 2) + "\n");
  console.log(`Homes photo slots processed: ${mirrored}`);
}

async function mirrorBrand() {
  console.log("\nBrand media…");
  const site = JSON.parse(readFileSync(SITE_PATH, "utf8"));
  ensureDir(join(PUBLIC, "brand"));
  if (isRemote(site.logo)) {
    site.logo = await mirrorUrl(
      site.logo,
      `/images/brand/logo${extFromUrl(site.logo, ".png")}`,
    );
  }
  if (isRemote(site.heroImage)) {
    site.heroImage = await mirrorUrl(
      site.heroImage,
      `/images/brand/hero${extFromUrl(site.heroImage)}`,
    );
  }
  if (isRemote(site.ogImage)) {
    site.ogImage = await mirrorUrl(
      site.ogImage,
      `/images/brand/og${extFromUrl(site.ogImage)}`,
    );
  }
  delete site.note;
  writeFileSync(SITE_PATH, JSON.stringify(site, null, 2) + "\n");
}

async function mirrorExplore() {
  console.log("\nExplore place images…");
  if (!existsSync(EXPLORE_PATH)) {
    console.log("  (no places.json yet)");
    return;
  }
  const places = JSON.parse(readFileSync(EXPLORE_PATH, "utf8"));
  ensureDir(join(PUBLIC, "explore"));
  for (const place of places) {
    if (!isRemote(place.image)) continue;
    const ext = extFromUrl(place.image);
    place.image = await mirrorUrl(
      place.image,
      `/images/explore/${place.slug}${ext}`,
    );
  }
  writeFileSync(EXPLORE_PATH, JSON.stringify(places, null, 2) + "\n");
}

async function main() {
  console.log("Mirroring remote assets into public/images/");
  await mirrorHomes();
  await mirrorBrand();
  await mirrorExplore();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
