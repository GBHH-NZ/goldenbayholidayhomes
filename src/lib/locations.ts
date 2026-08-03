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
  pōhara: "Pohara",
  "pohara / pōhara": "Pohara",
  collingwood: "Collingwood",
  "east takaka": "East Takaka",
  "ligar bay": "Ligar Bay",
  onekaka: "Onekaka",
  parapara: "Parapara",
  "patons rock": "Patons Rock",
  "tata beach": "Tata Beach",
  "wainui bay": "Wainui Bay",
};

export function normalizeLocation(raw: string): Location | string {
  const key = raw.trim().toLowerCase();
  return LOCATION_ALIASES[key] ?? raw.trim();
}
