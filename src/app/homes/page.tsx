import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/Header";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import { LocationDirectory } from "@/components/LocationDirectory";
import { getAllHomes, getHomeLocations } from "@/lib/homes";
import { buildPageMetadata } from "@/lib/seo";

const HOME_COUNT = getAllHomes().length;

export const metadata: Metadata = buildPageMetadata({
  title: "Browse Holiday Homes in Pohara, Collingwood & Tata Beach",
  description: `Browse ${HOME_COUNT} holiday homes across Pohara, Tata Beach, Collingwood, Patons Rock and near Takaka. Filter by town, pets, ocean views, spa, and how many you sleep.`,
  path: "/homes",
});

export default function HomesPage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere]">
          Holiday Homes
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {homes.length} homes across Golden Bay. Book direct for local support
          and our price-match promise.
        </p>
        <LocationDirectory className="mt-8" />
        <div className="mt-10">
          <Suspense
            fallback={<div className="h-40 animate-pulse bg-foam/50" />}
          >
            <HomesCatalogue homes={homes} locations={locations} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
