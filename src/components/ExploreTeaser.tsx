import Link from "next/link";
import { ExplorePlaceCard } from "@/components/ExplorePlaceCard";
import type { ExplorePlace } from "@/lib/content";

export const EXPLORE_TEASER_SLUGS = [
  "te-waikoropupu-springs",
  "wharariki-beach-walk",
  "horse-treks-hack-n-stay",
  "golden-bay-kayaks",
] as const;

export function ExploreTeaser({ places }: { places: ExplorePlace[] }) {
  if (places.length === 0) return null;

  return (
    <section aria-labelledby="explore-teaser-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="explore-teaser-heading"
              className="font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-4xl"
            >
              Explore Golden Bay
            </h2>
            <p className="mt-3 text-muted">
              Pupū Springs, Wharariki Beach, Patons Rock horse rides, and Tata
              kayaks — local favourites near our homes.
            </p>
          </div>
          <Link
            href="/explore-golden-bay"
            className="shrink-0 text-sm font-semibold text-sea underline-offset-2 hover:underline"
          >
            See all places
          </Link>
        </div>
        <div className="mt-10 flex flex-col gap-6">
          {places.map((place) => (
            <ExplorePlaceCard
              key={place.slug}
              place={place}
              href={place.bookUrl ? undefined : "/explore-golden-bay"}
              heading="h3"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
