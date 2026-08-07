"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ExplorePlace } from "@/lib/content";
import { assetPath } from "@/lib/env";

const CATEGORIES = [
  "All",
  "Outdoor Adventures",
  "Family-Friendly and Relaxed",
  "Cafes & Restaurants",
  "Rainy Day Activities",
] as const;

function PlaceCard({ place }: { place: ExplorePlace }) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-drift">
        <Image
          src={assetPath(place.image)}
          alt={place.name}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-sea">
        {place.category} · {place.location}
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
        {place.name}
      </h2>
      <p className="mt-2 text-sm text-muted">{place.summary}</p>
      {place.url ? (
        <p className="mt-2 text-sm font-medium text-sea">Visit website →</p>
      ) : null}
    </>
  );

  if (place.url) {
    return (
      <a
        href={place.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {body}
      </a>
    );
  }

  return <article>{body}</article>;
}

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
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 text-sm transition ${
              category === c
                ? "bg-sea text-white"
                : "bg-foam text-sea-deep hover:bg-drift/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => (
          <PlaceCard key={place.slug} place={place} />
        ))}
      </div>
    </>
  );
}
