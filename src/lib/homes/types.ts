import { z } from "zod";
import { assetPath, CONTACT } from "@/lib/env";

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

const LOCAL_SUPPORT = `Local guest support on ${CONTACT.phoneFree}`;

/** Included with every Golden Bay Holiday Homes stay, Guesty list or not. */
const BRAND_STANDARDS = ["Hotel-quality linen", LOCAL_SUPPORT] as const;

const SETTING_AMENITY = {
  beach: "Beach setting",
  bush: "Bush setting",
  farm: "Farm setting",
} as const;

const SELF_CHECK_IN = /self[\s-]?check[\s-]?in/i;

/** Guesty wording that already covers a derived highlight. */
const ALREADY_LISTED: Record<string, RegExp> = {
  "Hotel-quality linen": /\blinens?\b/i,
  [LOCAL_SUPPORT]: /\b(guest|host)\s+support\b/i,
  "Self check-in": SELF_CHECK_IN,
  "Ocean view": /\b(ocean|sea|bay|water)\s*views?\b/i,
  Spa: /\b(spa|hot\s?tub|jacuzzi)\b/i,
  "Pets welcome": /\bpets?\b/i,
};

function amenityKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dedupeAmenities(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const label = value.trim();
    if (!label) continue;
    const key = amenityKey(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function homeMentionsSelfCheckIn(home: Home): boolean {
  return SELF_CHECK_IN.test(home.description ?? "");
}

/** The hand-tagged flags a card already shows as badges. */
export function homeFlagAmenities(home: Home): string[] {
  const out: string[] = [];
  if (home.setting) out.push(SETTING_AMENITY[home.setting]);
  if (home.walkMins != null) out.push(`${home.walkMins} min walk to the beach`);
  if (home.oceanView) out.push("Ocean view");
  if (home.spa) out.push("Spa");
  if (home.petsAllowed) out.push("Pets welcome");
  return out;
}

/**
 * What we can state about a stay from the row itself plus the standards that
 * apply to every home. Guesty leaves `amenities` empty on the bookings
 * catalogue, so this is what listing pages and schema.org fall back to.
 */
export function derivedAmenities(home: Home): string[] {
  const out = homeFlagAmenities(home);
  if (home.bedrooms != null && home.bedrooms > 0) {
    out.push(plural(home.bedrooms, "bedroom"));
  }
  if (home.bathrooms != null && home.bathrooms > 0) {
    out.push(plural(home.bathrooms, "bathroom"));
  }
  out.push(...BRAND_STANDARDS);
  if (homeMentionsSelfCheckIn(home)) out.push("Self check-in");
  return dedupeAmenities(out);
}

/** Guesty amenities when we have them, plus any derived highlight they miss. */
export function homeAmenities(home: Home): string[] {
  const derived = derivedAmenities(home);
  const listed = dedupeAmenities(home.amenities);
  if (listed.length === 0) return derived;

  const keys = new Set(listed.map(amenityKey));
  const extras = derived.filter((item) => {
    if (keys.has(amenityKey(item))) return false;
    const covered = ALREADY_LISTED[item];
    return !covered || !listed.some((listedItem) => covered.test(listedItem));
  });

  return [...listed, ...extras];
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
