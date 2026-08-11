import { CONTACT } from "@/lib/env";

const PROPERTIES_PATH = "/properties?minOccupancy=1&adults=1";

export function GuestyPropertiesEmbed() {
  const src = `${CONTACT.guestyBookings}${PROPERTIES_PATH}`;

  return (
    <div className="w-full">
      <p className="mb-3 text-sm text-muted">
        If the catalogue does not appear below, enable{" "}
        <span className="font-medium text-ink">
          Allow site to be loaded in an iframe
        </span>{" "}
        in Guesty (Settings → Site SSL), or{" "}
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
        className="min-h-[min(100vh,56rem)] w-full border-0 bg-foam/30"
        referrerPolicy="no-referrer-when-downgrade"
        allow="payment *"
      />
    </div>
  );
}
