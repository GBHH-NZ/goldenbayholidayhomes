import type { Metadata } from "next";
import { SiteHeader } from "@/components/Header";
import { PreviewBookingStack } from "@/components/HomeBookingStack";
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
              and the site homes grid. Search or Book now opens the catalogue
              below without leaving this page.
            </p>
          </div>
        </section>

        <PreviewBookingStack homes={homes} locations={locations} />
      </main>
    </>
  );
}
