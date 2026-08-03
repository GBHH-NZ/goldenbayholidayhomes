import type { Home } from "@/lib/homes/types";
import { bookingUrl } from "@/lib/homes/types";
import { CONTACT } from "@/lib/env";

export function BookCta({ home }: { home: Home }) {
  const url = bookingUrl(home);
  const synced = home.syncStatus === "synced" && Boolean(home.guestyId);

  return (
    <aside className="border border-drift bg-foam/60 p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
        Book this stay
      </h2>
      <p className="mt-2 text-sm text-muted">
        {synced
          ? "Availability and secure checkout are handled on our Guesty booking engine."
          : "Full photos, amenities, and a direct property booking link will appear after Guesty catalogue sync. You can still browse and book via our booking engine."}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-sea px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sea-deep"
      >
        {synced ? "Check availability" : "Open booking engine"}
      </a>
      <p className="mt-3 text-xs text-muted">
        Or call{" "}
        <a href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}>
          {CONTACT.phoneFree}
        </a>
      </p>
      {home.syncStatus === "seed" && (
        <p className="mt-4 border-t border-drift pt-3 text-xs text-muted">
          Listing details pending Guesty API sync (
          <code className="text-[11px]">npm run sync:guesty</code>).
        </p>
      )}
    </aside>
  );
}
