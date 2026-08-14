"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { CONTACT } from "@/lib/env";
import {
  BOOKING_IFRAME_CLASS,
  ConfirmCloseDialog,
  useConfirmOutsideDismiss,
  type DismissInsideRef,
} from "@/components/BookingEmbedPanel";
import {
  defaultGuestyPropertiesUrl,
  isGuestyPropertyUrl,
} from "@/lib/guesty/properties-url";

const IFRAME_MAX_HEIGHT_PX = 56.25 * 16;

export function GuestyPropertiesEmbed({
  id,
  src,
  height,
  onClear,
  insideRefs,
}: {
  id?: string;
  src?: string;
  height?: number;
  filtered?: boolean;
  onClear?: () => void;
  insideRefs?: readonly DismissInsideRef[];
}) {
  const resolvedSrc = src ?? defaultGuestyPropertiesUrl();
  const isProperty = isGuestyPropertyUrl(resolvedSrc);
  const rootRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === resolvedSrc;

  const fallbackHref = isProperty ? resolvedSrc : CONTACT.guestyBookings;
  const iframeHeight = height
    ? Math.min(height, IFRAME_MAX_HEIGHT_PX)
    : undefined;

  useEffect(() => {
    setCollapsed(false);
  }, [resolvedSrc]);

  const outsideClose = useConfirmOutsideDismiss(
    !collapsed,
    () => setCollapsed(true),
    rootRef,
    ...(insideRefs ?? []),
  );

  return (
    <div
      ref={rootRef}
      id={id}
      className="w-full overflow-hidden rounded-xl border border-drift/70 bg-sand scroll-mt-24"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-sea-deep px-4 py-3 text-foam">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold md:text-base">
          Live availability
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <button
            type="button"
            className="font-medium underline-offset-2 hover:underline"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "Show panel" : "Hide panel"}
          </button>
          {onClear ? (
            <button
              type="button"
              className="font-medium underline-offset-2 hover:underline"
              onClick={onClear}
            >
              Clear search
            </button>
          ) : null}
          <a
            href={fallbackHref}
            className="font-medium underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in booking engine
          </a>
        </div>
      </div>

      {collapsed ? (
        <p className="px-4 py-3 text-sm text-muted">
          Booking panel hidden. Live dates stay in the booking engine —{" "}
          <button
            type="button"
            className="font-medium text-sea underline-offset-2 hover:underline"
            onClick={() => setCollapsed(false)}
          >
            show the panel
          </button>{" "}
          or{" "}
          <a
            href={fallbackHref}
            className="font-medium text-sea underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            open it in a new tab
          </a>
          .
        </p>
      ) : null}

      <div
        className={clsx(
          "relative max-h-[min(90vh,60rem)] overflow-auto bg-foam/30",
          collapsed && "hidden",
        )}
      >
        {!loaded ? (
          <p className="absolute inset-x-0 top-0 z-10 bg-sand/95 px-4 py-6 text-sm text-muted">
            Loading live availability… If this stays blank, enable Settings →
            Site SSL → Allow site to be loaded in an iframe in Guesty, or use
            Open in booking engine.
          </p>
        ) : null}
        <iframe
          key={resolvedSrc}
          title="Golden Bay Holiday Homes live availability"
          src={resolvedSrc}
          loading="lazy"
            onLoad={() => setLoadedSrc(resolvedSrc)}
          style={iframeHeight ? { height: `${iframeHeight}px` } : undefined}
          className={clsx(
            "w-full border-0 bg-foam/30",
            iframeHeight ? undefined : BOOKING_IFRAME_CLASS,
          )}
          referrerPolicy="no-referrer-when-downgrade"
          allow="payment *"
        />
      </div>

      {outsideClose.confirming ? (
        <ConfirmCloseDialog
          onConfirm={outsideClose.confirm}
          onCancel={outsideClose.cancel}
        />
      ) : null}
    </div>
  );
}
