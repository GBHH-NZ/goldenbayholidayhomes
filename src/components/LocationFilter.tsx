"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BEDROOM_FILTERS,
  parseBedroomFilter,
  parseSetting,
  parseSleepsBand,
  SLEEPS_BANDS,
} from "@/lib/homes/filters";
import { SETTING_LABEL } from "@/lib/homes/types";
import { catalogueLocationParam, LOCATIONS } from "@/lib/locations";

type OpenMenu = "areas" | "extras" | null;

const EXTRAS = [
  { key: "spa", label: "Spa", param: "spa", value: "1" },
  { key: "oceanView", label: "Ocean views", param: "oceanView", value: "1" },
  { key: "bush", label: SETTING_LABEL.bush, param: "setting", value: "bush" },
] as const;

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
      className={`shrink-0 whitespace-nowrap min-h-11 rounded-md px-3 py-2 text-sm transition ${
        active ? activeClass : idleClass
      }`}
    >
      {children}
    </button>
  );
}

const selectClass =
  "min-h-11 min-w-[5.5rem] rounded-md border border-drift bg-foam px-2.5 py-2 text-sm font-normal normal-case tracking-normal text-sea-deep outline-none focus:border-sea focus:ring-2 focus:ring-sea/30";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FilterDropdown({
  id,
  label,
  active,
  open,
  ariaHasPopup,
  onOpenChange,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  open: boolean;
  ariaHasPopup: "listbox" | "true";
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const minWidth = Math.max(rect.width, 176);
      let left = rect.left;
      if (left + minWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - 8 - minWidth);
      }
      setStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left,
        minWidth,
        zIndex: 60,
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }

    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        aria-haspopup={ariaHasPopup}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(!open)}
        className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sea/30 ${
          active
            ? "border-sea bg-sea text-white"
            : "border-drift bg-foam text-sea-deep hover:bg-drift/40"
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={id}
              style={style}
              className="max-h-[min(20rem,calc(100vh-6rem))] overflow-y-auto rounded-md border border-drift bg-sand p-1.5 shadow-lg shadow-sea-deep/15"
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function extraItemClass(active: boolean) {
  return `flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
    active ? "bg-sea text-white" : "text-sea-deep hover:bg-foam"
  }`;
}

function extraIsOn(
  extra: (typeof EXTRAS)[number],
  spa: boolean,
  oceanView: boolean,
  setting: string | null,
) {
  if (extra.param === "spa") return spa;
  if (extra.param === "oceanView") return oceanView;
  return setting === extra.value;
}

export function LocationFilter({
  locations,
}: {
  locations?: readonly string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const areasId = useId();
  const extrasId = useId();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const active = catalogueLocationParam(params.get("location"));
  const pets = params.get("pets") === "1";
  const oceanView = params.get("oceanView") === "1";
  const spa = params.get("spa") === "1";
  const setting = parseSetting(params.get("setting"));
  const sleeps = parseSleepsBand(params.get("sleeps"));
  const bedrooms = parseBedroomFilter(params.get("bedrooms"));
  const options = locations?.length ? locations : LOCATIONS;
  const hash = pathname === "/" ? "#homes" : "";
  const extrasOn = EXTRAS.filter((extra) =>
    extraIsOn(extra, spa, oceanView, setting),
  ).map((extra) => extra.label);

  const setAreasOpen = useCallback((open: boolean) => {
    setOpenMenu(open ? "areas" : null);
  }, []);
  const setExtrasOpen = useCallback((open: boolean) => {
    setOpenMenu(open ? "extras" : null);
  }, []);

  function setFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`, {
      scroll: false,
    });
  }

  const extrasLabel =
    extrasOn.length === 0
      ? "Extras"
      : extrasOn.length === 1
        ? extrasOn[0]
        : `Extras (${extrasOn.length})`;

  return (
    <div
      role="group"
      aria-label="Listing filters"
      className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
    >
      <FilterDropdown
        id={areasId}
        label={active || "All areas"}
        active={Boolean(active)}
        open={openMenu === "areas"}
        ariaHasPopup="listbox"
        onOpenChange={setAreasOpen}
      >
        <div role="listbox" aria-label="Areas">
          <button
            type="button"
            role="option"
            aria-selected={!active}
            className={extraItemClass(!active)}
            onClick={() => {
              setFilter("location", null);
              setOpenMenu(null);
            }}
          >
            All areas
          </button>
          {options.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={active === loc}
              className={extraItemClass(active === loc)}
              onClick={() => {
                setFilter("location", loc);
                setOpenMenu(null);
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </FilterDropdown>

      <FilterDropdown
        id={extrasId}
        label={extrasLabel}
        active={extrasOn.length > 0}
        open={openMenu === "extras"}
        ariaHasPopup="true"
        onOpenChange={setExtrasOpen}
      >
        <div role="group" aria-label="Extras">
          {EXTRAS.map((extra) => {
            const on = extraIsOn(extra, spa, oceanView, setting);
            const inputId = `${extrasId}-${extra.key}`;
            return (
              <label key={extra.key} htmlFor={inputId} className={extraItemClass(on)}>
                <input
                  id={inputId}
                  type="checkbox"
                  className="accent-sea"
                  checked={on}
                  onChange={() =>
                    setFilter(extra.param, on ? null : extra.value)
                  }
                />
                {extra.label}
              </label>
            );
          })}
        </div>
      </FilterDropdown>

      <FilterChip
        active={pets}
        tone="sunset"
        onClick={() => setFilter("pets", pets ? null : "1")}
      >
        Dog friendly
      </FilterChip>

      <span className="mx-1 h-6 w-px shrink-0 bg-drift" aria-hidden />

      <label className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
        Sleeps
        <select
          className={selectClass}
          value={sleeps ?? ""}
          aria-label="Sleeps"
          onChange={(event) =>
            setFilter("sleeps", event.target.value || null)
          }
        >
          <option value="">All</option>
          {SLEEPS_BANDS.map((band) => (
            <option key={band.id} value={band.id}>
              {band.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sea-deep/80">
        Bedrooms
        <select
          className={selectClass}
          value={bedrooms ?? ""}
          aria-label="Bedrooms"
          onChange={(event) =>
            setFilter("bedrooms", event.target.value || null)
          }
        >
          <option value="">All</option>
          {BEDROOM_FILTERS.map((band) => (
            <option key={band.id} value={band.id}>
              {band.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
