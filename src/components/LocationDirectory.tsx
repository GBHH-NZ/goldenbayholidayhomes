import Link from "next/link";
import { getActiveLocationPages } from "@/lib/location-pages";

export function LocationDirectory({
  heading = "Holiday homes by area",
}: {
  heading?: string;
}) {
  const pages = getActiveLocationPages();
  if (pages.length === 0) return null;

  return (
    <section id="areas" aria-labelledby="areas-heading" className="mt-10">
      <h2
        id="areas-heading"
        className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep"
      >
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Dedicated pages for each Golden Bay town we host in — unique local
        notes, FAQs, and the homes available there.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/holiday-homes/${page.slug}/`}
              className="font-medium text-sea underline-offset-2 hover:underline"
            >
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
