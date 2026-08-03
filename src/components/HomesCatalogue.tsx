"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LocationFilter } from "@/components/LocationFilter";
import { PropertyGrid } from "@/components/PropertyCard";
import type { Home } from "@/lib/homes/types";
import { normalizeLocation } from "@/lib/locations";

export function HomesCatalogue({
  homes,
  locations,
}: {
  homes: Home[];
  locations: string[];
}) {
  const params = useSearchParams();
  const location = params.get("location") ?? "";
  const pets = params.get("pets") === "1";
  const q = params.get("q") ?? "";

  const filtered = useMemo(() => {
    let list = homes;
    if (location) {
      const loc = normalizeLocation(location);
      list = list.filter((h) => normalizeLocation(h.location) === loc);
    }
    if (pets) list = list.filter((h) => h.petsAllowed);
    if (q) {
      const query = q.toLowerCase();
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(query) ||
          h.location.toLowerCase().includes(query),
      );
    }
    return list;
  }, [homes, location, pets, q]);

  return (
    <>
      <LocationFilter locations={locations} />
      <div className="mt-10">
        <PropertyGrid homes={filtered} />
      </div>
    </>
  );
}
