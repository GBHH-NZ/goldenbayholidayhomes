import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { PropertyGrid } from "@/components/PropertyCard";
import { getExplorePlaces } from "@/lib/content";
import { getAllHomes } from "@/lib/homes";
import {
  getActiveLocationPages,
  getLocationPage,
} from "@/lib/location-pages";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
  homesItemListJsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ location: string }> };

export function generateStaticParams() {
  return getActiveLocationPages().map((page) => ({ location: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const page = getLocationPage(location);
  if (!page) return { title: "Location not found" };

  const homes = getAllHomes({ location: page.name });
  const count = homes.length;
  const description = `${page.intro} Browse ${count} holiday home${count === 1 ? "" : "s"} in ${page.name}, Golden Bay — book direct with local support.`;

  return buildPageMetadata({
    title: `${page.headline} | Golden Bay NZ`,
    description,
    path: `/holiday-homes/${page.slug}`,
  });
}

export default async function LocationHolidayHomesPage({ params }: Props) {
  const { location } = await params;
  const page = getLocationPage(location);
  if (!page) notFound();

  const homes = getAllHomes({ location: page.name });
  if (homes.length === 0) notFound();

  const explore = getExplorePlaces().filter((place) =>
    page.exploreNearby?.includes(place.slug),
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${absoluteUrl(`/holiday-homes/${page.slug}`)}#place`,
    name: page.name,
    description: page.intro,
    url: absoluteUrl(`/holiday-homes/${page.slug}`),
    geo: {
      "@type": "GeoCoordinates",
      latitude: page.geo.latitude,
      longitude: page.geo.longitude,
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Golden Bay, Tasman, New Zealand",
    },
  };

  const bodyParagraphs = page.body
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      <JsonLd data={placeJsonLd} />
      <JsonLd
        data={{
          ...homesItemListJsonLd(homes),
          name: `Holiday homes in ${page.name}, Golden Bay`,
        }}
      />
      <JsonLd data={faqPageJsonLd(page.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Holiday Homes", path: "/homes" },
          {
            name: page.name,
            path: `/holiday-homes/${page.slug}`,
          },
        ])}
      />
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-sea">
          Golden Bay · Tasman
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere] md:text-5xl">
          {page.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">{page.intro}</p>

        <div className="prose-gb mt-8 max-w-3xl">
          {bodyParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="border-l-2 border-sea/40 pl-3 text-sm text-sea-deep"
            >
              {item}
            </li>
          ))}
        </ul>

        <section className="mt-14" aria-labelledby="homes-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="homes-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep md:text-3xl"
            >
              {homes.length} holiday home{homes.length === 1 ? "" : "s"} in{" "}
              {page.name}
            </h2>
            <Link
              href={`/homes?location=${encodeURIComponent(page.name)}`}
              className="text-sm font-semibold text-sea underline-offset-2 hover:underline"
            >
              Open in full catalogue
            </Link>
          </div>
          <div className="mt-8">
            <PropertyGrid homes={homes} />
          </div>
        </section>

        {explore.length > 0 ? (
          <section className="mt-16" aria-labelledby="nearby-heading">
            <h2
              id="nearby-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
            >
              Nearby in Golden Bay
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {explore.map((place) => (
                <li key={place.slug}>
                  <Link
                    href={`/explore-golden-bay/${place.slug}/`}
                    className="font-medium text-sea underline-offset-2 hover:underline"
                  >
                    {place.name}
                  </Link>
                  <span className="text-muted"> — {place.summary}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/explore-golden-bay/"
                className="text-sm font-semibold text-sea underline-offset-2 hover:underline"
              >
                Explore more of Golden Bay
              </Link>
            </p>
          </section>
        ) : null}

        <section className="mt-16" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
          >
            {page.name} stay FAQs
          </h2>
          <div className="mt-6 space-y-5">
            {page.faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-sea-deep">{faq.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
