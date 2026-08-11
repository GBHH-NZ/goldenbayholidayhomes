import Link from "next/link";
import Image from "next/image";
import type { Home } from "@/lib/homes/types";
import { bookingUrl, homePhotos } from "@/lib/homes/types";
import { clsx } from "clsx";

function formatNightly(amount: number | null | undefined): string | null {
  if (amount == null || Number.isNaN(amount)) return null;
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function metaBits(home: Home): string[] {
  const bits: string[] = [];
  if (home.propertyType) bits.push(home.propertyType);
  bits.push(`${home.guests} guest${home.guests === 1 ? "" : "s"}`);
  if (home.bedrooms != null) {
    bits.push(
      `${home.bedrooms} bedroom${home.bedrooms === 1 ? "" : "s"}`,
    );
  }
  if (home.bathrooms != null) {
    bits.push(
      `${home.bathrooms} bathroom${home.bathrooms === 1 ? "" : "s"}`,
    );
  }
  return bits;
}

export function PropertyCard({ home }: { home: Home }) {
  const photo = homePhotos(home)[0];
  const bookHref = bookingUrl(home);
  const nightly = formatNightly(home.nightlyFrom);
  const blurb = home.description?.trim() || null;
  const meta = metaBits(home);

  return (
    <article className="border-b border-drift py-8 first:pt-0 last:border-b-0">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <Link
          href={`/homes/${home.slug}`}
          className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-drift focus:outline-none focus-visible:ring-2 focus-visible:ring-sea md:aspect-auto md:h-44 md:w-64 lg:h-52 lg:w-72"
        >
          <Image
            src={photo}
            alt={home.title}
            fill
            className="object-cover transition duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 288px"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep md:text-2xl">
                <Link
                  href={`/homes/${home.slug}`}
                  className="transition hover:text-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                >
                  {home.shortTitle || home.title}
                </Link>
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {home.petsAllowed && (
                  <span className="bg-sea-deep/90 px-2 py-0.5 text-xs text-foam">
                    Pets welcome
                  </span>
                )}
                <span>{home.location}</span>
              </div>
            </div>

            {home.reviewScore != null && home.reviewCount != null && home.reviewCount > 0 && (
              <p className="shrink-0 text-sm text-sea-deep">
                <span className="font-semibold">{home.reviewScore.toFixed(1)}</span>
                <span className="text-muted">
                  {" "}
                  · {home.reviewCount} review{home.reviewCount === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </div>

          {blurb && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted md:line-clamp-3">
              {blurb}
            </p>
          )}

          {meta.length > 0 && (
            <p className="mt-3 text-sm text-sea-deep/80">
              {meta.join(" · ")}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
            <div>
              {nightly ? (
                <p className="text-sea-deep">
                  <span className="text-sm text-muted">From </span>
                  <span className="text-lg font-semibold">{nightly}</span>
                  <span className="text-sm text-muted"> / night</span>
                </p>
              ) : (
                <p className="text-sm text-muted">Rates on booking engine</p>
              )}
            </div>
            <a
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep"
            >
              Book now
            </a>
          </div>
        </div>
      </div>
    </article>
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
    <div className={clsx("flex flex-col", className)}>
      {homes.map((h) => (
        <PropertyCard key={h.slug} home={h} />
      ))}
    </div>
  );
}
