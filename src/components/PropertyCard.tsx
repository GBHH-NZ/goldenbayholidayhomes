import Link from "next/link";
import Image from "next/image";
import type { Home } from "@/lib/homes/types";
import { homePhotos } from "@/lib/homes/types";
import { clsx } from "clsx";

export function PropertyCard({ home }: { home: Home }) {
  const photo = homePhotos(home)[0];

  return (
    <Link
      href={`/homes/${home.slug}`}
      className="group block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-drift">
        <Image
          src={photo}
          alt={home.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {home.petsAllowed && (
          <span className="absolute bottom-3 left-3 bg-sea-deep/85 px-2 py-1 text-xs text-foam">
            Pets welcome
          </span>
        )}
        {home.syncStatus === "seed" && (
          <span className="absolute right-3 top-3 bg-sea-deep/70 px-2 py-1 text-xs text-foam">
            Details soon
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep transition group-hover:text-sea">
          {home.shortTitle || home.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {home.location} · Sleeps {home.guests}
        </p>
      </div>
    </Link>
  );
}

export function PropertyGrid({
  homes,
  className,
}: {
  homes: Home[];
  className?: string;
}) {
  if (homes.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        No homes match these filters.
      </p>
    );
  }

  return (
    <div
      className={clsx(
        "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {homes.map((h) => (
        <PropertyCard key={h.slug} home={h} />
      ))}
    </div>
  );
}
