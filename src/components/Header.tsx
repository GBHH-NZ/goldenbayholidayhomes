import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/content";
import { assetPath, CONTACT } from "@/lib/env";

const OPS_LOGIN = `${assetPath("/ops/")}#/login`;

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
    variant === "light"
      ? "text-white drop-shadow"
      : "text-sea-deep";

  return (
    <span className="inline-flex items-center gap-2.5 md:gap-3">
      <Image
        src={assetPath(logo)}
        alt="Golden Bay Holiday Homes"
        width={dims.w}
        height={dims.h}
        className={`${dims.className} object-contain drop-shadow-md`}
        priority={size === "hero" || size === "nav"}
      />
      {size !== "hero" && (
        <span
          className={`font-[family-name:var(--font-display)] text-base font-semibold tracking-tight md:text-lg ${labelClass}`}
        >
          Golden Bay Holiday Homes
        </span>
      )}
    </span>
  );
}

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
        <Link href="/" className="shrink-0">
          <BrandMark variant="light" size="nav" />
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
          <a
            href={OPS_LOGIN}
            className="rounded-sm border border-white/50 px-3 py-1.5 transition hover:bg-white/15"
          >
            Staff login
          </a>
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
        <a href={OPS_LOGIN} className="whitespace-nowrap font-semibold">
          Staff login
        </a>
      </nav>
    </header>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-drift/60 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="shrink-0">
          <BrandMark variant="dark" size="nav" />
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
          <a
            href={OPS_LOGIN}
            className="rounded-sm border border-sea/40 px-3 py-1.5 text-sea-deep transition hover:bg-sea/10"
          >
            Staff login
          </a>
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
          <Link href="/" className="inline-block">
            <BrandMark variant="light" size="footer" />
          </Link>
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
            <li>
              <a href={OPS_LOGIN} className="hover:text-white">
                Staff login
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
