import type { Metadata } from "next";
import { SiteHeader } from "@/components/Header";
import { ExploreClient } from "@/components/ExploreClient";
import { getExplorePlaces } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Things to Do in Golden Bay",
  description:
    "Walks, beaches and local favourites near our holiday homes — Pupū Springs, Wharariki Beach, Tata kayaks, Hack Farm, and cafés in Takaka and Collingwood.",
  path: "/explore-golden-bay",
});

export default function ExplorePage() {
  const places = getExplorePlaces();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere]">
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
