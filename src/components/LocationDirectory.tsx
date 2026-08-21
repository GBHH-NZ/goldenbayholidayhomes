import Link from "next/link";
import { getLocationPages } from "@/lib/location-pages";

/** Crawlable links to every town landing page, with live home counts. */
export function LocationDirectory({
  heading = "Browse by town",
  className,
}: {
  heading?: string;
  className?: string;
}) {
  const pages = getLocationPages();
  if (pages.length === 0) return null;

  return (
    <section className={className} aria-labelledby="location-directory-heading">
      <h2
        id="location-directory-heading"
        className="text-sm font-medium uppercase tracking-wide text-sea"
      >
        {heading}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/holiday-homes/${page.slug}/`}
              className="inline-flex min-h-11 items-center bg-foam px-3 py-2 text-sm text-sea-deep transition hover:bg-drift/40"
            >
              {page.name}
              <span className="ml-2 text-muted">{page.homeCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
