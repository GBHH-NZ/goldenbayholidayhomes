import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { GuestyPropertiesEmbed } from "@/components/GuestyPropertiesEmbed";
import { GuestySearchWidget } from "@/components/GuestySearchWidget";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import { getSiteMedia } from "@/lib/content";
import { assetPath } from "@/lib/env";
import { getAllHomes, getHomeLocations } from "@/lib/homes";
import { buildPageMetadata } from "@/lib/seo";

const HOME_TITLE =
  "Golden Bay Accommodation & Holiday Homes | goldenbayholidayhomes.com";
const HOME_DESCRIPTION =
  "Hand-picked Golden Bay accommodation — beach baches and holiday homes with hotel-quality linen and local support from Michael & Katja.";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: HOME_TITLE },
};

export default function HomePage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();
  const site = getSiteMedia();

  return (
    <main>
      <section className="relative isolate min-h-[22rem] overflow-hidden h-[50svh] md:h-[54svh] md:min-h-[26rem]">
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
        <div className="relative z-10 flex h-full flex-col justify-center px-4 pb-8 pt-20 md:px-6 md:pb-12 md:pt-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 md:gap-5">
            <p className="animate-fade-up w-full max-w-none whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(0.8125rem,3.4vw+0.35rem,2.25rem)] font-semibold tracking-tight text-foam md:tracking-normal">
              Handpicked homes. Hotel comfort. Heartfelt hospitality.
            </p>
            <div className="animate-fade-up-delay w-full">
              <GuestySearchWidget />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
            Book online
          </h2>
          <div className="mt-4">
            <GuestyPropertiesEmbed />
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
