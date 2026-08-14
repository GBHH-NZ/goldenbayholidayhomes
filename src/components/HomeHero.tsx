import Image from "next/image";
import { Header } from "@/components/Header";
import { getSiteMedia } from "@/lib/content";
import { assetPath } from "@/lib/env";

export function HomeHero() {
  const site = getSiteMedia();

  return (
    <section className="hero-banner relative z-10 isolate min-h-[24rem] h-[54svh] md:h-[58svh] md:min-h-[28rem]">
      <div className="hero-stage absolute inset-0 overflow-hidden">
        <Image
          src={assetPath(site.heroImage)}
          alt={site.heroAlt}
          fill
          priority
          className="object-cover object-[50%_72%]"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-sea-deep/50 via-sea-deep/12 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sea-deep/32 to-transparent md:h-28"
          aria-hidden
        />
      </div>
      <Header />
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-28 pt-24 md:justify-center md:px-6 md:pb-28 md:pt-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start md:-translate-y-8">
          <h1 className="max-w-full font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw+0.5rem,3.5rem)] font-semibold leading-tight tracking-tight text-foam [overflow-wrap:anywhere] [text-shadow:0_1px_2px_rgba(12,44,58,0.45),0_4px_28px_rgba(12,44,58,0.55)]">
            {site.heroHeading}
          </h1>
          <p className="mt-3 max-w-full text-sm leading-relaxed text-foam/95 sm:max-w-xl md:text-lg [text-shadow:0_1px_2px_rgba(12,44,58,0.4),0_4px_20px_rgba(12,44,58,0.5)]">
            {site.heroLine}
          </p>
        </div>
      </div>
    </section>
  );
}
