import type { GuestReview } from "@/lib/content";

export function ListingGuestQuotes({ quotes }: { quotes: GuestReview[] }) {
  if (quotes.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
        What guests say
      </h2>
      <ul className="mt-4 space-y-5">
        {quotes.map((quote) => (
          <li key={`${quote.name}-${quote.quote.slice(0, 40)}`}>
            <figure>
              <blockquote className="text-sm leading-relaxed text-ink/90">
                “{quote.quote}”
              </blockquote>
              <figcaption className="mt-2 text-xs font-semibold uppercase tracking-wide text-sea">
                {quote.name}
                {quote.location ? (
                  <span className="font-normal text-muted">
                    {" "}
                    · {quote.location}
                  </span>
                ) : null}
                {quote.source ? (
                  <span className="font-normal text-muted">
                    {" "}
                    · via{" "}
                    {quote.sourceUrl ? (
                      <a
                        href={quote.sourceUrl}
                        className="underline-offset-2 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {quote.source}
                      </a>
                    ) : (
                      quote.source
                    )}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
