import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { HomesCatalogue } from "@/components/HomesCatalogue";
import { getAllHomes, getHomeLocations } from "@/lib/homes";

export default function HomePage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();

  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/images/hero-beach.svg"
          alt="Golden Bay coastline at dusk"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/85 via-sea-deep/45 to-sea-deep/25" />
        <Header />
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-4 pb-20 pt-32 md:px-6 md:pb-28">
          <div className="mx-auto w-full max-w-6xl">
            <p className="animate-fade-up font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white drop-shadow md:text-6xl lg:text-7xl">
              Golden Bay Holiday Homes
            </p>
            <p className="animate-fade-up-delay mt-4 max-w-xl text-lg text-foam/95 md:text-xl">
              Handpicked homes. Hotel comfort. Heartfelt hospitality.
            </p>
            <div className="animate-fade-up-delay mt-8 flex flex-wrap gap-3">
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
