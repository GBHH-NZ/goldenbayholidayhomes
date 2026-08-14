import { normalizeLocation } from "@/lib/locations";
import type { Home } from "./types";

export const SLEEPS_BANDS = [
  { id: "2-4", label: "2–4", min: 2, max: 4 },
  { id: "5-8", label: "5–8", min: 5, max: 8 },
  { id: "9+", label: "9+", min: 9, max: null },
] as const;

export type SleepsBandId = (typeof SLEEPS_BANDS)[number]["id"];

export const BEDROOM_FILTERS = [
  { id: "1", label: "1", min: 1, max: 1 },
  { id: "2", label: "2", min: 2, max: 2 },
  { id: "3", label: "3", min: 3, max: 3 },
  { id: "4+", label: "4+", min: 4, max: null },
] as const;

export type BedroomFilterId = (typeof BEDROOM_FILTERS)[number]["id"];

export type HomeSetting = NonNullable<Home["setting"]>;

export type CatalogueFilters = {
  location?: string;
  pets?: boolean;
  q?: string;
  sleeps?: string | null;
  bedrooms?: string | null;
  minGuests?: number;
  oceanView?: boolean;
  spa?: boolean;
  setting?: string | null;
};

export type HomesReviewAggregate = {
  homeCount: number;
  reviewedHomeCount: number;
  reviewCount: number;
  averageScore: number;
};

export function parseSleepsBand(value: string | null | undefined): SleepsBandId | null {
  if (!value) return null;
  return SLEEPS_BANDS.some((band) => band.id === value)
    ? (value as SleepsBandId)
    : null;
}

export function parseBedroomFilter(
  value: string | null | undefined,
): BedroomFilterId | null {
  if (!value) return null;
  return BEDROOM_FILTERS.some((band) => band.id === value)
    ? (value as BedroomFilterId)
    : null;
}

export function parseSetting(
  value: string | null | undefined,
): HomeSetting | null {
  if (value === "beach" || value === "bush" || value === "farm") return value;
  return null;
}

export function matchSleepsBand(home: Home, bandId: SleepsBandId): boolean {
  const band = SLEEPS_BANDS.find((item) => item.id === bandId);
  if (!band) return true;
  if (home.guests < band.min) return false;
  if (band.max != null && home.guests > band.max) return false;
  return true;
}

export function matchBedroomFilter(home: Home, filterId: BedroomFilterId): boolean {
  if (home.bedrooms == null) return false;
  const band = BEDROOM_FILTERS.find((item) => item.id === filterId);
  if (!band) return true;
  if (home.bedrooms < band.min) return false;
  if (band.max != null && home.bedrooms > band.max) return false;
  return true;
}

export function applyCatalogueFilters(
  homes: Home[],
  filters: CatalogueFilters = {},
): Home[] {
  let list = homes;

  if (filters.location) {
    const loc = normalizeLocation(filters.location);
    list = list.filter((h) => normalizeLocation(h.location) === loc);
  }
  if (filters.pets) {
    list = list.filter((h) => h.petsAllowed);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.description ?? "").toLowerCase().includes(q),
    );
  }

  const sleeps = parseSleepsBand(filters.sleeps);
  if (sleeps) {
    list = list.filter((h) => matchSleepsBand(h, sleeps));
  }
  if (filters.minGuests) {
    list = list.filter((h) => h.guests >= filters.minGuests!);
  }

  const bedrooms = parseBedroomFilter(filters.bedrooms);
  if (bedrooms) {
    list = list.filter((h) => matchBedroomFilter(h, bedrooms));
  }
  if (filters.oceanView) {
    list = list.filter((h) => h.oceanView);
  }
  if (filters.spa) {
    list = list.filter((h) => h.spa);
  }
  const setting = parseSetting(filters.setting);
  if (setting) {
    list = list.filter((h) => h.setting === setting);
  }

  return list;
}
