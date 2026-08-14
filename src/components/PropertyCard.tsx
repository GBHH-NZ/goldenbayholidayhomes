"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import {
  BookingEmbedPanel,
  scrollIframePanelIntoView,
} from "@/components/BookingEmbedPanel";
import type { Home } from "@/lib/homes/types";
import {
  bookingUrl,
  homeAmenities,
  homePhotos,
  SETTING_LABEL,
} from "@/lib/homes/types";
import { clsx } from "clsx";

function formatNightly(amount: number | null | undefined): string | null {
  if (amount == null || Number.isNaN(amount)) return null;
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function metaBits(home: Home): string[] {
  const bits: string[] = [];
  if (home.propertyType) bits.push(home.propertyType);
  bits.push(`${home.guests} guest${home.guests === 1 ? "" : "s"}`);
  if (home.bedrooms != null) {
    bits.push(
      `${home.bedrooms} bedroom${home.bedrooms === 1 ? "" : "s"}`,
    );
  }
  if (home.bathrooms != null) {
    bits.push(
      `${home.bathrooms} bathroom${home.bathrooms === 1 ? "" : "s"}`,
    );
  }
  return bits;
}

const photoFrameClass =
  "relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-drift md:aspect-auto md:h-full md:min-h-[14rem] md:w-80 md:shrink-0 lg:w-96";

export function PropertyCard({
  home,
  bookingOpen,
  onToggleBooking,
}: {
  home: Home;
  bookingOpen?: boolean;
  onToggleBooking?: () => void;
}) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const photos = homePhotos(home);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = photos[Math.min(photoIndex, photos.length - 1)] ?? photos[0];
  const bookHref = bookingUrl(home);
  const nightly = formatNightly(home.nightlyFrom);
  const blurb = home.description?.trim() || null;
  const meta = metaBits(home);
  const amenities = homeAmenities(home).slice(0, 4);
  const canHoverGallery = photos.length > 1;
  const canEmbed = Boolean(home.guestyId || home.guestyUrl);
  const open = onToggleBooking ? Boolean(bookingOpen) : localOpen;

  function openBooking() {
    if (open) {
      const panel = panelRef.current;
      scrollIframePanelIntoView(panel, panel?.closest("article") ?? panel);
      return;
    }
    if (onToggleBooking) onToggleBooking();
    else setLocalOpen(true);
  }

  function closeBooking() {
    if (!open) return;
    if (onToggleBooking) onToggleBooking();
    else setLocalOpen(false);
  }

  const photoImage = (
    <Image
      src={photo}
      alt=""
      fill
      className="object-cover transition duration-500 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
      sizes="(max-width: 768px) 100vw, 384px"
    />
  );

  return (
    <article className="overflow-hidden rounded-md border border-drift/70 bg-sand">
      <div className="flex flex-col md:flex-row">
        {canEmbed ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`Book ${home.shortTitle || home.title}`}
            className={clsx(
              photoFrameClass,
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-sea",
            )}
            onClick={openBooking}
            onMouseEnter={() => {
              if (canHoverGallery) setPhotoIndex(1);
            }}
            onMouseLeave={() => setPhotoIndex(0)}
          >
            {photoImage}
          </button>
        ) : (
          <a
            href={bookHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Book ${home.shortTitle || home.title}`}
            className={clsx(
              photoFrameClass,
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-sea",
            )}
            onMouseEnter={() => {
              if (canHoverGallery) setPhotoIndex(1);
            }}
            onMouseLeave={() => setPhotoIndex(0)}
          >
            {photoImage}
          </a>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
                <Link
                  href={`/homes/${home.slug}`}
                  className="transition hover:text-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                >
                  {home.shortTitle || home.title}
                </Link>
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {home.setting && (
                  <span className="rounded-md bg-foam px-2 py-0.5 text-xs text-sea-deep">
                    {SETTING_LABEL[home.setting]}
                    {home.walkMins != null
                      ? ` · ${home.walkMins} min walk`
                      : ""}
                  </span>
                )}
                {home.oceanView ? (
                  <span className="rounded-md bg-sea px-2 py-0.5 text-xs text-white">
                    Ocean view
                  </span>
                ) : null}
                {home.spa ? (
                  <span className="rounded-md bg-sunset px-2 py-0.5 text-xs text-white">
                    Spa
                  </span>
                ) : null}
                {home.petsAllowed && (
                  <span className="rounded-md bg-sea-deep/90 px-2 py-0.5 text-xs text-foam">
                    Pets welcome
                  </span>
                )}
                <span>{home.location}</span>
              </div>
            </div>

            {home.reviewScore != null &&
              home.reviewCount != null &&
              home.reviewCount > 0 && (
                <p className="shrink-0 text-sm text-sea-deep">
                  <span className="font-semibold">
                    {home.reviewScore.toFixed(1)}
                  </span>
                  <span className="text-muted">
                    {" "}
                    · {home.reviewCount} review
                    {home.reviewCount === 1 ? "" : "s"}
                  </span>
                </p>
              )}
          </div>

          {blurb && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
              {blurb}
            </p>
          )}

          {meta.length > 0 && (
            <p className="mt-3 text-sm text-sea-deep/80">{meta.join(" · ")}</p>
          )}

          {amenities.length > 0 ? (
            <p className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted">
              {amenities.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-foam px-2 py-0.5 text-sea-deep"
                >
                  {item}
                </span>
              ))}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
            <div>
              {nightly ? (
                <p className="text-sea-deep">
                  <span className="text-sm text-muted">From </span>
                  <span className="text-lg font-semibold">{nightly}</span>
                  <span className="text-sm text-muted"> / night</span>
                </p>
              ) : (
                <p className="text-sm text-muted">Rates on booking engine</p>
              )}
            </div>
            {canEmbed ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={openBooking}
                  className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep"
                >
                  Book now
                </button>
                {open ? null : (
                  <span className="text-xs text-muted">Opens booking below</span>
                )}
              </div>
            ) : (
              <a
                href={bookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep"
              >
                Book now
              </a>
            )}
          </div>
        </div>
      </div>

      {open && canEmbed ? (
        <div id={panelId} ref={panelRef}>
          <BookingEmbedPanel
            src={bookHref}
            title={`${home.shortTitle || home.title} booking`}
            onClose={closeBooking}
          />
        </div>
      ) : null}
    </article>
  );
}

export function PropertyGrid({
  homes,
  className,
}: {
  homes: Home[];
  className?: string;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (homes.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        No homes match these filters.
      </p>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      {homes.map((h) => (
        <PropertyCard
          key={h.slug}
          home={h}
          bookingOpen={openSlug === h.slug}
          onToggleBooking={() =>
            setOpenSlug((current) => (current === h.slug ? null : h.slug))
          }
        />
      ))}
    </div>
  );
}
