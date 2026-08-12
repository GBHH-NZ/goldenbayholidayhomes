"use client";

import { Suspense } from "react";
import { GuestyBookingSection } from "@/components/GuestyBookingSection";
import { GuestyEmbedProvider } from "@/components/GuestyEmbedContext";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import type { Home } from "@/lib/homes/types";

export function HomeBookingStack({
  homes,
  locations,
}: {
  homes: Home[];
  locations: string[];
}) {
  return (
    <GuestyEmbedProvider resultsId="book-online-results">
      <GuestyBookingSection locations={locations} />
      <section id="homes" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-4xl">
              Stay in Golden Bay
            </h2>
            <p className="mt-3 text-muted">
              Beach baches and holiday homes across Pohara, Tata Beach,
              Collingwood and beyond — with local support when you need it.
            </p>
          </div>
          <div className="mt-10">
            <Suspense
              fallback={<div className="h-40 animate-pulse bg-foam/50" />}
            >
              <HomesCatalogue homes={homes} locations={locations} />
            </Suspense>
          </div>
        </div>
      </section>
    </GuestyEmbedProvider>
  );
}

export function PreviewBookingStack({
  homes,
  locations,
}: {
  homes: Home[];
  locations: string[];
}) {
  return (
    <GuestyEmbedProvider resultsId="preview-book-online-results">
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          1 — Hero search + Guesty iframe
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
          Book on this site
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Same flow as the homepage: the iframe stays hidden until you search
          or tap Book now on a listing. Needs{" "}
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
          page; Book now opens the Guesty iframe above.
        </p>
        <div className="mt-8">
          <Suspense
            fallback={<div className="h-40 animate-pulse bg-foam/50" />}
          >
            <HomesCatalogue homes={homes} locations={locations} />
          </Suspense>
        </div>
      </section>
    </GuestyEmbedProvider>
  );
}
