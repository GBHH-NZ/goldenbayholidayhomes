"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { GuestyPropertiesEmbed } from "@/components/GuestyPropertiesEmbed";
import { useGuestyEmbedRequired } from "@/components/GuestyEmbedContext";
import {
  extractIframeHeight,
  isGuestyMessageOrigin,
} from "@/lib/guesty/properties-url";
import { LOCATIONS } from "@/lib/locations";

type Variant = "home" | "preview";

const fieldClass =
  "mt-1 w-full min-w-0 max-w-full rounded-md border border-drift bg-foam/80 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30";
const compactFieldClass =
  "w-full min-w-0 max-w-full rounded-md border border-drift bg-foam/80 px-2 py-2 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30";

export function GuestyBookingSection({
  id = "book-online",
  locations,
  variant = "home",
}: {
  id?: string;
  locations?: readonly string[];
  variant?: Variant;
}) {
  const destinations = locations?.length ? locations : LOCATIONS;
  const formId = useId();
  const today = useMemo(() => todayIso(), []);
  const cardRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLFormElement>(null);
  const {
    iframeSrc,
    showCatalogue,
    filtered,
    iframeHeight,
    resultsId,
    setIframeHeight,
    openSearch,
    clear,
  } = useGuestyEmbedRequired();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isGuestyMessageOrigin(event.origin)) return;
      const height = extractIframeHeight(event.data);
      if (height) setIframeHeight(height);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setIframeHeight]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-12px 0px 0px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stuck) return;
    document.body.classList.add("has-sticky-search");
    return () => document.body.classList.remove("has-sticky-search");
  }, [stuck]);

  const checkOutMin = checkIn ? addDaysIso(checkIn, 1) : addDaysIso(today, 1);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasCheckIn = Boolean(checkIn);
    const hasCheckOut = Boolean(checkOut);

    if (hasCheckIn !== hasCheckOut) {
      setError("Choose both check-in and check-out dates.");
      return;
    }
    if (hasCheckIn && hasCheckOut && checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setError("");
    openSearch({
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests,
      adults: guests,
      city: city || undefined,
    });
  }

  function onReset() {
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setCity("");
    setError("");
    clear();
  }

  const searchCard = (
    <div ref={cardRef}>
      <form
        onSubmit={onSubmit}
        className="w-full min-w-0 rounded-xl border border-drift/70 bg-sand/95 p-4 shadow-lg shadow-sea-deep/15 backdrop-blur md:p-5"
        aria-labelledby={`${formId}-heading`}
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2
            id={`${formId}-heading`}
            className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep md:text-xl"
          >
            Find a stay
          </h2>
          {showCatalogue && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-medium text-sea underline-offset-2 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">
          Search live dates in the booking panel. The home cards below follow
          guests and destination — availability stays in Guesty.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_minmax(5.5rem,7rem)_minmax(9rem,1fr)_auto]">
          <label className="block text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
            Check-in
            <input
              type="date"
              name="checkIn"
              min={today}
              value={checkIn}
              onChange={(e) => {
                const next = e.target.value;
                setCheckIn(next);
                if (checkOut && next && checkOut <= next) setCheckOut("");
              }}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
            Check-out
            <input
              type="date"
              name="checkOut"
              min={checkOutMin}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
            Guests
            <input
              type="number"
              name="guests"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                setGuests(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
              }}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
            Destination
            <select
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
            >
              <option value="">Anywhere</option>
              {destinations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-sea px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep sm:col-span-2 lg:col-span-1 lg:self-end"
          >
            Search
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-sunset" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );

  const stickySearch =
    stuck && variant === "home" ? (
      <form
        ref={stickyRef}
        onSubmit={onSubmit}
        aria-label="Find a stay"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-drift/70 bg-sand/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-lg shadow-sea-deep/15 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_4.25rem_auto]">
          <label className="block text-[0.65rem] font-semibold uppercase tracking-wide text-sea-deep/80">
            In
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                const next = e.target.value;
                setCheckIn(next);
                if (checkOut && next && checkOut <= next) setCheckOut("");
              }}
              className={compactFieldClass}
            />
          </label>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-wide text-sea-deep/80">
            Out
            <input
              type="date"
              min={checkOutMin}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={compactFieldClass}
            />
          </label>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-wide text-sea-deep/80">
            Guests
            <input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                setGuests(Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1);
              }}
              className={compactFieldClass}
            />
          </label>
          <button
            type="submit"
            className="col-span-2 min-h-11 rounded-md bg-sea px-3 py-2 text-sm font-semibold text-white hover:bg-sea-deep sm:col-auto"
          >
            Search
          </button>
        </div>
        {error ? (
          <p className="mx-auto mt-1 max-w-6xl text-xs text-sunset" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    ) : null;

  const catalogue = showCatalogue ? (
    <div id={resultsId} className="scroll-mt-24">
      <GuestyPropertiesEmbed
        src={iframeSrc}
        height={iframeHeight}
        filtered={filtered || showCatalogue}
        onClear={onReset}
        insideRefs={[cardRef, stickyRef]}
      />
    </div>
  ) : null;

  if (variant === "preview") {
    return (
      <div id={id} className="scroll-mt-24">
        {searchCard}
        {catalogue ? (
          <div className="mx-auto mt-8 w-full max-w-[100rem]">{catalogue}</div>
        ) : null}
      </div>
    );
  }

  return (
    <section id={id} className="relative z-20 -mt-16 min-w-0 scroll-mt-24 md:-mt-20">
      <div className="mx-auto min-w-0 max-w-6xl px-4 md:px-6">{searchCard}</div>
      {catalogue ? (
        <div className="mx-auto mt-10 w-full max-w-[100rem] px-2 sm:px-4 md:mt-14 md:px-6">
          {catalogue}
        </div>
      ) : null}
      {stickySearch}
    </section>
  );
}

function todayIso(): string {
  return formatIso(new Date());
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return formatIso(new Date(year, month - 1, day + days));
}

function formatIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
