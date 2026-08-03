/**
 * One-off generator — run with: node scripts/generate-homes-seed.mjs
 */
import { writeFileSync } from "fs";

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeLocation(raw) {
  const key = raw.trim().toLowerCase();
  if (key === "pohara" || key === "pōhara") return "Pohara";
  return raw.trim();
}

const SEED = [
  { title: "Sea-Esta at Pohara Beach", shortTitle: "Sea-Esta", guests: 4, location: "Pohara" },
  { title: "Pohara's Vista al-Mar", shortTitle: "Pohara's Vista al-Mar", guests: 6, location: "Pohara" },
  { title: "Pohara's Vista Serena", shortTitle: "Pohara's Vista Serena", guests: 4, location: "Pohara" },
  { title: "Piwakawaka Haven - Pohara Beach", shortTitle: "Piwakawaka Haven", guests: 6, location: "Pohara" },
  { title: "The Gatehouse - Tata Headlands", shortTitle: "The Gatehouse", guests: 7, location: "Wainui Bay" },
  { title: "Pōhara's Beach House", shortTitle: "Pōhara Beach House", guests: 2, location: "Pohara", guestyId: "65995389572da800132299bf" },
  { title: "Pōhara's Bliss by the Sea", shortTitle: "Bliss by the Sea", guests: 11, location: "Pohara", petsAllowed: true },
  { title: "Tata Beach Heights - Spectacular Ocean and Bush Views", shortTitle: "Tata Beach Heights", guests: 6, location: "Tata Beach" },
  { title: "Pōhara's Kōtare Heights", shortTitle: "Pōhara's Kōtare Heights", guests: 9, location: "Pohara", petsAllowed: true },
  { title: "Pōhara's Beach Escape", shortTitle: "Pōhara's Beach Escape", guests: 8, location: "Pohara", petsAllowed: true },
  { title: "Pōhara's Beach Escape - Tūi Studio", shortTitle: "Tūi Studio", guests: 2, location: "Pohara", petsAllowed: true },
  { title: "Pōhara's Beach Escape - Pūkeko Studio", shortTitle: "Pūkeko Studio", guests: 2, location: "Pohara", petsAllowed: true },
  { title: "Ocean Views Across the Beach", shortTitle: "Ocean Views", guests: 10, location: "Collingwood" },
  { title: "Modern Tata Beach Escape - Spacious New Retreat", shortTitle: "Tata Beach Escape", guests: 8, location: "Tata Beach" },
  { title: "Pōhara's Beachside Gem", shortTitle: "Beachside Gem", guests: 2, location: "Pohara" },
  { title: "Pōhara's Seaside Chalet - Cosy Beach Stay", shortTitle: "Seaside Chalet", guests: 4, location: "Pohara", petsAllowed: true },
  { title: "Modern Comfort - Brand New Holiday Home", shortTitle: "Modern Comfort", guests: 6, location: "Collingwood" },
  { title: "Pōhara Tide - Beach Getaway", shortTitle: "Pōhara Tide", guests: 8, location: "Pohara", petsAllowed: true },
  { title: "Coastal Getaway", shortTitle: "Coastal Getaway", guests: 4, location: "Tata Beach" },
  { title: "Coastal Charm - Ocean views in Patons Rock", shortTitle: "Coastal Charm", guests: 7, location: "Patons Rock" },
  { title: "Patons Rock Latitude - Modern Getaway", shortTitle: "Patons Latitude", guests: 7, location: "Patons Rock" },
  { title: "Pōhara Escape", shortTitle: "Pōhara Escape", guests: 6, location: "Pohara" },
  { title: "The Woolshed Estate", shortTitle: "The Woolshed Estate", guests: 9, location: "Tata Beach" },
  { title: "Golden Bay Heights - Luxury Accommodation", shortTitle: "Golden Bay Heights", guests: 4, location: "Parapara", petsAllowed: true },
  { title: "Pōhara's Kauri Lodge - Coastal Views", shortTitle: "Kauri Lodge", guests: 6, location: "Pohara" },
  { title: "Seaview Escape", shortTitle: "Seaview Escape", guests: 6, location: "Patons Rock", petsAllowed: true },
  { title: "Pōhara Sands - Family Beachfront House", shortTitle: "Beachfront House", guests: 8, location: "Pohara" },
  { title: "Coastal Retreat - Modern and Relaxing Stay", shortTitle: "Pōhara Coastal Retreat", guests: 5, location: "Pohara" },
  { title: "Spacious Family Home", shortTitle: "Spacious Family Home", guests: 6, location: "Collingwood" },
  { title: "The Old Bakery - Waterfront Retreat", shortTitle: "Waterfront Retreat", guests: 7, location: "Collingwood", petsAllowed: true },
  { title: "By the Sea Shaw - Over the Ocean", shortTitle: "By the Sea Shaw", guests: 8, location: "Parapara" },
  { title: "WaveSong Cottage - Your Escape by the Sea", shortTitle: "WaveSong Cottage", guests: 6, location: "Parapara", petsAllowed: true },
  { title: "Mātai Grove - Tranquil Bush Studio Retreat", shortTitle: "Mātai Grove", guests: 2, location: "Onekaka" },
  { title: "Estuary View", shortTitle: "Estuary View", guests: 2, location: "Onekaka" },
  { title: "Tōtara Glen - Bucolic Retreat in Peaceful Countryside", shortTitle: "Tōtara Glen", guests: 10, location: "East Takaka" },
  { title: "Motel Style Unit", shortTitle: "Motel Style Unit", guests: 2, location: "Collingwood" },
  { title: "Langley Lodge - Overlooking Parapara", shortTitle: "Langley Lodge", guests: 8, location: "Parapara", petsAllowed: true },
  { title: "Penguin Cottage - Nestled away in Ligar Bay", shortTitle: "Penguin Cottage", guests: 6, location: "Ligar Bay" },
  { title: "Kākāriki Bach - Family Haven", shortTitle: "KākārikiBach", guests: 8, location: "Patons Rock" },
];

const homes = SEED.map((row) => {
  const location = normalizeLocation(row.location);
  const guestyId = row.guestyId || null;
  return {
    slug: slugify(row.title),
    title: row.title,
    shortTitle: row.shortTitle || null,
    location,
    guests: row.guests,
    petsAllowed: Boolean(row.petsAllowed),
    guestyId,
    guestyUrl: guestyId
      ? `https://goldenbayholidayhomes.guestybookings.com/en/properties/${guestyId}`
      : null,
    photos: [],
    description: null,
    amenities: [],
    bedrooms: null,
    bathrooms: null,
    address: null,
    syncStatus: "seed",
  };
});

writeFileSync("content/homes.json", JSON.stringify(homes, null, 2) + "\n");
console.log(`Wrote ${homes.length} homes to content/homes.json`);
