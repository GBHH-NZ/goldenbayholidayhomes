import type { Metadata } from "next";
import { SiteHeader } from "@/components/Header";
import { PropertyGrid } from "@/components/PropertyCard";
import { getAllHomes } from "@/lib/homes";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Holiday Homes",
  description:
    "Browse hand-picked Golden Bay holiday homes — filter by location, pets, and capacity.",
  path: "/homes",
});

export default function HomesPage() {
  const homes = getAllHomes();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
          Holiday Homes
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {homes.length} homes across Golden Bay. Book direct for local support
          and our price-match promise.
        </p>
        <div className="mt-10">
          <PropertyGrid homes={homes} />
        </div>
      </main>
    </>
  );
}
