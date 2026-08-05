/**
 * Scrape listing card images from the live Wix site and merge into content/homes.json.
 * Temporary until Guesty catalogue sync fills photos.
 *
 * Usage: node scripts/scrape-wix-images.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const HOMES_PATH = join(ROOT, "content", "homes.json");
const SITE = "https://www.goldenbayholidayhomes.nz/";

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/");
}

function wixMediaUrl(uri) {
  const file = uri.split("/").pop();
  return `https://static.wixstatic.com/media/${uri}/v1/fill/w_1200,h_800,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/${file}`;
}

async function fetchHtml() {
  const res = await fetch(SITE, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; GoldenBayHolidayHomesBot/1.0; +local-seed)",
      accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

/** @returns {Map<string, string>} itemId -> media uri */
function extractImagesByItemId(html) {
  const map = new Map();
  // defaultSrc + nearby containerId share the same item UUID suffix
  const re =
    /"defaultSrc":"wix:image:\\\/\\\/v1\\\/(?<media>[^"\\]+?)(?:\\\/[^"#]*)?(?:#[^"]*)?"[\s\S]{0,500}?"containerId":"comp-[^"_]+__(?<id>[0-9a-f-]{36})"/gi;
  for (const m of html.matchAll(re)) {
    const media = decodeEntities(m.groups.media).split("#")[0].split("/")[0];
    if (media && !map.has(m.groups.id)) map.set(m.groups.id, media);
  }

  // Fallback: uri field + containerId
  const re2 =
    /"containerId":"comp-[^"_]+__(?<id>[0-9a-f-]{36})"[\s\S]{0,400}?"uri":"(?<uri>[^"]+\.(?:jpg|jpeg|png|webp))"/gi;
  for (const m of html.matchAll(re2)) {
    if (!map.has(m.groups.id)) map.set(m.groups.id, m.groups.uri);
  }

  const re3 =
    /"uri":"(?<uri>[^"]+\.(?:jpg|jpeg|png|webp))"[\s\S]{0,400}?"containerId":"comp-[^"_]+__(?<id>[0-9a-f-]{36})"/gi;
  for (const m of html.matchAll(re3)) {
    if (!map.has(m.groups.id)) map.set(m.groups.id, m.groups.uri);
  }

  return map;
}

/** @returns {Map<string, string[]>} itemId -> candidate titles */
function extractTitlesByItemId(html) {
  /** @type {Map<string, string[]>} */
  const map = new Map();
  const re =
    /id="[^"]+__(?<id>[0-9a-f-]{36})"[^>]*>[\s\S]*?<p class="font_8[^"]*"[^>]*>(?<title>[^<]+)<\/p>/gi;
  for (const m of html.matchAll(re)) {
    const title = decodeEntities(m.groups.title).trim();
    if (!title || title.length < 4) continue;
    if (/^[.📍\s🐾]+$/.test(title)) continue;
    if (/pets\s*welcome/i.test(title)) continue;
    if (
      /^(pohara|pōhara|collingwood|patons rock|tata beach|wainui bay|parapara|onekaka|ligar bay|east takaka)$/i.test(
        title,
      )
    ) {
      continue;
    }
    const list = map.get(m.groups.id) || [];
    if (!list.includes(title)) list.push(title);
    map.set(m.groups.id, list);
  }
  return map;
}

function normalizeTitle(s) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveHome(homes, titleLike) {
  const t = normalizeTitle(titleLike);
  const slug = slugify(titleLike);

  for (const h of homes) {
    if (h.slug === slug) return h;
    if (normalizeTitle(h.title) === t) return h;
    if (h.shortTitle && normalizeTitle(h.shortTitle) === t) return h;
  }

  for (const h of homes) {
    const ht = normalizeTitle(h.title);
    const st = h.shortTitle ? normalizeTitle(h.shortTitle) : "";
    if (ht.includes(t) || t.includes(ht)) return h;
    if (st && (st.includes(t) || t.includes(st))) return h;
  }
  return null;
}

async function main() {
  console.log("Fetching", SITE);
  const html = await fetchHtml();
  writeFileSync(join(ROOT, "content", ".wix-home-cache.html"), html);
  console.log(`HTML bytes: ${html.length}`);

  const images = extractImagesByItemId(html);
  const titles = extractTitlesByItemId(html);
  console.log(`Item images: ${images.size}, item title groups: ${titles.size}`);

  const homes = JSON.parse(readFileSync(HOMES_PATH, "utf8"));
  /** @type {Map<string, string[]>} */
  const photosBySlug = new Map();
  const unmatchedTitles = [];

  for (const [id, titleList] of titles) {
    const media = images.get(id);
    if (!media) continue;
    let home = null;
    for (const title of titleList) {
      home = resolveHome(homes, title);
      if (home) break;
    }
    if (!home) {
      unmatchedTitles.push(...titleList);
      continue;
    }
    const url = wixMediaUrl(media);
    const list = photosBySlug.get(home.slug) || [];
    if (!list.includes(url)) list.push(url);
    photosBySlug.set(home.slug, list);
  }

  // Also match via image alt text when present
  const altRe =
    /"uri":"(?<uri>[^"]+\.(?:jpg|jpeg|png|webp))"[\s\S]{0,200}?"alt":"(?<alt>[^"]*)"/gi;
  for (const m of html.matchAll(altRe)) {
    const alt = decodeEntities(m.groups.alt || "").trim();
    if (alt.length < 4) continue;
    const home = resolveHome(homes, alt);
    if (!home) continue;
    const url = wixMediaUrl(m.groups.uri);
    const list = photosBySlug.get(home.slug) || [];
    if (!list.includes(url)) list.push(url);
    photosBySlug.set(home.slug, list);
  }

  let updated = 0;
  let withPhotos = 0;
  const next = homes.map((h) => {
    const photos = photosBySlug.get(h.slug) || [];
    if (photos.length === 0) return h;
    withPhotos += 1;
    if (JSON.stringify(photos) === JSON.stringify(h.photos)) return h;
    updated += 1;
    return { ...h, photos };
  });

  writeFileSync(HOMES_PATH, JSON.stringify(next, null, 2) + "\n");

  const missing = next.filter((h) => !h.photos?.length).map((h) => h.title);
  console.log(`Homes with photos: ${withPhotos}/${next.length}`);
  console.log(`Updated: ${updated}`);
  if (missing.length) {
    console.log(`Still missing (${missing.length}):`);
    for (const s of missing) console.log(" -", s);
  }
  if (unmatchedTitles.length) {
    console.log(`Unmatched Wix titles (${unmatchedTitles.length}):`);
    for (const s of [...new Set(unmatchedTitles)].slice(0, 20)) console.log(" -", s);
  }

  writeFileSync(
    join(ROOT, "content", ".wix-photo-map.json"),
    JSON.stringify(Object.fromEntries(photosBySlug), null, 2) + "\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
