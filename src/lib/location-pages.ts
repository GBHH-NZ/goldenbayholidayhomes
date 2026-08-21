import fs from "fs";
import path from "path";
import { z } from "zod";
import { getAllHomes } from "@/lib/homes";
import type { Home } from "@/lib/homes/types";
import {
  getActiveHomeLocations,
  locationSlug,
  normalizeLocation,
  type Location,
} from "@/lib/locations";

const LOCATIONS_FILE = path.join(process.cwd(), "content", "locations.json");

export const locationPageSchema = z.object({
  /** Canonical town name — must match `normalizeLocation` output. */
  name: z.string().min(1),
  slug: z.string().min(1),
  headline: z.string().min(1),
  /** Optional overrides; the page falls back to generated copy. */
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  intro: z.string().min(1),
  /** Paragraphs separated by a blank line. */
  body: z.string().min(1),
  highlights: z.array(z.string()).default([]),
  faqs: z
    .array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
    .default([]),
  geo: z.object({ latitude: z.number(), longitude: z.number() }),
  /** Slugs from content/explore/places.json. */
  exploreNearby: z.array(z.string()).default([]),
});

export type LocationPage = z.infer<typeof locationPageSchema>;
export type LocationFaq = LocationPage["faqs"][number];

/** A location page plus the live inventory behind it. */
export type LocationPageWithHomes = LocationPage & {
  homes: Home[];
  homeCount: number;
};

function readLocationContent(): LocationPage[] {
  const raw = JSON.parse(
    fs.readFileSync(LOCATIONS_FILE, "utf8"),
  ) as unknown[];
  return raw.map((row) => locationPageSchema.parse(row));
}

/** Canonical towns with at least one home, in LOCATIONS order. */
export function getActiveLocationNames(): Location[] {
  return getActiveHomeLocations(getAllHomes().map((home) => home.location));
}

/**
 * Location pages that currently have inventory, busiest town first.
 * Towns without homes (or without content) are skipped so we never publish an
 * empty landing page.
 */
export function getLocationPages(): LocationPageWithHomes[] {
  const homes = getAllHomes();
  const byLocation = new Map<string, Home[]>();
  for (const home of homes) {
    const name = normalizeLocation(home.location);
    const list = byLocation.get(name);
    if (list) list.push(home);
    else byLocation.set(name, [home]);
  }

  return readLocationContent()
    .map((page) => {
      const name = normalizeLocation(page.name);
      const locationHomes = byLocation.get(name) ?? [];
      return {
        ...page,
        name,
        slug: page.slug || locationSlug(name),
        homes: locationHomes,
        homeCount: locationHomes.length,
      };
    })
    .filter((page) => page.homeCount > 0)
    .sort(
      (a, b) => b.homeCount - a.homeCount || a.name.localeCompare(b.name),
    );
}

/** Alias of `getLocationPages()` — every published page has inventory. */
export function getActiveLocationPages(): LocationPageWithHomes[] {
  return getLocationPages();
}

export function getLocationPage(slug: string): LocationPageWithHomes | null {
  const target = locationSlug(slug);
  return getLocationPages().find((page) => page.slug === target) ?? null;
}

export function getLocationPageByName(
  name: string,
): LocationPageWithHomes | null {
  const target = normalizeLocation(name);
  return getLocationPages().find((page) => page.name === target) ?? null;
}

export function getLocationPageSlugs(): string[] {
  return getLocationPages().map((page) => page.slug);
}

/** Straight-line distance in km — good enough to order neighbouring towns. */
function distanceKm(
  a: LocationPage["geo"],
  b: LocationPage["geo"],
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest other towns with inventory, for cross-linking between pages. */
export function getNearbyLocationPages(
  page: LocationPage,
  limit = 3,
): LocationPageWithHomes[] {
  return getLocationPages()
    .filter((other) => other.slug !== page.slug)
    .map((other) => ({ other, km: distanceKm(page.geo, other.geo) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map((entry) => entry.other);
}

export { locationSlug };

export function locationBodyParagraphs(page: LocationPage): string[] {
  return page.body
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean);
}
