import fs from "fs";
import path from "path";
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
} from "./types";

const HOMES_FILE = path.join(process.cwd(), "content", "homes.json");

export type HomeFilters = {
  location?: string;
  pets?: boolean;
  minGuests?: number;
  q?: string;
};

export function getAllHomes(filters?: HomeFilters): Home[] {
  const raw = JSON.parse(fs.readFileSync(HOMES_FILE, "utf8")) as unknown[];
  let homes = raw.map((row) => homeSchema.parse(row));

  if (filters?.location) {
    const loc = normalizeLocation(filters.location);
    homes = homes.filter((h) => normalizeLocation(h.location) === loc);
  }
  if (filters?.pets) {
    homes = homes.filter((h) => h.petsAllowed);
  }
  if (filters?.minGuests) {
    homes = homes.filter((h) => h.guests >= filters.minGuests!);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    homes = homes.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.description ?? "").toLowerCase().includes(q),
    );
  }

  return homes.sort((a, b) => a.title.localeCompare(b.title));
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
