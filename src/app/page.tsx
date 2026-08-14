import type { Metadata } from "next";
import { ExploreTeaser, EXPLORE_TEASER_SLUGS } from "@/components/ExploreTeaser";
import { HomeBookingStack } from "@/components/HomeBookingStack";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import { ReviewsBand } from "@/components/ReviewsBand";
import { StayRituals } from "@/components/StayRituals";
import { getExplorePlaces } from "@/lib/content";
import { getAllHomes, getHomeLocations, getHomesReviewAggregate } from "@/lib/homes";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  buildPageMetadata,
  homesItemListJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: SITE_TITLE },
};

export default function HomePage() {
  const homes = getAllHomes();
  const locations = getHomeLocations();
  const reviewStats = getHomesReviewAggregate(homes);
  const explorePlaces = getExplorePlaces();
  const teaserPlaces = EXPLORE_TEASER_SLUGS.flatMap((slug) => {
    const place = explorePlaces.find((item) => item.slug === slug);
    return place ? [place] : [];
  });

  return (
    <main>
      <JsonLd data={homesItemListJsonLd(homes)} />
      <HomeHero />

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
