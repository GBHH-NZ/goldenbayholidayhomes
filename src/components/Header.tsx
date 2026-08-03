import Link from "next/link";
import { CONTACT } from "@/lib/env";

const guestLinks = [
  { href: "/homes", label: "Homes" },
  { href: "/explore-golden-bay", label: "Explore" },
  { href: "/blog", label: "Blog" },
  { href: "/price-match", label: "Price Match" },
  { href: "/contact-and-support", label: "Contact" },
  { href: "/about-us", label: "About" },
];

const ownerLinks = [
  { href: "/list-your-home", label: "List Your Home" },
  { href: "/owner-faqs", label: "Owner FAQs" },
  { href: "/what-our-homeowners-say", label: "Testimonials" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white drop-shadow md:text-xl"
        >
          Golden Bay Holiday Homes
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-sm font-medium text-white/95 lg:flex"
        >
          {guestLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/list-your-home"
            className="rounded-sm bg-white/15 px-3 py-1.5 backdrop-blur transition hover:bg-white/25"
          >
            List Your Home
          </Link>
        </nav>
        <a
          href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}
          className="text-sm text-white/90 lg:hidden"
        >
          Call
        </a>
      </div>
      <nav
        aria-label="Mobile"
        className="flex gap-3 overflow-x-auto px-4 pb-3 text-xs text-white/90 lg:hidden"
      >
        {guestLinks.slice(0, 5).map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-drift/60 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep md:text-xl"
        >
          Golden Bay Holiday Homes
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-sm font-medium text-sea-deep/80 lg:flex"
        >
          {guestLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition hover:text-sea"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/list-your-home"
            className="rounded-sm bg-sea px-3 py-1.5 text-white transition hover:bg-sea-deep"
          >
            List Your Home
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-drift/50 bg-sea-deep text-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Golden Bay Holiday Homes
          </p>
          <p className="mt-3 max-w-xs text-sm text-foam/75">
            Handpicked homes. Hotel comfort. Heartfelt hospitality.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foam/60">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {guestLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foam/60">
            Owners & legal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {ownerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cancellation-policy" className="hover:text-white">
                Cancellation Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <a
                href={CONTACT.guestyOwners}
                className="hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                Owner login
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm text-foam/75">
            <a href={`tel:${CONTACT.phoneMobile.replace(/\s/g, "")}`}>
              {CONTACT.phoneMobile}
            </a>
            <br />
            <a href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}>
              {CONTACT.phoneFree}
            </a>
            <br />
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-foam/50">
        © {new Date().getFullYear()} Golden Bay Holiday Homes · Tasman, New
        Zealand
      </div>
    </footer>
  );
}
