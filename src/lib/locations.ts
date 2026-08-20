import { slugify } from "@/lib/slugify";

/** Canonical Golden Bay location tags (Pohara / Pōhara merged). */
export const LOCATIONS = [
  "Collingwood",
  "East Takaka",
  "Ligar Bay",
  "Onekaka",
  "Parapara",
  "Patons Rock",
  "Pohara",
  "Tata Beach",
  "Wainui Bay",
] as const;

export type Location = (typeof LOCATIONS)[number];

const LOCATION_ALIASES: Record<string, Location> = {
  pohara: "Pohara",
  "pohara / pohara": "Pohara",
  collingwood: "Collingwood",
  "east takaka": "East Takaka",
  "ligar bay": "Ligar Bay",
  onekaka: "Onekaka",
  parapara: "Parapara",
  "patons rock": "Patons Rock",
  "tata beach": "Tata Beach",
  "wainui bay": "Wainui Bay",
};

/** Fold macrons so East Tākaka and East Takaka resolve to the same tag. */
export function foldLocationKey(raw: string): string {
  return raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeLocation(raw: string): Location | string {
  const key = foldLocationKey(raw);
  return LOCATION_ALIASES[key] ?? raw.trim();
}

export function isLocation(value: string): value is Location {
  return (LOCATIONS as readonly string[]).includes(value);
}

/** URL slug for a town: locationSlug("East Tākaka") === "east-takaka". */
export function locationSlug(name: string): string {
  return slugify(normalizeLocation(name));
}

/** Canonical town for a `/holiday-homes/[location]` slug, or null. */
export function getLocationBySlug(slug: string): Location | null {
  const target = slugify(slug);
  return LOCATIONS.find((name) => locationSlug(name) === target) ?? null;
}

/**
 * Canonical towns that currently have at least one home, in LOCATIONS order.
 *
 * Takes the raw `home.location` values rather than reading the catalogue so
 * this module stays importable from client components. Server callers can use
 * `getActiveLocationNames()` from `@/lib/location-pages` for the no-argument
 * version.
 */
export function getActiveHomeLocations(
  rawLocations: Iterable<string>,
): Location[] {
  const active = new Set<string>();
  for (const raw of rawLocations) {
    active.add(normalizeLocation(raw));
  }
  return LOCATIONS.filter((name) => active.has(name));
}

export function isKnownLocation(raw: string): boolean {
  return LOCATION_ALIASES[foldLocationKey(raw)] != null;
}

/** Path of the town page for a location tag, or null when there is no page. */
export function locationPath(raw: string): string | null {
  if (!isKnownLocation(raw)) return null;
  return `/holiday-homes/${slugify(normalizeLocation(raw))}`;
}

/** Old Phase 2 cluster ids that are not town names. */
const LEGACY_CLUSTER_IDS = new Set([
  "pohara-ligar",
  "tata-patons",
  "east-takaka",
]);

export function catalogueLocationParam(
  value: string | null | undefined,
): string {
  if (!value) return "";
  if (LEGACY_CLUSTER_IDS.has(foldLocationKey(value))) return "";
  return value;
}
