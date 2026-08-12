import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { HomeBookingStack } from "@/components/HomeBookingStack";
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
      <section className="relative z-10 isolate min-h-[24rem] h-[54svh] md:h-[58svh] md:min-h-[28rem]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={assetPath(site.heroImage)}
            alt={site.heroAlt}
            fill
            priority
            className="object-cover object-[50%_72%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/80 via-sea-deep/35 to-sea-deep/20" />
        </div>
        <Header />
        <div className="relative z-10 flex h-full flex-col justify-center px-4 pb-24 pt-20 md:px-6 md:pb-28 md:pt-24">
          <div className="mx-auto flex w-full max-w-6xl -translate-y-10 flex-col items-start md:-translate-y-12">
            <p className="animate-fade-up w-full max-w-none whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(0.8125rem,3.4vw+0.35rem,2.25rem)] font-semibold tracking-tight text-foam md:tracking-normal">
              Handpicked homes. Hotel comfort. Heartfelt hospitality.
            </p>
          </div>
        </div>
      </section>

      <HomeBookingStack homes={homes} locations={locations} />
    </main>
  );
}
