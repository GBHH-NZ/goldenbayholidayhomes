"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useGuestyEmbed } from "@/components/GuestyEmbedContext";
import { LocationFilter } from "@/components/LocationFilter";
import { PropertyGrid } from "@/components/PropertyCard";
import { applyCatalogueFilters } from "@/lib/homes/filters";
import type { Home } from "@/lib/homes/types";
import { catalogueLocationParam } from "@/lib/locations";

export function HomesCatalogue({
  homes,
  locations,
}: {
  homes: Home[];
  locations: string[];
}) {
  const params = useSearchParams();
  const embed = useGuestyEmbed();
  const locationParam = catalogueLocationParam(params.get("location"));
  const pets = params.get("pets") === "1";
  const oceanView = params.get("oceanView") === "1";
  const spa = params.get("spa") === "1";
  const q = params.get("q") ?? "";
  const sleeps = params.get("sleeps");
  const bedrooms = params.get("bedrooms");
  const searchCity = embed?.lastSearch?.city ?? "";
  const searchGuests = embed?.lastSearch?.guests;
  const location = locationParam || searchCity;

  const filtered = useMemo(
    () =>
      applyCatalogueFilters(homes, {
        location,
        pets,
        q,
        sleeps,
        bedrooms,
        oceanView,
        spa,
        minGuests:
          searchGuests && searchGuests > 1 ? searchGuests : undefined,
      }),
    [
      homes,
      location,
      pets,
      q,
      sleeps,
      bedrooms,
      oceanView,
      spa,
      searchGuests,
    ],
  );

  return (
    <>
      <LocationFilter locations={locations} />
      {embed?.lastSearch ? (
        <p className="mt-4 text-sm text-muted">
          Showing homes that sleep {embed.lastSearch.guests}+
          {location ? ` in ${location}` : ""}. Live availability is in the
          booking panel above.
        </p>
      ) : null}
      <div className="mt-10">
        <PropertyGrid homes={filtered} />
      </div>
    </>
  );
}
