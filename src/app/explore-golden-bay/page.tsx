import type { Metadata } from "next";
import { SiteHeader } from "@/components/Header";
import { ExploreClient } from "@/components/ExploreClient";
import { getExplorePlaces } from "@/lib/content";

export const metadata: Metadata = {
  title: "Explore Golden Bay",
  description:
    "Beaches, walks, cafés, and rainy-day ideas across Golden Bay and Tasman.",
};

export default function ExplorePage() {
  const places = getExplorePlaces();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
          Explore Golden Bay
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Local favourites near our holiday homes — filter by mood and make the
          most of your stay.
        </p>
        <ExploreClient places={places} />
      </main>
    </>
  );
}
