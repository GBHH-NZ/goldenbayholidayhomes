import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { BookCta } from "@/components/BookCta";
import { JsonLd } from "@/components/JsonLd";
import { getAllHomes, getHomeBySlug } from "@/lib/homes";
import {
  homeAmenities,
  homeDescription,
  homePhotos,
} from "@/lib/homes/types";
import { vacationRentalJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllHomes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const home = getHomeBySlug(slug);
  if (!home) return { title: "Home not found" };
  const description = homeDescription(home).slice(0, 160);
  return {
    title: home.title,
    description,
    openGraph: {
      images: homePhotos(home)[0]
        ? [{ url: homePhotos(home)[0] }]
        : undefined,
    },
  };
}

export default async function HomeDetailPage({ params }: Props) {
  const { slug } = await params;
  const home = getHomeBySlug(slug);
  if (!home) notFound();

  const photos = homePhotos(home);
  const amenities = homeAmenities(home);

  return (
    <>
      <JsonLd data={vacationRentalJsonLd(home)} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-sea">
              {home.location}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-5xl">
              {home.title}
            </h1>
            <p className="mt-3 text-muted">
              Sleeps {home.guests}
              {home.petsAllowed ? " · Pets welcome" : ""}
              {home.bedrooms ? ` · ${home.bedrooms} bedrooms` : ""}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {photos.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className={`relative overflow-hidden bg-drift ${
                    i === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${home.title} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            <div className="prose-gb mt-10">
              <p>{homeDescription(home)}</p>
              {home.syncStatus !== "synced" && (
                <p className="mt-4 text-sm text-muted">
                  Photos, full description, and amenities are placeholders until
                  Guesty catalogue sync (
                  <code>npm run sync:guesty</code>).
                </p>
              )}
            </div>

            {amenities.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
                  Amenities
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <li
                      key={a}
                      className="bg-foam px-3 py-1.5 text-sm text-sea-deep"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-10 rounded-sm border border-dashed border-drift bg-foam/40 p-5">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
                  Amenities
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Amenity list placeholder — will be filled from Guesty when API
                  keys are configured.
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <BookCta home={home} />
          </div>
        </div>
      </main>
    </>
  );
}
