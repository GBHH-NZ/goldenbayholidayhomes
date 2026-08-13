import { z } from "zod";
import { assetPath } from "@/lib/env";

export const syncStatusSchema = z.enum(["seed", "pending_api", "synced"]);

export const homeSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().nullable().optional(),
  location: z.string().min(1),
  guests: z.number().int().positive(),
  petsAllowed: z.boolean().default(false),
  /** Filled by Guesty sync — e.g. Entire home, Private room */
  propertyType: z.string().nullable().optional(),
  /** Lowest nightly rate in NZD from Guesty bookings catalogue */
  nightlyFrom: z.number().nonnegative().nullable().optional(),
  reviewScore: z.number().nonnegative().nullable().optional(),
  reviewCount: z.number().int().nonnegative().nullable().optional(),
  /** Filled by Guesty API / bookings sync */
  guestyId: z.string().nullable().optional(),
  /** Filled by Guesty sync — booking engine deep link */
  guestyUrl: z.string().url().nullable().optional(),
  /** Filled by Guesty sync — empty until then */
  photos: z.array(z.string()).default([]),
  /** Filled by Guesty sync */
  description: z.string().nullable().optional(),
  /** Filled by Guesty sync */
  amenities: z.array(z.string()).default([]),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  /** Hand-tagged stay setting — beach, bush, or farm. */
  setting: z.enum(["beach", "bush", "farm"]).optional(),
  /** Minutes’ walk to the beach when the listing copy states it. */
  walkMins: z.number().int().nonnegative().optional(),
  /** Hand-tagged when copy clearly mentions ocean, sea, or bay views. */
  oceanView: z.boolean().optional(),
  /** Hand-tagged when copy clearly mentions a spa or hot tub (not a bath). */
  spa: z.boolean().optional(),
  syncStatus: syncStatusSchema.default("seed"),
});

export type Home = z.infer<typeof homeSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;

export const SETTING_LABEL = {
  beach: "Beach",
  bush: "Bush",
  farm: "Farm",
} as const;

export const PLACEHOLDER_PHOTO = assetPath("/images/placeholder-home.svg");

export function homePhotos(home: Home): string[] {
  if (home.photos.length > 0) {
    return home.photos.map(assetPath);
  }
  return [PLACEHOLDER_PHOTO];
}

export function homeDescription(home: Home): string {
  if (home.description) return home.description;
  return `${home.title} is a hand-picked Golden Bay holiday home in ${home.location}. Hotel-quality linen, thoughtful touches, and local support from Golden Bay Holiday Homes. Full description, photos, and amenities will appear here after Guesty catalogue sync.`;
}

export function homeAmenities(home: Home): string[] {
  if (home.amenities.length > 0) return home.amenities;
  return [];
}

const GUESTY_BOOKINGS =
  "https://goldenbayholidayhomes.guestybookings.com/en";

export function bookingUrl(home: Home): string {
  if (home.guestyUrl) return home.guestyUrl;
  if (home.guestyId) {
    return `${GUESTY_BOOKINGS}/properties/${home.guestyId}`;
  }
  return GUESTY_BOOKINGS;
}
