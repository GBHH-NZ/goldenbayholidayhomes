import type { HomesReviewAggregate } from "@/lib/homes/filters";

export function ReviewsBand({ stats }: { stats: HomesReviewAggregate }) {
  if (stats.reviewCount === 0 || stats.reviewedHomeCount === 0) return null;

  const average = stats.averageScore.toFixed(1);
  const reviews = stats.reviewCount.toLocaleString("en-NZ");

  return (
    <section
      aria-label="Guest reviews"
      className="border-y border-drift/50 bg-foam/50 py-8 md:py-10"
    >
      <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
        <p className="text-sea-deep">
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
      </div>
    </section>
  );
}
