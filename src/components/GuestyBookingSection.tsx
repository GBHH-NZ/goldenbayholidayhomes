"use client";

import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { GuestyPropertiesEmbed } from "@/components/GuestyPropertiesEmbed";
import { LOCATIONS } from "@/lib/locations";
import {
  defaultGuestyPropertiesUrl,
  extractIframeHeight,
  guestyPropertiesUrl,
  isGuestyMessageOrigin,
} from "@/lib/guesty/properties-url";

type Variant = "home" | "preview";

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

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [iframeSrc, setIframeSrc] = useState(() => defaultGuestyPropertiesUrl());
  const [filtered, setFiltered] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | undefined>();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isGuestyMessageOrigin(event.origin)) return;
      const height = extractIframeHeight(event.data);
      if (height) setIframeHeight(height);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const checkOutMin = checkIn ? addDaysIso(checkIn, 1) : addDaysIso(today, 1);

  function applySearch(next: {
    checkIn?: string;
    checkOut?: string;
    guests: number;
    city?: string;
  }) {
    setIframeSrc(
      guestyPropertiesUrl({
        checkIn: next.checkIn,
        checkOut: next.checkOut,
        guests: next.guests,
        adults: next.guests,
        city: next.city,
      }),
    );
    setIframeHeight(undefined);
    setFiltered(Boolean(next.checkIn || next.checkOut || next.city || next.guests > 1));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
    applySearch({
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests,
      city: city || undefined,
    });
  }

  function onReset() {
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setCity("");
    setError("");
    setIframeSrc(defaultGuestyPropertiesUrl());
    setIframeHeight(undefined);
    setFiltered(false);
  }

  const searchCard = (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-drift/70 bg-sand/95 p-4 shadow-lg shadow-sea-deep/15 backdrop-blur md:p-5"
      aria-labelledby={`${formId}-heading`}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id={`${formId}-heading`}
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep md:text-xl"
        >
          Find a stay
        </h2>
        {filtered && (
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
        Search availability without leaving this page. Results update in the
        booking catalogue below.
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
            className="mt-1 w-full rounded-md border border-drift bg-foam/80 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30"
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
            className="mt-1 w-full rounded-md border border-drift bg-foam/80 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30"
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
            className="mt-1 w-full rounded-md border border-drift bg-foam/80 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
          Destination
          <select
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-md border border-drift bg-foam/80 px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/30"
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
          className="rounded-md bg-sea px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-deep sm:col-span-2 lg:col-span-1 lg:self-end"
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
  );

  if (variant === "preview") {
    return (
      <div>
        {searchCard}
        <div className="mt-8">
          <GuestyPropertiesEmbed
            id={id}
            src={iframeSrc}
            height={iframeHeight}
            filtered={filtered}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="relative z-20 -mt-16 md:-mt-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">{searchCard}</div>
      <div className="mx-auto mt-10 max-w-7xl px-4 md:px-6 md:mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
          Book online
        </h2>
        <div className="mt-4">
          <GuestyPropertiesEmbed
            id={id}
            src={iframeSrc}
            height={iframeHeight}
            filtered={filtered}
          />
        </div>
      </div>
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
