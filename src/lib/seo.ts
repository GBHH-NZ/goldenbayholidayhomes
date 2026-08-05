import type { Home } from "@/lib/homes/types";
import { homeAmenities, homeDescription, homePhotos } from "@/lib/homes/types";
import { SITE_URL } from "@/lib/env";
import { CONTACT } from "@/lib/env";
import { getSiteMedia } from "@/lib/content";

function ogImageUrl() {
  try {
    return getSiteMedia().ogImage;
  } catch {
    return "/images/og-default.svg";
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Golden Bay Holiday Homes",
        description:
          "Hand-picked Golden Bay accommodation — beach baches, holiday homes, hotel-quality linen and local support.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-NZ",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Golden Bay Holiday Homes",
        url: SITE_URL,
        email: CONTACT.email,
        telephone: [CONTACT.phoneMobile, CONTACT.phoneFree],
        logo: getSiteMedia().logo,
        sameAs: [CONTACT.facebook],
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tasman",
          addressLocality: "Golden Bay",
          addressCountry: "NZ",
        },
      },
    ],
  };
}

export function vacationRentalJsonLd(home: Home) {
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: home.title,
    description: homeDescription(home),
    url: `${SITE_URL}/homes/${home.slug}`,
    image: homePhotos(home),
    address: {
      "@type": "PostalAddress",
      addressLocality: home.location,
      addressRegion: "Tasman",
      addressCountry: "NZ",
      streetAddress: home.address ?? undefined,
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: home.guests,
    },
    petsAllowed: home.petsAllowed,
    amenityFeature: homeAmenities(home).map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };
}

export const defaultMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Golden Bay Accommodation & Holiday Homes - Golden Bay Holiday Homes, NZ",
    template: "%s | Golden Bay Holiday Homes",
  },
  description:
    "Hand-picked Golden Bay accommodation — beach baches and holiday homes with hotel-quality linen and local support from Michael & Katja.",
  openGraph: {
    type: "website" as const,
    locale: "en_NZ",
    url: SITE_URL,
    siteName: "Golden Bay Holiday Homes",
    images: [{ url: ogImageUrl(), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};
