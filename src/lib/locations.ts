/** Canonical Golden Bay location tags (Pohara / Pōhara merged). */
export const LOCATIONS = [
  "Collingwood",
  "East Takaka",
  "Ligar Bay",
  "Onekaka",
  "Parapara",
  "Patons Rock",
  "Pohara",
  "Tata Beach",
  "Wainui Bay",
] as const;

export type Location = (typeof LOCATIONS)[number];

const LOCATION_ALIASES: Record<string, Location> = {
  pohara: "Pohara",
  "pohara / pohara": "Pohara",
  collingwood: "Collingwood",
  "east takaka": "East Takaka",
  "ligar bay": "Ligar Bay",
  onekaka: "Onekaka",
  parapara: "Parapara",
  "patons rock": "Patons Rock",
  "tata beach": "Tata Beach",
  "wainui bay": "Wainui Bay",
};

/** Fold macrons so East Tākaka and East Takaka resolve to the same tag. */
export function foldLocationKey(raw: string): string {
  return raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeLocation(raw: string): Location | string {
  const key = foldLocationKey(raw);
  return LOCATION_ALIASES[key] ?? raw.trim();
}

/** Old Phase 2 cluster ids that are not town names. */
const LEGACY_CLUSTER_IDS = new Set([
  "pohara-ligar",
  "tata-patons",
  "east-takaka",
]);

export function catalogueLocationParam(
  value: string | null | undefined,
): string {
  if (!value) return "";
  if (LEGACY_CLUSTER_IDS.has(foldLocationKey(value))) return "";
  return value;
}
