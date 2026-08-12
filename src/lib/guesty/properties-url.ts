import { CONTACT } from "@/lib/env";

export const DEFAULT_MIN_OCCUPANCY = 1;
export const DEFAULT_ADULTS = 1;

export type GuestySearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  adults?: number;
  children?: number;
  city?: string;
};

export function defaultGuestyPropertiesUrl(): string {
  return guestyPropertiesUrl({});
}

export function guestyPropertiesUrl(params: GuestySearchParams = {}): string {
  const url = new URL(`${CONTACT.guestyBookings}/properties`);
  const guests = Math.max(
    1,
    Math.floor(params.guests ?? params.adults ?? DEFAULT_MIN_OCCUPANCY),
  );
  const adults = Math.max(1, Math.floor(params.adults ?? guests));

  url.searchParams.set("minOccupancy", String(guests));
  url.searchParams.set("adults", String(adults));

  if (params.children && params.children > 0) {
    url.searchParams.set("children", String(Math.floor(params.children)));
  }
  if (params.checkIn) url.searchParams.set("checkIn", params.checkIn);
  if (params.checkOut) url.searchParams.set("checkOut", params.checkOut);
  if (params.city?.trim()) {
    url.searchParams.set("city", params.city.trim());
    url.searchParams.set("country", "New Zealand");
  }

  return url.toString();
}

export function isGuestyMessageOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === "guestybookings.com" ||
      host.endsWith(".guestybookings.com") ||
      host === "guesty.com" ||
      host.endsWith(".guesty.com")
    );
  } catch {
    return false;
  }
}

/** Best-effort parse of undocumented Guesty iframe resize payloads. */
export function extractIframeHeight(data: unknown): number | null {
  if (typeof data === "number") return saneHeight(data);
  if (typeof data === "string") {
    const n = Number.parseInt(data, 10);
    return Number.isFinite(n) ? saneHeight(n) : null;
  }
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  for (const key of [
    "height",
    "iframeHeight",
    "documentHeight",
    "scrollHeight",
  ]) {
    const value = record[key];
    if (typeof value === "number") {
      const height = saneHeight(value);
      if (height) return height;
    }
  }

  if ("data" in record) return extractIframeHeight(record.data);
  return null;
}

function saneHeight(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 120 || rounded > 20_000) return null;
  return rounded;
}
