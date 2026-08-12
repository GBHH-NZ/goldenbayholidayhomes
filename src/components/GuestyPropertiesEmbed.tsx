import { clsx } from "clsx";
import { defaultGuestyPropertiesUrl } from "@/lib/guesty/properties-url";

export function GuestyPropertiesEmbed({
  id = "book-online",
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

  return (
    <div id={id} className="w-full scroll-mt-24">
      <p className="mb-3 text-sm text-muted">
        Browse availability and book below, or{" "}
        <a
          href={resolvedSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sea underline-offset-2 hover:underline"
        >
          open the booking catalogue
        </a>
        .
      </p>
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
