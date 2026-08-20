import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { PropertyBooking } from "@/components/BookCta";
import { JsonLd } from "@/components/JsonLd";
import { getAllHomes, getHomeBySlug } from "@/lib/homes";
import {
  homeAmenities,
  homeDescription,
  homeMentionsSelfCheckIn,
  homePhotos,
  SETTING_LABEL,
} from "@/lib/homes/types";
import { CONTACT } from "@/lib/env";
import { locationPath, normalizeLocation } from "@/lib/locations";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  listingMetaDescription,
  listingPageTitle,
  vacationRentalJsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllHomes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const home = getHomeBySlug(slug);
  if (!home) return { title: "Home not found" };
  const photo = homePhotos(home)[0];
  return buildPageMetadata({
    title: listingPageTitle(home),
    description: listingMetaDescription(home),
    path: `/homes/${home.slug}`,
    images:
      photo && !photo.includes("placeholder")
        ? [{ url: photo, alt: `${home.title} in ${home.location}, Golden Bay` }]
        : undefined,
  });
}

function formatNightly(amount: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function goodToKnow(home: ReturnType<typeof getHomeBySlug>) {
  if (!home) return [];
  const notes: string[] = [];
  if (home.petsAllowed) {
    notes.push(
      "Pets are welcome — ideal if you are searching for a dog-friendly Golden Bay holiday home.",
    );
  }
  if (home.oceanView) {
    notes.push(
      "Ocean or bay views are part of the stay — morning coffee with water in sight.",
    );
  }
  if (home.spa) {
    notes.push(
      "A spa or hot tub is on site for soaking after beach and bush days.",
    );
  }
  if (home.setting === "beach") {
    notes.push(
      "Beach setting — built for sandy feet, swim kits, and easy coastal days.",
    );
  } else if (home.setting === "bush") {
    notes.push(
      "Bush setting — birdsong, regenerating bush, and a quieter night’s sleep.",
    );
  } else if (home.setting === "farm") {
    notes.push(
      "Farm setting — countryside space with Golden Bay beaches a short drive away.",
    );
  }
  if (home.walkMins != null) {
    notes.push(
      `About ${home.walkMins} minute${home.walkMins === 1 ? "" : "s"}’ walk to the beach when you want sand without starting the car.`,
    );
  }
  if (homeMentionsSelfCheckIn(home)) {
    notes.push("Self check-in, as described by the property listing.");
  }
  if (home.nightlyFrom != null && home.nightlyFrom > 0) {
    notes.push(
      `Booked direct from ${formatNightly(home.nightlyFrom)} a night, with our price-match promise.`,
    );
  }
  notes.push(
    `Hotel-quality linen and thoughtful touches come standard, and our Golden Bay team is on ${CONTACT.phoneFree} while you are here.`,
  );
  return notes;
}

export default async function HomeDetailPage({ params }: Props) {
  const { slug } = await params;
  const home = getHomeBySlug(slug);
  if (!home) notFound();

  const photos = homePhotos(home);
  const amenities = homeAmenities(home);
  const placePath = locationPath(home.location);
  const placeName = normalizeLocation(home.location);
  const notes = goodToKnow(home);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Holiday Homes", path: "/homes" },
    ...(placePath
      ? [{ name: String(placeName), path: placePath }]
      : []),
    { name: home.shortTitle || home.title, path: `/homes/${home.slug}` },
  ];

  return (
    <>
      <JsonLd data={vacationRentalJsonLd(home)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-sea">
              {placePath ? (
                <Link
                  href={placePath}
                  className="underline-offset-2 hover:underline"
                >
                  {home.location}
                </Link>
              ) : (
                home.location
              )}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep [overflow-wrap:anywhere] md:text-5xl">
              {home.title}
            </h1>
            <p className="mt-3 text-muted">
              Sleeps {home.guests}
              {home.setting ? ` · ${SETTING_LABEL[home.setting]}` : ""}
              {home.walkMins != null ? ` · ${home.walkMins} min walk` : ""}
              {home.oceanView ? " · Ocean view" : ""}
              {home.spa ? " · Spa" : ""}
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
              {home.syncStatus === "seed" && (
                <p className="mt-4 text-sm text-muted">
                  Full photos and amenities refresh when the Guesty catalogue is
                  synced (
                  <code>npm run sync:guesty-bookings</code>).
                </p>
              )}
            </div>

            {notes.length > 0 ? (
              <div className="mt-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
                  Good to know
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                  {notes.map((note) => (
                    <li key={note} className="border-l-2 border-sea/30 pl-3">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
                {home.amenities.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">
                    Drawn from this listing and the standards that apply to
                    every Golden Bay Holiday Homes stay. The full amenity list
                    sits on the booking engine.
                  </p>
                ) : null}
              </div>
            ) : null}

            {placePath ? (
              <div className="mt-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
                  Neighbourhood
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  This stay is in {placeName}, Golden Bay. See other holiday
                  homes, local FAQs, and what guests look for in this town.
                </p>
                <Link
                  href={placePath}
                  className="mt-4 inline-block text-sm font-semibold text-sea underline-offset-2 hover:underline"
                >
                  Holiday homes in {placeName}
                </Link>
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <PropertyBooking home={home} />
          </div>
        </div>
      </main>
    </>
  );
}
