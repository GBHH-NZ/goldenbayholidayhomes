import type { Metadata } from "next";
import Image from "next/image";
import { ExploreTeaser, EXPLORE_TEASER_SLUGS } from "@/components/ExploreTeaser";
import { Header } from "@/components/Header";
import { HomeBookingStack } from "@/components/HomeBookingStack";
import { JsonLd } from "@/components/JsonLd";
import { ReviewsBand } from "@/components/ReviewsBand";
import { StayRituals } from "@/components/StayRituals";
import { getExplorePlaces, getSiteMedia } from "@/lib/content";
import { assetPath } from "@/lib/env";
import { getAllHomes, getHomeLocations, getHomesReviewAggregate } from "@/lib/homes";
import { buildPageMetadata, homesItemListJsonLd } from "@/lib/seo";

const HOME_TITLE =
  "Holiday Homes in Golden Bay | Pohara, Tata Beach & Collingwood";
const HOME_DESCRIPTION =
  "Hand-picked holiday homes in Golden Bay, New Zealand — beach baches in Pohara, Tata Beach, Collingwood and beyond, with hotel-quality linen and local support.";

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
  const reviewStats = getHomesReviewAggregate(homes);
  const explorePlaces = getExplorePlaces();
  const teaserPlaces = EXPLORE_TEASER_SLUGS.flatMap((slug) => {
    const place = explorePlaces.find((item) => item.slug === slug);
    return place ? [place] : [];
  });

  return (
    <main>
      <JsonLd data={homesItemListJsonLd(homes)} />
      <section className="relative z-10 isolate min-h-[24rem] h-[54svh] md:h-[58svh] md:min-h-[28rem]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={assetPath(site.heroImage)}
            alt={site.heroAlt}
            fill
            priority
            className="animate-drift object-cover object-[50%_40%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/80 via-sea-deep/35 to-sea-deep/20" />
        </div>
        <Header />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-28 pt-24 md:justify-center md:px-6 md:pb-28 md:pt-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start md:-translate-y-8">
            <h1 className="animate-fade-up max-w-full font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw+0.5rem,3.5rem)] font-semibold leading-tight tracking-tight text-foam [overflow-wrap:anywhere]">
              {site.heroHeading}
            </h1>
            <p className="animate-fade-up-delay mt-3 max-w-full text-sm leading-relaxed text-foam/90 sm:max-w-xl md:text-lg">
              {site.heroLine}
            </p>
          </div>
        </div>
      </section>

      <HomeBookingStack
        homes={homes}
        locations={locations}
        rituals={<StayRituals />}
        explore={<ExploreTeaser places={teaserPlaces} />}
        proof={<ReviewsBand stats={reviewStats} />}
      />
    </main>
  );
}
