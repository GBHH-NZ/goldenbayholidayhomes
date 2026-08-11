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

export const CONTACT = {
  phoneMobile: "+64 20 4141 7230",
  phoneFree: "0800 150 810",
  email: "admin@gbholidayhomes.co.nz",
  facebook: "https://www.facebook.com/goldenbayholidayhomeslimited/",
  guestyOwners: "https://goldenbayholidayhomes.guestyowners.com/login",
  guestyBookings: "https://goldenbayholidayhomes.guestybookings.com/en",
} as const;
