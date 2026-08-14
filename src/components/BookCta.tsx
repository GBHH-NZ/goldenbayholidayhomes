"use client";

import { useEffect, type MouseEvent } from "react";
import { GuestyEmbedProvider, useGuestyEmbed, useGuestyEmbedRequired } from "@/components/GuestyEmbedContext";
import { GuestyPropertiesEmbed } from "@/components/GuestyPropertiesEmbed";
import {
  extractIframeHeight,
  isGuestyMessageOrigin,
} from "@/lib/guesty/properties-url";
import type { Home } from "@/lib/homes/types";
import { bookingUrl } from "@/lib/homes/types";
import { CONTACT } from "@/lib/env";

export function BookCta({ home }: { home: Home }) {
  const embed = useGuestyEmbed();
  const url = bookingUrl(home);
  const synced = home.syncStatus === "synced" && Boolean(home.guestyId);

  function onBookClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!embed) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    embed.openProperty(url);
  }

  return (
    <aside className="border border-drift bg-foam/60 p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
        Book this stay
      </h2>
      <p className="mt-2 text-sm text-muted">
        {embed
          ? "Check live dates on this page — availability and checkout stay in our Guesty booking engine."
          : synced
            ? "Availability and secure checkout are handled on our Guesty booking engine."
            : "Full photos, amenities, and a direct property booking link will appear after Guesty catalogue sync. You can still browse and book via our booking engine."}
      </p>
      <a
        href={url}
        target={embed ? undefined : "_blank"}
        rel={embed ? undefined : "noopener noreferrer"}
        onClick={onBookClick}
        className="mt-4 inline-block bg-sea px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sea-deep"
      >
        {embed || synced ? "Check availability" : "Open booking engine"}
      </a>
      <p className="mt-3 text-xs text-muted">
        Or call{" "}
        <a href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}>
          {CONTACT.phoneFree}
        </a>
      </p>
      {home.syncStatus === "seed" && (
        <p className="mt-4 border-t border-drift pt-3 text-xs text-muted">
          Listing details pending catalogue sync (
          <code className="text-[11px]">npm run sync:guesty-bookings</code>).
        </p>
      )}
    </aside>
  );
}

function PropertyEmbedSlot() {
  const {
    showCatalogue,
    iframeSrc,
    iframeHeight,
    filtered,
    resultsId,
    setIframeHeight,
    clear,
  } = useGuestyEmbedRequired();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isGuestyMessageOrigin(event.origin)) return;
      const height = extractIframeHeight(event.data);
      if (height) setIframeHeight(height);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setIframeHeight]);

  if (!showCatalogue) return null;

  return (
    <div id={resultsId} className="mt-4 scroll-mt-24">
      <GuestyPropertiesEmbed
        src={iframeSrc}
        height={iframeHeight}
        filtered={filtered}
        onClear={clear}
      />
    </div>
  );
}

export function PropertyBooking({ home }: { home: Home }) {
  return (
    <GuestyEmbedProvider resultsId={`book-${home.slug}`}>
      <BookCta home={home} />
      <PropertyEmbedSlot />
    </GuestyEmbedProvider>
  );
}
