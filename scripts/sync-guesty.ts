/**
 * Read-only Guesty catalogue sync.
 * Usage: npm run sync:guesty
 * Requires GUESTY_CLIENT_ID + GUESTY_CLIENT_SECRET in .env.local
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFile(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const { hasGuestyCredentials } = await import("../src/lib/env");
  if (!hasGuestyCredentials()) {
    console.error(`
Guesty API keys are not configured.

Add to .env.local:
  GUESTY_CLIENT_ID=...
  GUESTY_CLIENT_SECRET=...
  GUESTY_API_BASE=https://booking-api.guesty.com

Then re-run: npm run sync:guesty

Until then, content/homes.json keeps Wix seed data with null placeholders
for guestyId, guestyUrl, photos, description, amenities, bedrooms, bathrooms, address.
`);
    process.exit(1);
  }

  const { getAllHomes, writeHomesFile } = await import("../src/lib/homes");
  const { fetchGuestyListings, mergeHomes } = await import(
    "../src/lib/guesty/sync"
  );

  console.log("Fetching Guesty listings…");
  const fromApi = await fetchGuestyListings();
  console.log(`Received ${fromApi.length} listings from Guesty.`);

  const seed = getAllHomes();
  const merged = mergeHomes(seed, fromApi);
  writeHomesFile(merged);

  const synced = merged.filter((h) => h.syncStatus === "synced").length;
  const pending = merged.filter((h) => h.syncStatus === "pending_api").length;
  console.log(
    `Wrote content/homes.json — ${synced} synced, ${pending} still pending_api, ${merged.length} total.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
