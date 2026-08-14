"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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

/** Outside click / Escape asks before closing, so an open iframe is not destroyed immediately. */
export function useConfirmOutsideDismiss(
  enabled: boolean,
  onDismiss: () => void,
  ...insideRefs: DismissInsideRef[]
) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!enabled) setConfirming(false);
  }, [enabled]);

  useDismissOnOutside(
    enabled && !confirming,
    () => setConfirming(true),
    ...insideRefs,
  );

  return {
    confirming,
    confirm() {
      setConfirming(false);
      onDismiss();
    },
    cancel() {
      setConfirming(false);
    },
  };
}

export function ConfirmCloseDialog({
  title = "Close the booking panel?",
  description = "You can keep it open if you still need live availability.",
  confirmLabel = "Close",
  cancelLabel = "Keep open",
  onConfirm,
  onCancel,
}: {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);

  useLayoutEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function focusables() {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLButtonElement>("button"),
      ).filter((el) => !el.disabled);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !dialogRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-sea-deep/40"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border border-drift/70 bg-sand p-5 shadow-lg shadow-sea-deep/20"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep"
        >
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-md border border-sea px-4 py-2.5 text-sm font-semibold text-sea hover:bg-foam"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 py-2.5 text-sm font-semibold text-white hover:bg-sea-deep"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
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
