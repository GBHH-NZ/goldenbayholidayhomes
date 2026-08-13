import Link from "next/link";
import { CONTACT } from "@/lib/env";

const RITUALS = [
  {
    title: "Hotel-quality linen",
    body: "Bed sheets, bath towels, hand towels, face washers, a bath mat, and tea towels are provided. Extra sets may be available on request for longer stays.",
    href: "/contact-and-support",
    linkLabel: "Linen FAQ",
  },
  {
    title: "Local 0800 support",
    body: `Monday–Friday, 9:00 am to 5:00 pm (NZST), and a 24/7 helpline on ${CONTACT.phoneFree} for urgent matters after hours.`,
    href: "/contact-and-support",
    linkLabel: "Contact & support",
  },
  {
    title: "Price-match promise",
    body: "Found the same property for less on Airbnb, Booking.com, or Expedia? We'll match the price on a like-for-like direct booking.",
    href: "/price-match",
    linkLabel: "Price Match",
  },
  {
    title: "Self check-in",
    body: "Lockbox codes arrive in your check-in details email. If you can't find it, call or text us.",
    href: "/contact-and-support",
    linkLabel: "Lockbox help",
  },
] as const;

export function StayRituals() {
  return (
    <section
      aria-label="How a stay works"
      className="border-y border-drift/50 bg-foam/50 py-12 md:py-16"
    >
        <div className="mx-auto max-w-6xl animate-fade-up px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {RITUALS.map((item) => (
            <article key={item.title}>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-3 inline-block text-sm font-medium text-sea underline-offset-2 hover:underline"
              >
                {item.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
