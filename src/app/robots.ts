import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Internal preview and any future API routes must stay out of the index.
        disallow: ["/preview", "/preview/", "/api/"],
      },
      {
        userAgent: "PetalBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
