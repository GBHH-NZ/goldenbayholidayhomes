import Link from "next/link";
import { CONTACT } from "@/lib/env";

const contactAreaLinks = [
  { href: "/holiday-homes/pohara/", label: "Pohara" },
  { href: "/holiday-homes/collingwood/", label: "Collingwood" },
  { href: "/holiday-homes/tata-beach/", label: "Tata Beach" },
  { href: "/holiday-homes/patons-rock/", label: "Patons Rock" },
];

export function ContactExtras() {
  return (
    <section
      aria-labelledby="contact-details-heading"
      className="mt-8 border border-drift bg-foam/50 p-6"
    >
      <h2
        id="contact-details-heading"
        className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep"
      >
        Contact our local team
      </h2>
      <address className="mt-4 not-italic text-ink/90">
        <a
          href={`tel:${CONTACT.phoneMobile.replace(/\s/g, "")}`}
          className="font-medium text-sea underline-offset-2 hover:underline"
        >
          {CONTACT.phoneMobile}
        </a>
        <span className="text-muted"> mobile</span>
        <br />
        <a
          href={`tel:${CONTACT.phoneFree.replace(/\s/g, "")}`}
          className="font-medium text-sea underline-offset-2 hover:underline"
        >
          {CONTACT.phoneFree}
        </a>
        <span className="text-muted"> freephone</span>
        <br />
        <a
          href={`mailto:${CONTACT.email}`}
          className="font-medium text-sea underline-offset-2 hover:underline"
        >
          {CONTACT.email}
        </a>
      </address>
      <p className="mt-3 text-sm">
        You can also{" "}
        <a
          href={CONTACT.facebook}
          className="font-semibold text-sea underline-offset-2 hover:underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          message us on Facebook
        </a>
        {CONTACT.instagram ? (
          <>
            {" "}
            or{" "}
            <a
              href={CONTACT.instagram}
              className="font-semibold text-sea underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              follow us on Instagram
            </a>
          </>
        ) : null}
        .
      </p>
      <p className="mt-2 text-sm">
        <a
          href={CONTACT.mapsUrl}
          className="font-semibold text-sea underline-offset-2 hover:underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          {CONTACT.googleBusiness
            ? "Open our Google Business Profile"
            : "Find us on Google Maps"}
        </a>
      </p>

      <div className="mt-6 border-t border-drift pt-5">
        <p className="font-semibold text-sea-deep">
          Find holiday homes by town
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {contactAreaLinks.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                className="font-medium text-sea underline-offset-2 hover:underline"
              >
                {area.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
