import { CONTACT } from "@/lib/env";

const PROPERTIES_PATH = "/properties?minOccupancy=1&adults=1";

export function GuestyPropertiesEmbed({
  id = "book-online",
}: {
  id?: string;
}) {
  const src = `${CONTACT.guestyBookings}${PROPERTIES_PATH}`;

  return (
    <div id={id} className="w-full scroll-mt-24">
      <p className="mb-3 text-sm text-muted">
        Browse availability and book below, or{" "}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sea underline-offset-2 hover:underline"
        >
          open the booking catalogue
        </a>
        .
      </p>
      <iframe
        title="Golden Bay Holiday Homes booking catalogue"
        src={src}
        loading="lazy"
        className="min-h-[min(120vh,72rem)] w-full border-0 bg-foam/30"
        referrerPolicy="no-referrer-when-downgrade"
        allow="payment *"
      />
    </div>
  );
}
