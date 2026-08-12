import { clsx } from "clsx";
import {
  defaultGuestyPropertiesUrl,
  isGuestyPropertyUrl,
} from "@/lib/guesty/properties-url";

export function GuestyPropertiesEmbed({
  id,
  src,
  height,
  filtered = false,
}: {
  id?: string;
  src?: string;
  height?: number;
  filtered?: boolean;
}) {
  const resolvedSrc = src ?? defaultGuestyPropertiesUrl();
  const isProperty = isGuestyPropertyUrl(resolvedSrc);

  return (
    <div id={id} className="w-full scroll-mt-24">
      <iframe
        key={resolvedSrc}
        title="Golden Bay Holiday Homes booking catalogue"
        src={resolvedSrc}
        loading="lazy"
        style={height ? { height: `${height}px` } : undefined}
        className={clsx(
          "w-full border-0 bg-foam/30",
          height
            ? undefined
            : isProperty
              ? "min-h-[min(400vh,220rem)]"
              : filtered
                ? "min-h-[min(160vh,96rem)]"
                : "min-h-[min(120vh,72rem)]",
        )}
        referrerPolicy="no-referrer-when-downgrade"
        allow="payment *"
      />
    </div>
  );
}
