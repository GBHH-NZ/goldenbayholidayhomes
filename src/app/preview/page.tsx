import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/Header";
import { GuestyBookingSection } from "@/components/GuestyBookingSection";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import { getAllHomes, getHomeLocations } from "@/lib/homes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Booking features preview",
  description: "Internal preview of Guesty embeds and the local homes catalogue.",
  path: "/preview",
  noIndex: true,
});

export default function PreviewPage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();

  return (
    <>
      <SiteHeader />
      <main className="pb-20">
        <section className="border-b border-drift/60 bg-foam/40">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-sunset">
              Internal preview — not in the public menu
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
              Booking features
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Use this page to review the in-page Guesty search → iframe flow
              and the site homes grid. Search stays on this page and refines
              the booking catalogue below.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            1 — Hero search + Guesty iframe
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
            Book on this site
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Same flow as the homepage: dates, guests, and destination update
            the iframe in place. Needs{" "}
            <span className="font-medium text-ink">
              Settings → Site SSL → Allow site to be loaded in an iframe
            </span>{" "}
            in Guesty. If the frame is blank, that toggle is still off.
          </p>
          <div className="mt-6">
            <GuestyBookingSection
              id="preview-book-online"
              locations={locations}
              variant="preview"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            2 — Site catalogue
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
            Local homes grid
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Listings we control on this site. Cards link through to each home
            page; booking still goes to Guesty.
          </p>
          <div className="mt-8">
            <Suspense
              fallback={<div className="h-40 animate-pulse bg-foam/50" />}
            >
              <HomesCatalogue homes={homes} locations={locations} />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
