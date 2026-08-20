"use client";

import { useMemo, useState } from "react";
import { ExplorePlaceCard } from "@/components/ExplorePlaceCard";
import type { ExplorePlace } from "@/lib/content";

const CATEGORIES = [
  "All",
  "Outdoor Adventures",
  "Family-Friendly and Relaxed",
  "Cafes & Restaurants",
  "Rainy Day Activities",
] as const;

export function ExploreClient({ places }: { places: ExplorePlace[] }) {
  const [category, setCategory] = useState<string>("All");
  const filtered = useMemo(
    () =>
      category === "All"
        ? places
        : places.filter((p) => p.category === category),
    [places, category],
  );

  return (
    <>
      <div
        role="group"
        aria-label="Place categories"
        className="mt-8 flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 whitespace-nowrap max-w-full min-h-11 px-3 py-2 text-sm transition ${
              category === c
                ? "bg-sea text-white"
                : "bg-foam text-sea-deep hover:bg-drift/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-6">
        {filtered.map((place) => (
          <ExplorePlaceCard
            key={place.slug}
            place={place}
            href={`/explore-golden-bay/${place.slug}/`}
          />
        ))}
      </div>
    </>
  );
}
