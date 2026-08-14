"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookingEmbedPanel,
  ConfirmCloseDialog,
  useConfirmOutsideDismiss,
} from "@/components/BookingEmbedPanel";
import type { ExplorePlace } from "@/lib/content";
import { assetPath } from "@/lib/env";

function InfoLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export function ExplorePlaceCard({
  place,
  href,
  heading = "h2",
}: {
  place: ExplorePlace;
  /** Override the info link (homepage teaser → explore page). */
  href?: string;
  heading?: "h2" | "h3";
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const photoRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const infoHref = href ?? place.url;
  const Title = heading === "h3" ? "h3" : "h2";
  const bookLabel = place.bookLabel ?? "Book a Ride";
  const visitLabel = href ? "See details →" : "Visit website →";

  const [photoSrc, setPhotoSrc] = useState(assetPath(place.image));

  const outsideClose = useConfirmOutsideDismiss(
    open && Boolean(place.bookUrl),
    () => setOpen(false),
    photoRef,
    triggerRef,
    panelRef,
  );

  const photo = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-drift md:aspect-auto md:h-full md:min-h-[14rem]">
      <Image
        src={photoSrc}
        alt={place.name}
        fill
        className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
        sizes="(max-width: 768px) 100vw, 320px"
        onError={() => {
          const fallback = assetPath("/images/explore-placeholder.svg");
          if (photoSrc !== fallback) setPhotoSrc(fallback);
        }}
      />
    </div>
  );

  return (
    <article className="overflow-hidden rounded-md border border-drift/70 bg-sand">
      <div className="flex flex-col md:flex-row">
        <div className="p-3 pb-0 md:w-72 md:shrink-0 md:p-4 md:pr-0 lg:w-80">
          {place.bookUrl ? (
            <button
              ref={photoRef}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={`${bookLabel} — ${place.name}`}
              onClick={() => setOpen((value) => !value)}
              className="group block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            >
              {photo}
            </button>
          ) : infoHref ? (
            <InfoLink href={infoHref} className="group block h-full">
              {photo}
            </InfoLink>
          ) : (
            photo
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-sea">
            {place.category}
          </p>
          <Title className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
            {infoHref ? (
              <InfoLink
                href={infoHref}
                className="transition hover:text-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              >
                {place.name}
              </InfoLink>
            ) : (
              place.name
            )}
          </Title>
          <p className="mt-2 text-sm text-muted">{place.location}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {place.summary}
          </p>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
            {infoHref ? (
              <InfoLink
                href={infoHref}
                className="text-sm font-medium text-sea underline-offset-2 hover:underline"
              >
                {visitLabel}
              </InfoLink>
            ) : (
              <span />
            )}
            {place.bookUrl ? (
              <div ref={triggerRef} className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpen((value) => !value)}
                  className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep"
                >
                  {bookLabel}
                </button>
                {open ? (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-sea underline-offset-2 hover:underline"
                  >
                    Close
                  </button>
                ) : (
                  <span className="text-xs text-muted">Opens booking below</span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {open && place.bookUrl ? (
        <div id={panelId} ref={panelRef}>
          <BookingEmbedPanel
            src={place.bookUrl}
            title={`${place.name} booking`}
            heading={bookLabel}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}

      {outsideClose.confirming ? (
        <ConfirmCloseDialog
          onConfirm={outsideClose.confirm}
          onCancel={outsideClose.cancel}
        />
      ) : null}
    </article>
  );
}
