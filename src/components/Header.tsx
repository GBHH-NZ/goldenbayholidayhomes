import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { getSiteMedia } from "@/lib/content";
import { assetPath, CONTACT } from "@/lib/env";

const EMERGENCY_INFO =
  "https://www.nelsontasmancivildefence.co.nz/regions/golden-bay/";

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

function BrandMark({
  variant = "light",
  size = "nav",
}: {
  variant?: "light" | "dark";
  size?: "nav" | "footer" | "hero";
}) {
  const { logo } = getSiteMedia();
  const dims =
    size === "hero"
      ? { w: 220, h: 220, className: "h-28 w-28 md:h-40 md:w-40 lg:h-48 lg:w-48" }
      : size === "footer"
        ? { w: 72, h: 72, className: "h-14 w-14" }
        : { w: 48, h: 48, className: "h-10 w-10 md:h-11 md:w-11" };
  const labelClass =
    variant === "light" ? "text-white drop-shadow" : "text-sea-deep";

  return (
    <span className="inline-flex min-w-0 items-center gap-2 md:gap-3">
      <Image
        src={assetPath(logo)}
        alt="Golden Bay Holiday Homes"
        width={dims.w}
        height={dims.h}
        className={`${dims.className} shrink-0 object-contain drop-shadow-md`}
        priority={size === "hero" || size === "nav"}
      />
      {size !== "hero" && (
        <span
          className={`hidden font-[family-name:var(--font-display)] text-base font-semibold tracking-tight sm:inline md:text-lg ${labelClass}`}
        >
          Golden Bay Holiday Homes
        </span>
      )}
    </span>
  );
}

function GuestNav({ tone }: { tone: "light" | "dark" }) {
  const linkClass =
    tone === "light"
      ? "transition hover:text-white"
      : "transition hover:text-sea";
  const bookClass =
    tone === "light"
      ? "rounded-sm border border-white/70 bg-white/20 px-3 py-1.5 font-semibold backdrop-blur transition hover:bg-white/30"
      : "rounded-sm border border-sea bg-sea-deep px-3 py-1.5 font-semibold text-white transition hover:bg-sea";
  const listClass =
    tone === "light"
      ? "rounded-sm bg-white/15 px-3 py-1.5 font-semibold backdrop-blur transition hover:bg-white/25"
      : "rounded-sm bg-sea px-3 py-1.5 font-semibold text-white transition hover:bg-sea-deep";

  return (
    <nav
      aria-label="Primary"
      className={`hidden items-center gap-5 text-sm font-medium lg:flex ${
        tone === "light" ? "text-white/95" : "text-sea-deep/80"
      }`}
    >
      {guestLinks.map((l) => (
        <Link key={l.href} href={l.href} className={linkClass}>
          {l.label}
        </Link>
      ))}
      <Link href="/#book-online" className={bookClass}>
        Book Now
      </Link>
      <Link href="/list-your-home" className={listClass}>
        List with us
      </Link>
    </nav>
  );
}

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 overflow-x-clip">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:px-6 md:py-5">
        <Link href="/" className="min-w-0 shrink">
          <BrandMark variant="light" size="nav" />
        </Link>
        <GuestNav tone="light" />
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link
            href="/#book-online"
            className="inline-flex min-h-11 items-center rounded-sm border border-white/70 bg-white/20 px-2.5 py-2 text-sm font-semibold text-white backdrop-blur sm:px-3"
          >
            Book Now
          </Link>
          <MobileMenu tone="light" />
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <header className="overflow-x-clip border-b border-drift/60 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 md:px-6 md:py-4">
        <Link href="/" className="min-w-0 shrink">
          <BrandMark variant="dark" size="nav" />
        </Link>
        <GuestNav tone="dark" />
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link
            href="/#book-online"
            className="inline-flex min-h-11 items-center rounded-sm border border-sea bg-sea-deep px-2.5 py-2 text-sm font-semibold text-white sm:px-3"
          >
            Book Now
          </Link>
          <MobileMenu tone="dark" />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-drift/50 bg-sea-deep text-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <Link href="/" className="inline-block">
            <BrandMark variant="light" size="footer" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-foam/75">
            Handpicked homes. Hotel comfort. Heartfelt hospitality.
          </p>
          <p className="mt-4 text-sm">
            <a
              href={CONTACT.facebook}
              className="hover:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              Facebook
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-foam/60">
            Guest information
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={EMERGENCY_INFO}
                className="hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                Emergency Information
              </a>
            </li>
            {guestLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#book-online" className="hover:text-white">
                Book Now
              </Link>
            </li>
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

export { BrandMark };
