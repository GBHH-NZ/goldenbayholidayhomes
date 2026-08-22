import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingEmbedPanel } from "@/components/BookingEmbedPanel";
import { SiteHeader } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import {
  getExplorePlace,
  getExplorePlaces,
  type ExplorePlace,
} from "@/lib/content";
import { assetPath } from "@/lib/env";
import { normalizeLocation } from "@/lib/locations";
import {
  absoluteAssetUrl,
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  notFoundMetadata,
} from "@/lib/seo";
import { slugify } from "@/lib/slugify";

type Props = { params: Promise<{ slug: string }> };

const HOLIDAY_HOME_LOCATION_SLUGS = new Set([
  "pohara",
  "collingwood",
  "tata-beach",
  "patons-rock",
  "ligar-bay",
  "parapara",
  "onekaka",
  "east-takaka",
]);

function holidayHomesLocation(location: string) {
  const normalized = normalizeLocation(location);
  const pageLocation = normalized === "Takaka" ? "East Takaka" : normalized;
  const slug = slugify(pageLocation);

  if (!HOLIDAY_HOME_LOCATION_SLUGS.has(slug)) return null;

  return {
    slug,
    linkLabel:
      normalized === "Takaka"
        ? "Browse holiday homes near Takaka"
        : `Browse holiday homes in ${normalized}`,
  };
}

function placeJsonLd(place: ExplorePlace) {
  const path = `/explore-golden-bay/${place.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${absoluteUrl(path)}#place`,
    name: place.name,
    description: [place.summary, place.detail].filter(Boolean).join(" "),
    url: absoluteUrl(path),
    image: absoluteAssetUrl(place.image),
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Golden Bay, Tasman, New Zealand",
    },
    sameAs: place.url,
  };
}

export function generateStaticParams() {
  return getExplorePlaces().map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = getExplorePlace(slug);
  if (!place) return { ...notFoundMetadata, title: "Place not found" };

  const placeLabel =
    place.location && !place.name.toLowerCase().includes(place.location.toLowerCase())
      ? `${place.name} in ${place.location}`
      : place.name;

  return buildPageMetadata({
    title: placeLabel,
    description: [place.summary, place.detail].filter(Boolean).join(" "),
    path: `/explore-golden-bay/${place.slug}`,
    images: [
      {
        url: place.image,
        alt: `${place.name} in ${place.location}, Golden Bay`,
      },
    ],
  });
}

export default async function ExplorePlacePage({ params }: Props) {
  const { slug } = await params;
  const place = getExplorePlace(slug);
  if (!place) notFound();

  const stayLocation = holidayHomesLocation(place.location);

  return (
    <>
      <JsonLd data={placeJsonLd(place)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore Golden Bay", path: "/explore-golden-bay" },
          {
            name: place.name,
            path: `/explore-golden-bay/${place.slug}`,
          },
        ])}
      />
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <Link
          href="/explore-golden-bay/"
          className="text-sm font-medium text-sea underline-offset-2 hover:underline"
        >
          ← Back to Explore Golden Bay
        </Link>

        <article className="mt-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-drift">
            <Image
              src={assetPath(place.image)}
              alt={`${place.name} in ${place.location}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-sea">
              {place.category} · {place.location}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere] md:text-5xl">
              {place.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {place.summary}
            </p>
            {place.detail ? (
              <p className="mt-5 leading-7 text-ink">{place.detail}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {place.url ? (
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-md border border-sea px-4 py-2.5 text-sm font-semibold text-sea transition hover:bg-foam"
                >
                  Visit website →
                </a>
              ) : null}
              {stayLocation ? (
                <Link
                  href={`/holiday-homes/${stayLocation.slug}/`}
                  className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep"
                >
                  {stayLocation.linkLabel} →
                </Link>
              ) : null}
            </div>
          </div>

          {place.bookUrl ? (
            <section className="mt-10 overflow-hidden rounded-md border border-drift/70 bg-sand">
              <BookingEmbedPanel
                src={place.bookUrl}
                title={`${place.name} booking`}
                heading={place.bookLabel ?? "Book now"}
              />
            </section>
          ) : null}
        </article>
      </main>
    </>
  );
}
