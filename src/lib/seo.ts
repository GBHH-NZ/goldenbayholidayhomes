import type { Metadata } from "next";
import type { Home } from "@/lib/homes/types";
import {
  bookingUrl,
  homeAmenities,
  homeDescription,
  homePhotos,
} from "@/lib/homes/types";
import { CONTACT, SITE_URL, contactSameAs } from "@/lib/env";
import { getSiteMedia } from "@/lib/content";
import {
  foldLocationKey,
  locationPath,
  normalizeLocation,
} from "@/lib/locations";

export const SITE_NAME = "Golden Bay Holiday Homes";
export const SITE_TITLE =
  "Holiday Homes in Golden Bay | Pohara, Tata Beach & Collingwood";
export const SITE_DESCRIPTION =
  "Hand-picked holiday homes in Golden Bay — beach baches in Pohara, Tata Beach and Collingwood, near Takaka, with hotel-quality linen and local 0800 support.";

function ogImageUrl() {
  try {
    return getSiteMedia().ogImage;
  } catch {
    return "/images/og-default.jpg";
  }
}

function defaultOgImages(): NonNullable<
  NonNullable<Metadata["openGraph"]>["images"]
> {
  return [
    {
      url: ogImageUrl(),
      width: 1200,
      height: 630,
      alt: "Holiday homes in Golden Bay, New Zealand",
    },
  ];
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

/** Absolute URL for a file (no trailing slash). */
export function absoluteAssetUrl(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Keep meta descriptions in the ~150–160 character range without cutting mid-word. */
export function truncateMetaDescription(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const budget = max - 1;
  const sliced = normalized.slice(0, budget);
  const lastSpace = sliced.lastIndexOf(" ");
  const clipped =
    lastSpace >= Math.floor(budget * 0.7) ? sliced.slice(0, lastSpace) : sliced;
  return `${clipped.replace(/[\s.,;:!?–—-]+$/u, "")}…`;
}

function socialTitle(title?: string): string | undefined {
  if (!title) return undefined;
  if (/[|]/.test(title) || /golden bay holiday homes/i.test(title)) {
    return title;
  }
  return `${title} | ${SITE_NAME}`;
}

type PageMetaInput = {
  title?: string;
  description?: string;
  path: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
  noIndex?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
};

/** Title, description, canonical, and Open Graph for a path. */
export function buildPageMetadata({
  title,
  description,
  path,
  images,
  noIndex,
  ogType = "website",
  publishedTime,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const metaDescription = description
    ? truncateMetaDescription(description)
    : undefined;
  const ogTitle = socialTitle(title);
  const ogImages = images ?? defaultOgImages();
  const openGraph =
    ogType === "article"
      ? {
          type: "article" as const,
          locale: "en_NZ",
          url,
          siteName: SITE_NAME,
          title: ogTitle,
          description: metaDescription,
          images: ogImages,
          ...(publishedTime ? { publishedTime } : {}),
        }
      : {
          type: "website" as const,
          locale: "en_NZ",
          url,
          siteName: SITE_NAME,
          title: ogTitle,
          description: metaDescription,
          images: ogImages,
        };

  return {
    title,
    description: metaDescription,
    applicationName: SITE_NAME,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: metaDescription,
      images: ogImages,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: { index: false, follow: false, noimageindex: true },
          },
        }
      : {}),
  };
}

export function listingPageTitle(home: Home): string {
  const titleKey = foldLocationKey(home.title);
  const locationKey = foldLocationKey(home.location);
  return titleKey.includes(locationKey)
    ? home.title
    : `${home.title} in ${home.location}`;
}

export function listingMetaDescription(home: Home): string {
  const raw = homeDescription(home).replace(/\s+/g, " ").trim();
  const folded = foldLocationKey(raw);
  const mentionsPlace =
    folded.includes(foldLocationKey(home.location)) ||
    folded.includes("golden bay");
  const extras = [
    home.petsAllowed ? "Pets welcome." : "",
    `Sleeps ${home.guests}.`,
  ]
    .filter(Boolean)
    .join(" ");

  if (mentionsPlace) {
    return truncateMetaDescription(raw);
  }
  return truncateMetaDescription(
    `${home.title} — holiday home in ${home.location}, Golden Bay. ${extras} ${raw}`,
  );
}

export function organizationJsonLd() {
  const sameAs = contactSameAs();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-NZ",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        email: CONTACT.email,
        telephone: [CONTACT.phoneMobile, CONTACT.phoneFree],
        logo: absoluteAssetUrl(getSiteMedia().logo),
        sameAs,
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tasman",
          addressLocality: "Takaka",
          addressCountry: "NZ",
        },
      },
      {
        "@type": ["LocalBusiness", "LodgingBusiness"],
        "@id": `${SITE_URL}/#localbusiness`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        email: CONTACT.email,
        telephone: [CONTACT.phoneMobile, CONTACT.phoneFree],
        image: absoluteAssetUrl(ogImageUrl()),
        priceRange: "$$",
        geo: {
          "@type": "GeoCoordinates",
          latitude: -40.85,
          longitude: 172.8,
        },
        hasMap: CONTACT.mapsUrl,
        areaServed: [
          {
            "@type": "AdministrativeArea",
            name: "Golden Bay, Tasman, New Zealand",
          },
          { "@type": "Place", name: "Pohara" },
          { "@type": "Place", name: "Tata Beach" },
          { "@type": "Place", name: "Collingwood" },
          { "@type": "Place", name: "Takaka" },
          { "@type": "Place", name: "Patons Rock" },
          { "@type": "Place", name: "Ligar Bay" },
          { "@type": "Place", name: "Parapara" },
          { "@type": "Place", name: "Onekaka" },
          { "@type": "Place", name: "East Takaka" },
          { "@type": "Place", name: "Wainui Bay" },
        ],
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tasman",
          addressLocality: "Takaka",
          addressCountry: "NZ",
        },
        sameAs,
      },
    ],
  };
}

export function homesItemListJsonLd(homes: Home[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Golden Bay holiday homes",
    numberOfItems: homes.length,
    itemListElement: homes.map((home, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/homes/${home.slug}`),
      name: home.title,
    })),
  };
}

export function vacationRentalJsonLd(home: Home) {
  const photos = homePhotos(home);
  const hasReviews =
    home.reviewScore != null &&
    home.reviewCount != null &&
    home.reviewCount > 0;
  const place = normalizeLocation(home.location) as string;
  const placePath = locationPath(home.location);
  const nightly =
    home.nightlyFrom != null && home.nightlyFrom > 0 ? home.nightlyFrom : null;

  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: home.title,
    description: homeDescription(home),
    url: absoluteUrl(`/homes/${home.slug}`),
    image: photos,
    address: {
      "@type": "PostalAddress",
      addressLocality: place,
      addressRegion: "Tasman",
      addressCountry: "NZ",
      streetAddress: home.address ?? undefined,
    },
    containedInPlace: {
      "@type": "Place",
      name: `${place}, Golden Bay`,
      ...(placePath ? { url: absoluteUrl(placePath) } : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: place,
        addressRegion: "Tasman",
        addressCountry: "NZ",
      },
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: home.guests,
      unitCode: "C62",
    },
    ...(home.bedrooms != null && home.bedrooms > 0
      ? { numberOfBedrooms: home.bedrooms }
      : {}),
    ...(home.bathrooms != null && home.bathrooms > 0
      ? { numberOfBathroomsTotal: home.bathrooms }
      : {}),
    petsAllowed: home.petsAllowed,
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(nightly
      ? {
          offers: {
            "@type": "Offer",
            price: nightly,
            priceCurrency: "NZD",
            availability: "https://schema.org/InStock",
            url: bookingUrl(home),
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: nightly,
              priceCurrency: "NZD",
              unitCode: "DAY",
              unitText: "night",
            },
          },
        }
      : {}),
    amenityFeature: homeAmenities(home).map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    ...(hasReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: home.reviewScore,
            reviewCount: home.reviewCount,
            bestRating: 10,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    image: post.image ? [absoluteAssetUrl(post.image)] : undefined,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-NZ",
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_NZ",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: defaultOgImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl()],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
