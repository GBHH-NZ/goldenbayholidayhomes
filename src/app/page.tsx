import Image from "next/image";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { GuestySearchWidget } from "@/components/GuestySearchWidget";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import { getSiteMedia } from "@/lib/content";
import { assetPath } from "@/lib/env";
import { getAllHomes, getHomeLocations } from "@/lib/homes";

export default function HomePage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();
  const site = getSiteMedia();

  return (
    <main>
      <section className="relative isolate min-h-[16rem] overflow-hidden h-[38svh] md:h-[42svh] md:min-h-[18rem]">
        <Image
          src={assetPath(site.heroImage)}
          alt={site.heroAlt}
          fill
          priority
          className="object-cover object-[50%_72%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/80 via-sea-deep/35 to-sea-deep/20" />
        <Header />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-8 pt-24 md:px-6 md:pb-10 md:pt-28">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 md:gap-5">
            <p className="animate-fade-up max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold text-foam md:text-4xl">
              Handpicked homes. Hotel comfort. Heartfelt hospitality.
            </p>
            <div id="book-online" className="animate-fade-up-delay w-full scroll-mt-24">
              <GuestySearchWidget />
            </div>
          </div>
        </div>
      </section>

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
    </main>
  );
}
