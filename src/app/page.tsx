import type { Metadata } from "next";
import { ExploreTeaser, EXPLORE_TEASER_SLUGS } from "@/components/ExploreTeaser";
import { HomeBookingStack } from "@/components/HomeBookingStack";
import { HomeHero } from "@/components/HomeHero";
import { HostsVignette } from "@/components/HostsVignette";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { ReviewsBand } from "@/components/ReviewsBand";
import { StayRituals } from "@/components/StayRituals";
import { getExplorePlaces, getPageContent } from "@/lib/content";
import { getAllHomes, getHomeLocations, getHomesReviewAggregate } from "@/lib/homes";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  buildPageMetadata,
  homesItemListJsonLd,
} from "@/lib/seo";

type HostsPageContent = {
  intro: string;
  heroImage: string;
  heroAlt: string;
  heroCaption: string;
};

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
  const hosts = getPageContent<HostsPageContent>("about-us");
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
      <HostsVignette
        intro={hosts.intro}
        caption={hosts.heroCaption}
        image={hosts.heroImage}
        imageAlt={hosts.heroAlt}
      />
      <NewsletterSignup />
    </main>
  );
}
