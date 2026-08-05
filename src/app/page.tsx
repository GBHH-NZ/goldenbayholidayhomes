import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BrandMark, Header } from "@/components/Header";
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
      <section className="relative isolate min-h-[32rem] overflow-hidden h-[72svh] md:h-[82svh] lg:h-[min(92svh,56rem)]">
        <Image
          src={assetPath(site.heroImage)}
          alt={site.heroAlt}
          fill
          priority
          className="object-cover object-[50%_55%] sm:object-[50%_60%] md:object-[50%_68%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/80 via-sea-deep/35 to-sea-deep/20" />
        <Header />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-14 pt-28 md:px-6 md:pb-20 md:pt-32">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 md:gap-6">
            <div className="animate-fade-up">
              <BrandMark size="hero" variant="light" />
            </div>
            <p className="animate-fade-up-delay max-w-xl text-lg text-foam/95 md:text-xl">
              Handpicked homes. Hotel comfort. Heartfelt hospitality.
            </p>
            <div className="animate-fade-up-delay flex flex-wrap gap-3">
              <Link
                href="#homes"
                className="bg-white px-5 py-3 text-sm font-semibold text-sea-deep transition hover:bg-foam"
              >
                Browse homes
              </Link>
              <Link
                href="/list-your-home"
                className="border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                List your home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="homes"
        className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24"
      >
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-4xl">
            Stay in Golden Bay
          </h2>
          <p className="mt-3 text-muted">
            Beach baches and holiday homes across Pohara, Tata Beach,
            Collingwood and beyond — with local support when you need it.
          </p>
        </div>
        <div className="mt-8">
          <Suspense fallback={<div className="h-40 animate-pulse bg-foam/50" />}>
            <HomesCatalogue homes={homes} locations={locations} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
