"use client";

import { useEffect } from "react";

const WIDGET_ID = "search-widget_IO312PWQ";
const CSS_HREF =
  "https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.css";
const SCRIPT_SRC =
  "https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.js";
const SITE_URL = "goldenbayholidayhomes.guestybookings.com";
const WIDGET_COLOR = "#506fce";

declare global {
  interface Window {
    GuestySearchBarWidget?: {
      create: (config: {
        siteUrl: string;
        color: string;
      }) => Promise<unknown>;
    };
  }
}

export function GuestySearchWidget() {
  useEffect(() => {
    const head = document.head;

    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = CSS_HREF;
      link.media = "all";
      head.appendChild(link);
    }

    const mount = () => {
      try {
        void window.GuestySearchBarWidget?.create({
          siteUrl: SITE_URL,
          color: WIDGET_COLOR,
        }).catch((err: unknown) => {
          console.log(
            "[Guesty Embedded Widget]:",
            err instanceof Error ? err.message : err,
          );
        });
      } catch (err) {
        console.log(
          "[Guesty Embedded Widget]:",
          err instanceof Error ? err.message : err,
        );
      }
    };

    const existing = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.GuestySearchBarWidget) {
        mount();
      } else {
        existing.addEventListener("load", mount);
        return () => existing.removeEventListener("load", mount);
      }
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = mount;
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);

    return () => {
      script.onload = null;
    };
  }, []);

  return <div id={WIDGET_ID} />;
}
