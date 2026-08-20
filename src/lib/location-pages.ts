import fs from "fs";
import path from "path";
import { getAllHomes } from "@/lib/homes";
import {
  foldLocationKey,
  getActiveHomeLocations,
  locationSlug,
  normalizeLocation,
  type Location,
} from "@/lib/locations";

const LOCATIONS_FILE = path.join(
  process.cwd(),
  "content",
  "locations.json",
);

export type LocationFaq = { q: string; a: string };

export type LocationPage = {
  name: string;
  slug: string;
  headline: string;
  intro: string;
  body: string;
  highlights: string[];
  faqs: LocationFaq[];
  geo: { latitude: number; longitude: number };
  exploreNearby?: string[];
};

function readLocationPages(): LocationPage[] {
  return JSON.parse(fs.readFileSync(LOCATIONS_FILE, "utf8")) as LocationPage[];
}

export function getLocationPages(): LocationPage[] {
  return readLocationPages();
}

export function getLocationPage(slug: string): LocationPage | null {
  const key = foldLocationKey(slug);
  return (
    readLocationPages().find(
      (page) =>
        page.slug === slug || foldLocationKey(page.slug) === key,
    ) ?? null
  );
}

export function getLocationPageByName(name: string): LocationPage | null {
  const normalized = normalizeLocation(name);
  return (
    readLocationPages().find(
      (page) => normalizeLocation(page.name) === normalized,
    ) ?? null
  );
}

/** Canonical town names that currently have inventory. */
export function getActiveLocationNames(): Location[] {
  return getActiveHomeLocations(getAllHomes().map((home) => home.location));
}

/** Location landing pages that still have inventory. */
export function getActiveLocationPages(): LocationPage[] {
  const active = new Set(
    getActiveLocationNames().map((name) => foldLocationKey(name)),
  );
  return getLocationPages().filter((page) =>
    active.has(foldLocationKey(page.name)),
  );
}

export { locationSlug };
