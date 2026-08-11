import type { Metadata } from "next";
import type { Home } from "@/lib/homes/types";
import { homeAmenities, homeDescription, homePhotos } from "@/lib/homes/types";
import { SITE_URL } from "@/lib/env";
import { CONTACT } from "@/lib/env";
import { getSiteMedia } from "@/lib/content";

function ogImageUrl() {
  try {
    return getSiteMedia().ogImage;
  } catch {
    return "/images/og-default.jpg";
  }
}

/** Absolute URL matching trailingSlash: true export. */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") {
    return `${SITE_URL}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${SITE_URL}${withSlash}`;
}

type PageMetaInput = {
  title?: string;
  description?: string;
  path: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
  noIndex?: boolean;
};

/** Title, description, canonical, and Open Graph for a path. */
export function buildPageMetadata({
  title,
  description,
  path,
  images,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
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
        url: `${SITE_URL}/`,
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
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: "Golden Bay Holiday Homes",
        url: `${SITE_URL}/`,
        email: CONTACT.email,
        telephone: CONTACT.phoneMobile,
        image: ogImageUrl(),
        priceRange: "$$",
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Golden Bay, Tasman, New Zealand",
        },
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tasman",
          addressLocality: "Golden Bay",
          addressCountry: "NZ",
        },
        sameAs: [CONTACT.facebook],
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
    url: absoluteUrl(`/homes/${home.slug}`),
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

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Golden Bay Accommodation & Holiday Homes | goldenbayholidayhomes.com",
    template: "%s | Golden Bay Holiday Homes",
  },
  description:
    "Hand-picked Golden Bay accommodation — beach baches and holiday homes with hotel-quality linen and local support from Michael & Katja.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: absoluteUrl("/"),
    siteName: "Golden Bay Holiday Homes",
    title:
      "Golden Bay Accommodation & Holiday Homes | goldenbayholidayhomes.com",
    description:
      "Hand-picked Golden Bay accommodation — beach baches and holiday homes with hotel-quality linen and local support from Michael & Katja.",
    images: [{ url: ogImageUrl(), width: 1200, height: 630, alt: "Golden Bay Holiday Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Golden Bay Accommodation & Holiday Homes | goldenbayholidayhomes.com",
    description:
      "Hand-picked Golden Bay accommodation — beach baches and holiday homes with hotel-quality linen and local support from Michael & Katja.",
    images: [ogImageUrl()],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};
