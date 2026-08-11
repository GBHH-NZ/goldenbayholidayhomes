"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCATIONS } from "@/lib/locations";

export function LocationFilter({
  locations,
}: {
  locations?: readonly string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("location") ?? "";
  const pets = params.get("pets") === "1";
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
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setFilter("location", null)}
        className={`px-3 py-1.5 text-sm transition ${
          !active
            ? "bg-sea text-white"
            : "bg-foam text-sea-deep hover:bg-drift/40"
        }`}
      >
        All
      </button>
      {options.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setFilter("location", loc)}
          className={`px-3 py-1.5 text-sm transition ${
            active === loc
              ? "bg-sea text-white"
              : "bg-foam text-sea-deep hover:bg-drift/40"
          }`}
        >
          {loc}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setFilter("pets", pets ? null : "1")}
        className={`ml-2 px-3 py-1.5 text-sm transition ${
          pets
            ? "bg-sunset text-white"
            : "border border-drift bg-transparent text-sea-deep"
        }`}
      >
        Pets welcome
      </button>
    </div>
  );
}
