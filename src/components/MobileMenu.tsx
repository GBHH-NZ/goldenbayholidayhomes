"use client";

import { useEffect, useState } from "react";
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

export function MobileMenu({ tone }: { tone: "light" | "dark" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const buttonClass =
    tone === "light"
      ? "border-white/70 text-white hover:bg-white/15"
      : "border-sea/40 text-sea-deep hover:bg-sea/10";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={`inline-flex min-h-11 items-center rounded-sm border px-2.5 py-2 text-sm font-semibold sm:px-3 ${buttonClass}`}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 bg-sea-deep/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-y-0 right-0 flex w-[min(20rem,100%)] flex-col bg-sand px-5 py-6 shadow-lg shadow-sea-deep/20"
            role="dialog"
            aria-modal="true"
            aria-label="Guest menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-sea-deep">
                Menu
              </p>
              <button
                type="button"
                className="text-sm font-medium text-sea underline-offset-2 hover:underline"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 text-base font-medium text-sea-deep">
              {guestLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2.5 hover:bg-foam"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#book-online"
                className="mt-2 rounded-md bg-sea px-2 py-2.5 text-center font-semibold text-white hover:bg-sea-deep"
                onClick={() => setOpen(false)}
              >
                Book Now
              </Link>
              <Link
                href="/list-your-home"
                className="rounded-md border border-sea px-2 py-2.5 text-center font-semibold text-sea hover:bg-foam"
                onClick={() => setOpen(false)}
              >
                List with us
              </Link>
              <a
                href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}
                className="px-2 py-2.5 text-sm text-muted"
              >
                Call {CONTACT.phoneFree}
              </a>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
