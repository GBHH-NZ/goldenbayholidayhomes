import type { GuestReview } from "@/lib/content";
import type { HomesReviewAggregate } from "@/lib/homes/filters";

export function ReviewsBand({
  stats,
  quotes = [],
}: {
  stats: HomesReviewAggregate;
  quotes?: GuestReview[];
}) {
  if (stats.reviewCount === 0 || stats.reviewedHomeCount === 0) return null;

  const average = stats.averageScore.toFixed(1);
  const reviews = stats.reviewCount.toLocaleString("en-NZ");
  const featured = quotes.slice(0, 3);

  return (
    <section
      aria-label="Guest reviews"
      className="border-y border-drift/50 bg-foam/50 py-8 md:py-10"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-sea-deep">
          <span className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
            {average}
          </span>
          <span className="text-muted"> / 10 average guest score</span>
          <span className="mt-1 block text-sm text-muted md:mt-0 md:inline">
            <span className="hidden md:inline"> · </span>
            {reviews} reviews across {stats.reviewedHomeCount} of{" "}
            {stats.homeCount} homes
          </span>
        </p>

        {featured.length > 0 ? (
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((quote) => (
              <li key={`${quote.name}-${quote.quote.slice(0, 32)}`}>
                <figure className="h-full">
                  <blockquote className="text-sm leading-relaxed text-ink/90">
                    “{quote.quote}”
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-semibold uppercase tracking-wide text-sea">
                    {quote.name}
                    {quote.location ? (
                      <span className="font-normal text-muted">
                        {" "}
                        · {quote.location}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
