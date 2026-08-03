import { guestyFetch } from "./auth";
import type { Home } from "@/lib/homes/types";
import { slugify } from "@/lib/slugify";
import { normalizeLocation } from "@/lib/locations";
import { CONTACT } from "@/lib/env";

/** Raw Guesty listing shape (subset — filled when API keys are live). */
export type GuestyListing = {
  _id: string;
  title?: string;
  nickname?: string;
  address?: {
    city?: string;
    full?: string;
    neighborhood?: string;
  };
  accommodates?: number;
  bedrooms?: number;
  bathrooms?: number;
  pictures?: { original?: string; thumbnail?: string }[];
  publicDescription?: { summary?: string; space?: string };
  amenities?: string[];
  petsAllowed?: boolean;
};

export function mapGuestyListing(listing: GuestyListing): Home {
  const title = listing.title || listing.nickname || "Holiday Home";
  const location = normalizeLocation(
    listing.address?.neighborhood || listing.address?.city || "Golden Bay",
  ) as string;
  const photos =
    listing.pictures
      ?.map((p) => p.original || p.thumbnail)
      .filter((u): u is string => Boolean(u)) ?? [];

  return {
    slug: slugify(title),
    title,
    shortTitle: listing.nickname ?? null,
    location,
    guests: listing.accommodates ?? 2,
    petsAllowed: Boolean(listing.petsAllowed),
    guestyId: listing._id,
    guestyUrl: `${CONTACT.guestyBookings}/properties/${listing._id}`,
    photos,
    description:
      listing.publicDescription?.summary ||
      listing.publicDescription?.space ||
      null,
    amenities: listing.amenities ?? [],
    bedrooms: listing.bedrooms ?? null,
    bathrooms: listing.bathrooms ?? null,
    address: listing.address?.full ?? null,
    syncStatus: "synced",
  };
}

export async function fetchGuestyListings(): Promise<Home[]> {
  const data = await guestyFetch<{
    results?: GuestyListing[];
    data?: GuestyListing[];
  }>("/v1/listings", { limit: "100" });

  const results = data.results ?? data.data ?? [];
  return results.map(mapGuestyListing);
}

/**
 * Merge API listings onto existing seed rows.
 * Prefer guestyId match, then slug match; keep seed-only rows as pending_api.
 */
export function mergeHomes(seed: Home[], fromApi: Home[]): Home[] {
  const byId = new Map(
    fromApi.filter((h) => h.guestyId).map((h) => [h.guestyId!, h]),
  );
  const bySlug = new Map(fromApi.map((h) => [h.slug, h]));
  const used = new Set<string>();

  const merged: Home[] = seed.map((row) => {
    const match =
      (row.guestyId && byId.get(row.guestyId)) || bySlug.get(row.slug);
    if (!match) {
      return { ...row, syncStatus: "pending_api" as const };
    }
    used.add(match.guestyId ?? match.slug);
    return {
      ...row,
      ...match,
      // Keep Wix location/pets/guests if API omits them
      location: match.location || row.location,
      guests: match.guests || row.guests,
      petsAllowed: match.petsAllowed ?? row.petsAllowed,
      syncStatus: "synced" as const,
    };
  });

  for (const apiHome of fromApi) {
    const key = apiHome.guestyId ?? apiHome.slug;
    if (!used.has(key)) {
      merged.push(apiHome);
    }
  }

  return merged.sort((a, b) => a.title.localeCompare(b.title));
}
