"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** Tall enough for FareHarbor / Guesty checkout; inner page still scrolls. */
export const BOOKING_IFRAME_CLASS =
  "h-[min(85vh,56.25rem)] min-h-[min(70vh,56.25rem)] w-full max-w-full border-0 bg-foam/30";

export type DismissInsideRef = { readonly current: HTMLElement | null };

/** Close an open booking panel on outside pointerdown or Escape. */
export function useDismissOnOutside(
  enabled: boolean,
  onDismiss: () => void,
  ...insideRefs: DismissInsideRef[]
) {
  const onDismissRef = useRef(onDismiss);
  const insideRefsRef = useRef(insideRefs);

  useLayoutEffect(() => {
    onDismissRef.current = onDismiss;
    insideRefsRef.current = insideRefs;
  });

  useEffect(() => {
    if (!enabled) return;

    function isInside(target: EventTarget | null) {
      if (!(target instanceof Node)) return false;
      return insideRefsRef.current.some((ref) => ref.current?.contains(target));
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      if (isInside(event.target)) return;
      onDismissRef.current();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onDismissRef.current();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);
}

export function BookingEmbedPanel({
  src,
  title,
  heading = "Live availability",
  onClose,
}: {
  src: string;
  title: string;
  heading?: string;
  onClose?: () => void;
}) {
  return (
    <div className="border-t border-drift/70 bg-foam/30">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-sea-deep px-4 py-2 text-foam">
        <p className="text-sm font-semibold">{heading}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="font-medium underline-offset-2 hover:underline"
            >
              Close
            </button>
          ) : null}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-2 hover:underline"
          >
            Open in a new tab
          </a>
        </div>
      </div>
      <iframe
        title={title}
        src={src}
        className={BOOKING_IFRAME_CLASS}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="payment *"
      />
    </div>
  );
}
