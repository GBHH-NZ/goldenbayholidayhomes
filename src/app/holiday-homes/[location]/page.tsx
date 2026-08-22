import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { PropertyGrid } from "@/components/PropertyCard";
import { getExplorePlaces } from "@/lib/content";
import {
  getLocationPage,
  getLocationPages,
  getNearbyLocationPages,
  locationBodyParagraphs,
  type LocationPageWithHomes,
} from "@/lib/location-pages";
import { homePhotos } from "@/lib/homes/types";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
  homesItemListJsonLd,
  notFoundMetadata,
} from "@/lib/seo";

type Props = { params: Promise<{ location: string }> };

export function generateStaticParams() {
  return getLocationPages().map((page) => ({ location: page.slug }));
}

function pagePath(page: { slug: string }): string {
  return `/holiday-homes/${page.slug}`;
}

function fallbackDescription(page: LocationPageWithHomes): string {
  const petFriendly = page.homes.filter((home) => home.petsAllowed).length;
  const pets = petFriendly > 0 ? ` ${petFriendly} take dogs.` : "";
  return `${page.homeCount} holiday ${
    page.homeCount === 1 ? "home" : "homes"
  } in ${page.name}, Golden Bay.${pets} Book direct with local owners and our 0800 support line.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const page = getLocationPage(location);
  if (!page) return { ...notFoundMetadata, title: "Location not found" };

  const photo = page.homes.flatMap((home) => homePhotos(home)).find(
    (src) => src && !src.includes("placeholder"),
  );

  return buildPageMetadata({
    title: page.seoTitle ?? page.headline,
    description: page.metaDescription ?? fallbackDescription(page),
    path: pagePath(page),
    images: photo
      ? [
          {
            url: photo,
            alt: `Holiday homes in ${page.name}, Golden Bay`,
          },
        ]
      : undefined,
  });
}

function placeJsonLd(page: LocationPageWithHomes) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${page.name}, Golden Bay`,
    description: page.intro,
    url: absoluteUrl(pagePath(page)),
    geo: {
      "@type": "GeoCoordinates",
      latitude: page.geo.latitude,
      longitude: page.geo.longitude,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: page.name,
      addressRegion: "Tasman",
      addressCountry: "NZ",
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Golden Bay, Tasman, New Zealand",
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  const page = getLocationPage(location);
  if (!page) notFound();

  const paragraphs = locationBodyParagraphs(page);
  const nearby = getNearbyLocationPages(page);
  const exploreNearby = page.exploreNearby.length
    ? getExplorePlaces().filter((place) =>
        page.exploreNearby.includes(place.slug),
      )
    : [];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Holiday Homes", path: "/homes" },
          { name: page.name, path: pagePath(page) },
        ])}
      />
      <JsonLd data={placeJsonLd(page)} />
      <JsonLd
        data={homesItemListJsonLd(
          page.homes,
          `Holiday homes in ${page.name}, Golden Bay`,
        )}
      />
      {page.faqs.length > 0 ? <JsonLd data={faqPageJsonLd(page.faqs)} /> : null}
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-sea">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/homes/" className="hover:text-sea">
                Holiday Homes
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-sea-deep">{page.name}</li>
          </ol>
        </nav>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere]">
          {page.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/90">{page.intro}</p>
        <p className="mt-3 text-sm text-muted">
          {page.homeCount} {page.homeCount === 1 ? "home" : "homes"} in{" "}
          {page.name} · Golden Bay, Tasman
        </p>

        {page.highlights.length > 0 ? (
          <ul className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
            {page.highlights.map((item) => (
              <li key={item} className="flex gap-3 text-ink/90">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-sea" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <section className="mt-14" aria-labelledby="homes-heading">
          <h2
            id="homes-heading"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
          >
            {page.homeCount === 1
              ? `Our home in ${page.name}`
              : `Our ${page.homeCount} homes in ${page.name}`}
          </h2>
          <div className="mt-6">
            <PropertyGrid homes={page.homes} />
          </div>
          <p className="mt-6 text-sm text-muted">
            Looking wider?{" "}
            <Link
              href="/homes/"
              className="text-sea underline underline-offset-2"
            >
              Browse every Golden Bay holiday home
            </Link>{" "}
            and filter by pets, ocean views, spa or how many you sleep.
          </p>
        </section>

        {paragraphs.length > 0 ? (
          <section className="mt-14" aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
            >
              Staying in {page.name}
            </h2>
            <div className="prose-gb mt-4">
              {paragraphs.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </section>
        ) : null}

        {exploreNearby.length > 0 ? (
          <section className="mt-14" aria-labelledby="explore-heading">
            <h2
              id="explore-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
            >
              Near {page.name}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {exploreNearby.map((place) => (
                <li key={place.slug} className="text-ink/90">
                  <Link
                    href={`/explore-golden-bay/${place.slug}/`}
                    className="font-medium text-sea underline underline-offset-2"
                  >
                    {place.name}
                  </Link>
                  <span className="text-muted"> — {place.summary}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              More walks, beaches and cafés on{" "}
              <Link
                href="/explore-golden-bay/"
                className="text-sea underline underline-offset-2"
              >
                Explore Golden Bay
              </Link>
              .
            </p>
          </section>
        ) : null}

        {page.faqs.length > 0 ? (
          <section className="mt-14" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
            >
              {page.name} questions guests ask
            </h2>
            <dl className="mt-6 max-w-3xl space-y-6">
              {page.faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="font-semibold text-sea-deep">{faq.q}</dt>
                  <dd className="mt-2 text-ink/90">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {nearby.length > 0 ? (
          <section className="mt-14" aria-labelledby="nearby-heading">
            <h2
              id="nearby-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
            >
              Other places to stay in Golden Bay
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nearby.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`${pagePath(other)}/`}
                    className="inline-flex min-h-11 items-center bg-foam px-3 py-2 text-sm text-sea-deep transition hover:bg-drift/40"
                  >
                    {other.name}
                    <span className="ml-2 text-muted">
                      {other.homeCount}{" "}
                      {other.homeCount === 1 ? "home" : "homes"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
