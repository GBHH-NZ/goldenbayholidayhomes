"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const DEFAULT_GA_MEASUREMENT_ID = "G-P4LBS4D2WW";
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;

function isGa4MeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id);
}

function sendPageView() {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** GA4 via gtag.js. Env overrides the in-repo Measurement ID fallback. */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    sendPageView();
  }, [pathname, ready]);

  if (!isGa4MeasurementId(GA_MEASUREMENT_ID)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, { send_page_view: false });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
