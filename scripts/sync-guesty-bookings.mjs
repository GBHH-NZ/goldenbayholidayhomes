/**
 * Sync homes.json from the public Guesty Booking Engine properties catalogue.
 * Prefer intercepting app.guesty.com/api/pm-websites-backend/listings;
 * fall back to scraping property-card DOM.
 *
 * Usage: npm run sync:guesty-bookings
 * Requires Google Chrome (or Chromium) on the machine. No Guesty API keys.
 */
import { spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import net from "net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const HOMES_PATH = join(ROOT, "content", "homes.json");
const SITE =
  "https://goldenbayholidayhomes.guestybookings.com/en/properties?minOccupancy=1&adults=1";
const GUESTY_BOOKINGS =
  "https://goldenbayholidayhomes.guestybookings.com/en";
const LISTINGS_PATH = "/api/pm-websites-backend/listings";

const LOCATION_ALIASES = {
  pohara: "Pohara",
  pōhara: "Pohara",
  "pohara / pōhara": "Pohara",
  collingwood: "Collingwood",
  "east takaka": "East Takaka",
  "ligar bay": "Ligar Bay",
  onekaka: "Onekaka",
  parapara: "Parapara",
  "patons rock": "Patons Rock",
  "tata beach": "Tata Beach",
  "wainui bay": "Wainui Bay",
  takaka: "East Takaka",
  "golden bay": "Pohara",
};

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeLocation(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  return LOCATION_ALIASES[key] ?? String(raw || "Golden Bay").trim();
}

function chromeCandidates() {
  return [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
}

function findChrome() {
  for (const p of chromeCandidates()) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    "Chrome/Chromium not found. Set CHROME_PATH or install Google Chrome.",
  );
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

async function waitForJson(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.eventHandlers = new Map();
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id != null && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
        return;
      }
      if (msg.method) {
        const handlers = this.eventHandlers.get(msg.method) || [];
        for (const h of handlers) h(msg.params || {});
      }
    });
  }

  ready() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve(), { once: true });
      this.ws.addEventListener(
        "error",
        (e) => reject(e.error || new Error("WebSocket error")),
        { once: true },
      );
    });
  }

  on(method, handler) {
    if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, []);
    this.eventHandlers.get(method).push(handler);
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
  }
}

function extractListingsFromPayload(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload;
  for (const key of ["results", "data", "listings", "items"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function pictureUrl(picture) {
  if (!picture) return null;
  if (typeof picture === "string") return picture;
  return (
    picture.original ||
    picture.large ||
    picture.regular ||
    picture.thumbnail ||
    picture.url ||
    null
  );
}

function photosFromListing(raw) {
  const out = [];
  const primary = pictureUrl(raw.picture);
  if (primary) out.push(primary);
  const pics = raw.pictures || raw.photos || [];
  for (const p of pics) {
    const u = pictureUrl(p);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

function nightlyFromListing(raw) {
  const rates = raw.nightlyRates;
  if (Array.isArray(rates) && rates.length) {
    const nums = rates
      .map((r) =>
        typeof r === "number"
          ? r
          : Number(r?.price ?? r?.amount ?? r?.rate ?? r?.nightly),
      )
      .filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length) return Math.min(...nums);
  }
  const prices = raw.prices || {};
  for (const key of [
    "basePrice",
    "nightly",
    "nightlyPrice",
    "from",
    "minPrice",
    "lowestPrice",
  ]) {
    const n = Number(prices[key]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const total = Number(raw.totalPrice?.amount ?? raw.totalPrice);
  if (Number.isFinite(total) && total > 0) return total;
  return null;
}

function petsAllowedFromListing(raw) {
  if (typeof raw.petsAllowed === "boolean") return raw.petsAllowed;
  const rules = raw.unitTypeHouseRules || raw.houseRules || {};
  const nested =
    rules.houseRules?.petsAllowed ??
    rules.petsAllowed ??
    rules.pets;
  if (typeof nested === "boolean") return nested;
  if (nested && typeof nested === "object" && typeof nested.enabled === "boolean") {
    return nested.enabled;
  }
  const amenities = (raw.amenities || []).map((a) =>
    String(a).toLowerCase(),
  );
  if (amenities.some((a) => a.includes("pet"))) return true;
  return false;
}

function reviewScore(raw) {
  const r = raw.reviews || raw.review || {};
  const score = Number(
    r.avg || r.average || r.score || r.rating || raw.reviewScore,
  );
  return Number.isFinite(score) ? score : null;
}

function reviewCount(raw) {
  const r = raw.reviews || raw.review || {};
  const count = Number(r.count || r.total || raw.reviewCount);
  return Number.isFinite(count) ? count : null;
}

function descriptionFromListing(raw) {
  const pd = raw.publicDescription || {};
  const text =
    (typeof pd === "string" ? pd : null) ||
    pd.summary ||
    pd.space ||
    pd.neighborhood ||
    raw.description ||
    raw.summary ||
    null;
  if (!text) return null;
  return String(text).replace(/\s+/g, " ").trim().slice(0, 600) || null;
}

function locationFromText(text) {
  const hay = String(text || "").toLowerCase();
  // Prefer longer / more specific names first
  const names = Object.keys(LOCATION_ALIASES).sort(
    (a, b) => b.length - a.length,
  );
  for (const name of names) {
    if (name === "golden bay") continue;
    if (hay.includes(name)) return LOCATION_ALIASES[name];
  }
  return null;
}

function locationFromListing(raw) {
  const address = raw.address || {};
  const fromTitle = locationFromText(raw.title || raw.nickname || "");
  if (fromTitle) return fromTitle;

  const candidates = [
    address.neighborhood,
    address.city,
    address.suburb,
    address.area,
    typeof address === "string" ? address : null,
    address.full,
  ].filter(Boolean);
  for (const c of candidates) {
    const fromAlias = locationFromText(c);
    if (fromAlias) return fromAlias;
    const key = String(c).trim().toLowerCase();
    if (LOCATION_ALIASES[key]) return LOCATION_ALIASES[key];
  }
  if (candidates[0]) return normalizeLocation(candidates[0]);
  return "Golden Bay";
}

function mapApiListing(raw, seedBySlug, seedByTitle) {
  const id = String(raw._id || raw.id || "");
  const title = String(raw.title || raw.nickname || "Holiday Home").trim();
  const slug =
    seedByTitle.get(title.toLowerCase())?.slug ||
    seedBySlug.get(slugify(title))?.slug ||
    slugify(title);
  const seed = seedBySlug.get(slug) || seedByTitle.get(title.toLowerCase());

  return {
    slug,
    title,
    shortTitle: seed?.shortTitle ?? raw.nickname ?? null,
    location: locationFromListing(raw),
    guests: Number(raw.accommodates || raw.guests || seed?.guests || 2) || 2,
    petsAllowed: petsAllowedFromListing(raw),
    propertyType: raw.propertyType || raw.roomType || null,
    nightlyFrom: nightlyFromListing(raw),
    reviewScore: reviewScore(raw),
    reviewCount: reviewCount(raw),
    guestyId: id || null,
    guestyUrl: id ? `${GUESTY_BOOKINGS}/properties/${id}` : null,
    photos: photosFromListing(raw),
    description: descriptionFromListing(raw),
    amenities: Array.isArray(raw.amenities) ? raw.amenities.map(String) : [],
    bedrooms:
      raw.bedrooms != null
        ? Number(raw.bedrooms)
        : (seed?.bedrooms ?? null),
    bathrooms:
      raw.bathrooms != null
        ? Number(raw.bathrooms)
        : (seed?.bathrooms ?? null),
    address:
      (typeof raw.address === "string"
        ? raw.address
        : raw.address?.full || raw.address?.street) ||
      seed?.address ||
      null,
    syncStatus: "synced",
  };
}

function mapDomCard(card, seedBySlug, seedByTitle) {
  const title = card.title;
  const slug =
    seedByTitle.get(title.toLowerCase())?.slug ||
    seedBySlug.get(slugify(title))?.slug ||
    slugify(title);
  const seed = seedBySlug.get(slug) || seedByTitle.get(title.toLowerCase());
  const id = card.guestyId || null;

  return {
    slug,
    title,
    shortTitle: seed?.shortTitle ?? null,
    location: normalizeLocation(
      locationFromText(card.title) ||
        card.location ||
        seed?.location ||
        "Golden Bay",
    ),
    guests: Number(card.guests || seed?.guests || 2) || 2,
    petsAllowed: Boolean(card.petsAllowed ?? seed?.petsAllowed),
    propertyType: card.propertyType || null,
    nightlyFrom:
      card.nightlyFrom != null ? Number(card.nightlyFrom) : null,
    reviewScore:
      card.reviewScore != null ? Number(card.reviewScore) : null,
    reviewCount:
      card.reviewCount != null ? Number(card.reviewCount) : null,
    guestyId: id,
    guestyUrl: id
      ? `${GUESTY_BOOKINGS}/properties/${id}`
      : card.href || `${GUESTY_BOOKINGS}`,
    photos: card.photo ? [card.photo] : seed?.photos || [],
    description: card.description || null,
    amenities: [],
    bedrooms: card.bedrooms != null ? Number(card.bedrooms) : null,
    bathrooms: card.bathrooms != null ? Number(card.bathrooms) : null,
    address: seed?.address ?? null,
    syncStatus: "synced",
  };
}

const DOM_SCRAPE_FN = `(() => {
  const parseMoney = (text) => {
    if (!text) return null;
    const m = String(text).replace(/,/g, "").match(/(\\d+(?:\\.\\d+)?)/);
    return m ? Number(m[1]) : null;
  };
  const links = Array.from(
    document.querySelectorAll('a[href*="/properties/"]'),
  ).filter((a) => {
    const href = a.getAttribute("href") || "";
    return /\\/properties\\/[a-zA-Z0-9]+/.test(href) && a.querySelector("img");
  });
  const seen = new Set();
  const cards = [];
  for (const a of links) {
    const href = a.href;
    const idMatch = href.match(/\\/properties\\/([a-zA-Z0-9]+)/);
    const guestyId = idMatch ? idMatch[1] : null;
    if (!guestyId || seen.has(guestyId)) continue;
    seen.add(guestyId);
    const text = (a.innerText || "").replace(/\\n+/g, "\\n").trim();
    const lines = text.split("\\n").map((l) => l.trim()).filter(Boolean);
    const title = lines[0] || a.getAttribute("aria-label") || "Holiday Home";
    const petsAllowed = /pets?\\s+(welcome|allowed|friendly)/i.test(text);
    const guestsMatch = text.match(/(\\d+)\\s*guests?/i);
    const bedMatch = text.match(/(\\d+)\\s*bedrooms?/i);
    const bathMatch = text.match(/(\\d+(?:\\.\\d+)?)\\s*bathrooms?/i);
    const ratingMatch = text.match(/(\\d+(?:\\.\\d+)?)\\s*(?:·|\\/)?\\s*(\\d+)\\s*reviews?/i)
      || text.match(/(\\d+(?:\\.\\d+)?)\\s*\\((\\d+)\\)/);
    const fromMatch = text.match(/from\\s*(?:nz\\$?|\\$)?\\s*([\\d,]+)/i)
      || text.match(/(?:nz\\$?|\\$)\\s*([\\d,]+)\\s*\\/?\\s*night/i);
    const typeMatch = text.match(/\\b(Entire (?:home|house|place|villa|apartment|cottage|studio)|Private room|Shared room)\\b/i);
    let location = null;
    for (const line of lines.slice(1, 4)) {
      if (/pets?/i.test(line)) continue;
      if (/guest|bedroom|bathroom|night|review|from/i.test(line)) continue;
      if (line.length < 40) { location = line; break; }
    }
    let description = null;
    for (const line of lines) {
      if (line === title || line === location) continue;
      if (/pets?|guest|bedroom|bathroom|night|review|from|Entire|Private room/i.test(line) && line.length < 40) continue;
      if (line.length > 40) { description = line; break; }
    }
    cards.push({
      guestyId,
      href,
      title,
      location,
      petsAllowed,
      guests: guestsMatch ? Number(guestsMatch[1]) : null,
      bedrooms: bedMatch ? Number(bedMatch[1]) : null,
      bathrooms: bathMatch ? Number(bathMatch[1]) : null,
      reviewScore: ratingMatch ? Number(ratingMatch[1]) : null,
      reviewCount: ratingMatch ? Number(ratingMatch[2]) : null,
      nightlyFrom: fromMatch ? parseMoney(fromMatch[1]) : null,
      propertyType: typeMatch ? typeMatch[1] : null,
      description,
      photo: a.querySelector("img")?.src || null,
    });
  }
  return cards;
})()`;

async function captureListingsWithChrome() {
  const chrome = findChrome();
  const port = await getFreePort();
  const userDataDir = join(
    ROOT,
    ".tmp-guesty-chrome-profile",
  );
  rmSync(userDataDir, { recursive: true, force: true });

  const child = spawn(
    chrome,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-extensions",
      SITE,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let stderr = "";
  child.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  const cleanup = async () => {
    if (!child.killed) {
      child.kill("SIGTERM");
      await sleep(500);
      if (!child.killed) child.kill("SIGKILL");
    }
  };

  try {
    const version = await waitForJson(
      `http://127.0.0.1:${port}/json/version`,
    );
    const wsUrl = version.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error("No webSocketDebuggerUrl from Chrome");

    const client = new CdpClient(wsUrl);
    await client.ready();

    const { targetInfos } = await client.send("Target.getTargets");
    let pageTarget = (targetInfos || []).find(
      (t) => t.type === "page" && /properties/.test(t.url || ""),
    );
    if (!pageTarget) {
      pageTarget = (targetInfos || []).find((t) => t.type === "page");
    }
    if (!pageTarget) throw new Error("No Chrome page target found");

    const { sessionId } = await client.send("Target.attachToTarget", {
      targetId: pageTarget.targetId,
      flatten: true,
    });

    const send = (method, params = {}) =>
      client.send(method, params, sessionId);

    await send("Network.enable");
    await send("Page.enable");
    await send("Runtime.enable");

    /** @type {Map<string, any>} */
    const apiById = new Map();
    const responseMeta = new Map();
    /** @type {Promise[]} */
    const pendingBodies = [];

    const ingestApiPayload = (json) => {
      for (const item of extractListingsFromPayload(json)) {
        const id = String(item?._id || item?.id || "");
        if (id) apiById.set(id, item);
        else apiById.set(`anon-${apiById.size}`, item);
      }
    };

    client.on("Network.responseReceived", (params) => {
      const url = params.response?.url || "";
      if (url.includes(LISTINGS_PATH) && !url.includes("unified-search")) {
        responseMeta.set(params.requestId, url);
      }
    });

    client.on("Network.loadingFinished", (params) => {
      if (!responseMeta.has(params.requestId)) return;
      const task = (async () => {
        const body = await send("Network.getResponseBody", {
          requestId: params.requestId,
        });
        const text = body.base64Encoded
          ? Buffer.from(body.body, "base64").toString("utf8")
          : body.body;
        if (!text) return;
        ingestApiPayload(JSON.parse(text));
      })().catch(() => {});
      pendingBodies.push(task);
    });

    await send("Page.navigate", { url: SITE });
    await send("Page.loadEventFired").catch(() => {});

    // Wait for first listings payload or DOM cards
    const deadline = Date.now() + 60000;
    let domCards = [];
    while (Date.now() < deadline) {
      await Promise.all(pendingBodies.splice(0));
      if (apiById.size >= 5) break;
      try {
        const { result } = await send("Runtime.evaluate", {
          expression: DOM_SCRAPE_FN,
          returnByValue: true,
          awaitPromise: false,
        });
        domCards = result?.value || [];
        if (domCards.length >= 10 && apiById.size === 0) {
          await sleep(2000);
          await Promise.all(pendingBodies.splice(0));
          if (apiById.size === 0) break;
        }
      } catch {
        /* page may still be loading */
      }
      await sleep(750);
    }

    // Scroll to trigger cursor pagination until unique listing count stabilizes
    let stableRounds = 0;
    let lastCount = apiById.size;
    for (let i = 0; i < 50; i++) {
      await send("Runtime.evaluate", {
        expression: `(() => {
          window.scrollTo(0, document.body.scrollHeight);
          const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          const more = buttons.find((el) => /show more|load more|view more|see more/i.test(el.textContent || ''));
          if (more) more.click();
          return true;
        })()`,
        returnByValue: true,
      });
      await sleep(1200);
      await Promise.all(pendingBodies.splice(0));
      try {
        const { result } = await send("Runtime.evaluate", {
          expression: DOM_SCRAPE_FN,
          returnByValue: true,
        });
        const cards = result?.value || [];
        if (cards.length > domCards.length) domCards = cards;
      } catch {
        /* ignore */
      }
      const count = Math.max(apiById.size, domCards.length);
      if (count > lastCount) {
        lastCount = count;
        stableRounds = 0;
      } else {
        stableRounds += 1;
        if (stableRounds >= 6 && count >= 10) break;
      }
    }

    await Promise.all(pendingBodies.splice(0));
    const apiListings = Array.from(apiById.values());

    client.close();
    await cleanup();
    rmSync(userDataDir, { recursive: true, force: true });

    return { apiListings, domCards, stderr };
  } catch (err) {
    await cleanup();
    err.message = `${err.message}\nChrome stderr: ${stderr.slice(-800)}`;
    throw err;
  }
}

function loadSeed() {
  if (!existsSync(HOMES_PATH)) return [];
  return JSON.parse(readFileSync(HOMES_PATH, "utf8"));
}

async function main() {
  console.log("Launching Chrome to capture Guesty bookings catalogue…");
  console.log(`  ${SITE}`);
  const { apiListings, domCards } = await captureListingsWithChrome();

  const seed = loadSeed();
  const seedBySlug = new Map(seed.map((h) => [h.slug, h]));
  const seedByTitle = new Map(
    seed.map((h) => [String(h.title).toLowerCase(), h]),
  );

  let homes;
  let source;
  if (apiListings.length > 0) {
    source = "api";
    homes = apiListings.map((raw) =>
      mapApiListing(raw, seedBySlug, seedByTitle),
    );
    // Fill any DOM-only cards the API pagination missed
    if (domCards.length > homes.length) {
      const have = new Set(homes.map((h) => h.guestyId).filter(Boolean));
      for (const card of domCards) {
        if (card.guestyId && !have.has(card.guestyId)) {
          homes.push(mapDomCard(card, seedBySlug, seedByTitle));
          have.add(card.guestyId);
        }
      }
      source = "api+dom";
    }
  } else if (domCards.length > 0) {
    source = "dom";
    homes = domCards.map((card) =>
      mapDomCard(card, seedBySlug, seedByTitle),
    );
  } else {
    throw new Error(
      "No Guesty listings captured (API intercept and DOM scrape both empty).",
    );
  }

  // Guesty-canonical set: dedupe by guestyId, drop seed-only rows
  const byId = new Map();
  for (const h of homes) {
    const key = h.guestyId || h.slug;
    if (!byId.has(key)) byId.set(key, h);
  }
  const catalogue = Array.from(byId.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  writeFileSync(HOMES_PATH, JSON.stringify(catalogue, null, 2) + "\n", "utf8");
  console.log(
    `Wrote content/homes.json — ${catalogue.length} listings from Guesty (${source}).`,
  );
  console.log(
    `  with photos: ${catalogue.filter((h) => h.photos?.length).length}, with price: ${catalogue.filter((h) => h.nightlyFrom != null).length}, pets: ${catalogue.filter((h) => h.petsAllowed).length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
