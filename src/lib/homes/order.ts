/**
 * Editorial catalogue order. Lead homes appear first in this sequence;
 * remaining listings keep their incoming relative order.
 */
export const CATALOGUE_LEAD_SLUGS = [
  "the-lighthouse-at-ligar-bay-romantic-coastal-escape-with-spa",
  "vista-al-mar-pohara",
  "vista-serena-pohara",
  "beachfront-sea-esta-in-pohara",
  "the-gatehouse-tata-headlands",
  "tata-beach-heights-spectacular-ocean-and-bush-views",
  "poharas-bliss-by-the-sea",
  "poharas-beach-house-your-coastal-getaway",
  "golden-bay-heights-luxury-accommodation",
] as const;

export function sortHomesForCatalogue<T extends { slug: string }>(
  homes: T[],
): T[] {
  const bySlug = new Map(homes.map((home) => [home.slug, home]));
  const used = new Set<string>();
  const lead: T[] = [];

  for (const slug of CATALOGUE_LEAD_SLUGS) {
    const home = bySlug.get(slug);
    if (!home) continue;
    lead.push(home);
    used.add(slug);
  }

  const rest = homes.filter((home) => !used.has(home.slug));
  return [...lead, ...rest];
}
