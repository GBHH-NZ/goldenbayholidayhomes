import fs from "fs";
import path from "path";
import {
  applyCatalogueFilters,
  type CatalogueFilters,
  type HomesReviewAggregate,
} from "./filters";
import { sortHomesForCatalogue } from "./order";
import { homeSchema, type Home } from "./types";
import { normalizeLocation } from "@/lib/locations";

export type {
  Home,
  SyncStatus,
} from "./types";
export {
  homeSchema,
  homePhotos,
  homeDescription,
  homeAmenities,
  bookingUrl,
  PLACEHOLDER_PHOTO,
  SETTING_LABEL,
} from "./types";
export type { CatalogueFilters, HomesReviewAggregate } from "./filters";
export { CATALOGUE_LEAD_SLUGS, sortHomesForCatalogue } from "./order";

const HOMES_FILE = path.join(process.cwd(), "content", "homes.json");

export type HomeFilters = CatalogueFilters;

export function getAllHomes(filters?: HomeFilters): Home[] {
  const raw = JSON.parse(fs.readFileSync(HOMES_FILE, "utf8")) as unknown[];
  const homes = raw.map((row) => homeSchema.parse(row));

  return sortHomesForCatalogue(applyCatalogueFilters(homes, filters));
}

/** Weighted average from Guesty scores already stored on each home. */
export function getHomesReviewAggregate(
  homes: Home[] = getAllHomes(),
): HomesReviewAggregate {
  const reviewed = homes.filter(
    (h) =>
      h.reviewScore != null && h.reviewCount != null && h.reviewCount > 0,
  );
  const reviewCount = reviewed.reduce(
    (sum, h) => sum + (h.reviewCount ?? 0),
    0,
  );
  const weighted = reviewed.reduce(
    (sum, h) => sum + (h.reviewScore ?? 0) * (h.reviewCount ?? 0),
    0,
  );

  return {
    homeCount: homes.length,
    reviewedHomeCount: reviewed.length,
    reviewCount,
    averageScore: reviewCount > 0 ? weighted / reviewCount : 0,
  };
}

export function getHomeBySlug(slug: string): Home | null {
  return getAllHomes().find((h) => h.slug === slug) ?? null;
}

export function getHomeLocations(): string[] {
  const set = new Set(
    getAllHomes().map((h) => normalizeLocation(h.location) as string),
  );
  return Array.from(set).sort();
}

export function writeHomesFile(homes: Home[]): void {
  fs.writeFileSync(HOMES_FILE, JSON.stringify(homes, null, 2) + "\n", "utf8");
}
