import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("https://www.goldenbayholidayhomes.com"),
  GUESTY_CLIENT_ID: z.string().optional(),
  GUESTY_CLIENT_SECRET: z.string().optional(),
  GUESTY_API_BASE: z.string().url().default("https://booking-api.guesty.com"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    GUESTY_CLIENT_ID: process.env.GUESTY_CLIENT_ID,
    GUESTY_CLIENT_SECRET: process.env.GUESTY_CLIENT_SECRET,
    GUESTY_API_BASE: process.env.GUESTY_API_BASE,
  });

  if (!parsed.success) {
    return {
      NEXT_PUBLIC_SITE_URL: "https://www.goldenbayholidayhomes.com",
      GUESTY_API_BASE: "https://booking-api.guesty.com",
    };
  }

  return parsed.data;
}

export const env = loadEnv();

export function hasGuestyCredentials(): boolean {
  return Boolean(env.GUESTY_CLIENT_ID && env.GUESTY_CLIENT_SECRET);
}

const CANONICAL_SITE_URL = "https://www.goldenbayholidayhomes.com";

/** Prefer the .com host even if an env var still points at the old .nz site. */
function resolveSiteUrl(value: string): string {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (
      host === "goldenbayholidayhomes.com" ||
      host === "goldenbayholidayhomes.nz"
    ) {
      return CANONICAL_SITE_URL;
    }
    return value.replace(/\/$/, "");
  } catch {
    return CANONICAL_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl(env.NEXT_PUBLIC_SITE_URL);

/** Optional base path for GitHub project Pages (e.g. /repo-name). */
export const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

/**
 * Prefix local `/public` paths for project Pages.
 * Needed because `images.unoptimized` does not apply `basePath` to Image `src`.
 */
export function assetPath(path: string): string {
  if (
    !path ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("//")
  ) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (BASE_PATH && normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized;
  }
  return `${BASE_PATH}${normalized}`;
}

type ContactDetails = {
  phoneMobile: string;
  phoneFree: string;
  email: string;
  facebook: string;
  mapsUrl: string;
  guestyOwners: string;
  guestyBookings: string;
  googleBusiness?: string;
  instagram?: string;
  youtube?: string;
};

function optionalPublicUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
}

const DEFAULT_MAPS_SEARCH =
  "https://www.google.com/maps/search/?api=1&query=Golden+Bay+Holiday+Homes+Takaka";

const googleBusiness = optionalPublicUrl(
  process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL,
);
const instagram =
  optionalPublicUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL) ??
  "https://www.instagram.com/goldenbayholidayhomeslimited/";
const youtube = optionalPublicUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL);
const mapsUrl =
  optionalPublicUrl(process.env.NEXT_PUBLIC_MAPS_URL) ??
  googleBusiness ??
  DEFAULT_MAPS_SEARCH;

export const CONTACT: Readonly<ContactDetails> = {
  phoneMobile: "+64 20 4141 7230",
  phoneFree: "0800 150 810",
  email: "admin@gbholidayhomes.co.nz",
  facebook: "https://www.facebook.com/goldenbayholidayhomeslimited/",
  mapsUrl,
  guestyOwners: "https://goldenbayholidayhomes.guestyowners.com/login",
  guestyBookings: "https://goldenbayholidayhomes.guestybookings.com/en",
  googleBusiness,
  instagram,
  youtube,
};

/**
 * Public Formspree / Buttondown / Mailchimp form action for the newsletter.
 * When unset, the signup UI asks visitors to email us instead of a fake success.
 */
export const NEWSLETTER_FORM_ACTION = optionalPublicUrl(
  process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION,
);

/** Verified profiles that can identify the business across the web. */
export function contactSameAs(): string[] {
  return [
    CONTACT.facebook,
    CONTACT.googleBusiness,
    CONTACT.instagram,
    CONTACT.youtube,
  ].filter((url): url is string => Boolean(url));
}
