"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BEDROOM_FILTERS,
  parseBedroomFilter,
  parseSleepsBand,
  SLEEPS_BANDS,
} from "@/lib/homes/filters";
import { catalogueLocationParam, LOCATIONS } from "@/lib/locations";

function FilterChip({
  active,
  onClick,
  children,
  tone = "sea",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: "sea" | "sunset";
}) {
  const activeClass =
    tone === "sunset" ? "bg-sunset text-white" : "bg-sea text-white";
  const idleClass =
    tone === "sunset"
      ? "border border-drift bg-transparent text-sea-deep"
      : "bg-foam text-sea-deep hover:bg-drift/40";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-md px-3 py-2 text-sm transition ${
        active ? activeClass : idleClass
      }`}
    >
      {children}
    </button>
  );
}

export function LocationFilter({
  locations,
}: {
  locations?: readonly string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = catalogueLocationParam(params.get("location"));
  const pets = params.get("pets") === "1";
  const oceanView = params.get("oceanView") === "1";
  const spa = params.get("spa") === "1";
  const sleeps = parseSleepsBand(params.get("sleeps"));
  const bedrooms = parseBedroomFilter(params.get("bedrooms"));
  const options = locations?.length ? locations : LOCATIONS;
  const hash = pathname === "/" ? "#homes" : "";

  function setFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`, {
      scroll: false,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={!active}
          onClick={() => setFilter("location", null)}
        >
          All
        </FilterChip>
        {options.map((loc) => (
          <FilterChip
            key={loc}
            active={active === loc}
            onClick={() => setFilter("location", loc)}
          >
            {loc}
          </FilterChip>
        ))}
        <FilterChip
          active={pets}
          tone="sunset"
          onClick={() => setFilter("pets", pets ? null : "1")}
        >
          Pets welcome
        </FilterChip>
        <FilterChip
          active={oceanView}
          onClick={() => setFilter("oceanView", oceanView ? null : "1")}
        >
          Ocean views
        </FilterChip>
        <FilterChip
          active={spa}
          onClick={() => setFilter("spa", spa ? null : "1")}
        >
          Spa
        </FilterChip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
          Sleeps
        </span>
        <FilterChip
          active={!sleeps}
          onClick={() => setFilter("sleeps", null)}
        >
          All
        </FilterChip>
        {SLEEPS_BANDS.map((band) => (
          <FilterChip
            key={band.id}
            active={sleeps === band.id}
            onClick={() => setFilter("sleeps", band.id)}
          >
            {band.label}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
          Bedrooms
        </span>
        <FilterChip
          active={!bedrooms}
          onClick={() => setFilter("bedrooms", null)}
        >
          All
        </FilterChip>
        {BEDROOM_FILTERS.map((band) => (
          <FilterChip
            key={band.id}
            active={bedrooms === band.id}
            onClick={() => setFilter("bedrooms", band.id)}
          >
            {band.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
