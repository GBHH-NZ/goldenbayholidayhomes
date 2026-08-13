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
        logo: absoluteAssetUrl(getSiteMedia().logo),
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
        image: absoluteAssetUrl(ogImageUrl()),
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

  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: home.title,
    description: homeDescription(home),
    url: absoluteUrl(`/homes/${home.slug}`),
    image: photos,
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
  title: {
    default:
      "Holiday Homes in Golden Bay | Pohara, Tata Beach & Collingwood",
    template: "%s | Golden Bay Holiday Homes",
  },
  description:
    "Hand-picked holiday homes in Golden Bay, New Zealand — beach baches in Pohara, Tata Beach, Collingwood and beyond, with hotel-quality linen and local support.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: absoluteUrl("/"),
    siteName: "Golden Bay Holiday Homes",
    title: "Holiday Homes in Golden Bay | Pohara, Tata Beach & Collingwood",
    description:
      "Hand-picked holiday homes in Golden Bay, New Zealand — beach baches in Pohara, Tata Beach, Collingwood and beyond, with hotel-quality linen and local support.",
    images: [{ url: ogImageUrl(), width: 1200, height: 630, alt: "Golden Bay Holiday Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Holiday Homes in Golden Bay | Pohara, Tata Beach & Collingwood",
    description:
      "Hand-picked holiday homes in Golden Bay, New Zealand — beach baches in Pohara, Tata Beach, Collingwood and beyond, with hotel-quality linen and local support.",
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
