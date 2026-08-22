import type { Metadata } from "next";
import Image from "next/image";
import { ContactExtras } from "@/components/ContactExtras";
import { SiteHeader } from "@/components/Header";
import { getPageContent } from "@/lib/content";
import { CONTACT, assetPath } from "@/lib/env";
import { JsonLd } from "@/components/JsonLd";
import { buildPageMetadata, faqPageJsonLd } from "@/lib/seo";

type PageJson = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  intro?: string;
  heroImage?: string;
  heroAlt?: string;
  heroCaption?: string;
  sections?: { heading: string; body: string }[];
  faqs?: { q: string; a: string }[];
  testimonials?: { quote: string; name: string; location: string }[];
  benefits?: string[];
  earningsNote?: string;
  cta?: string;
  hours?: string;
  conditions?: string[];
  rules?: { heading: string; body: string }[];
};

function pageMeta(slug: string): Metadata {
  const page = getPageContent<PageJson>(slug);
  return buildPageMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription,
    path: `/${slug}`,
    images: page.heroImage
      ? [
          {
            url: page.heroImage,
            alt: page.heroAlt ?? page.heroCaption ?? page.title,
          },
        ]
      : undefined,
  });
}

function StaticPage({
  slug,
  children,
}: {
  slug: string;
  children?: React.ReactNode;
}) {
  const page = getPageContent<PageJson>(slug);
  return (
    <>
      <SiteHeader />
      {page.faqs?.length ? <JsonLd data={faqPageJsonLd(page.faqs)} /> : null}
      <main className="mx-auto min-w-0 max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep [overflow-wrap:anywhere]">
          {page.title}
        </h1>
        {page.heroImage ? (
          <figure className="mt-8">
            <div className="relative aspect-[4/3] overflow-hidden bg-drift">
              <Image
                src={assetPath(page.heroImage)}
                alt={
                  page.heroAlt ??
                  page.heroCaption ??
                  page.title
                }
                fill
                className="object-cover object-[50%_40%]"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            {page.heroCaption ? (
              <figcaption className="mt-3 text-sm italic text-muted">
                {page.heroCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : page.heroCaption ? (
          <p className="mt-2 text-sm italic text-muted">{page.heroCaption}</p>
        ) : null}
        {page.intro && <p className="mt-6 text-lg text-ink/90">{page.intro}</p>}
        {page.hours && <p className="mt-4 text-muted">{page.hours}</p>}
        {slug === "contact-and-support" && <ContactExtras />}
        {page.sections?.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep">
              {s.heading}
            </h2>
            {s.body.split("\n\n").map((para) => (
              <p key={para.slice(0, 40)} className="mt-3 text-ink/90">
                {para}
              </p>
            ))}
          </section>
        ))}
        {page.faqs && (
          <dl className="mt-10 space-y-6">
            {page.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-sea-deep">{f.q}</dt>
                <dd className="mt-2 text-ink/90">{f.a}</dd>
              </div>
            ))}
          </dl>
        )}
        {page.testimonials && (
          <div className="mt-10 space-y-8">
            {page.testimonials.map((t) => (
              <blockquote
                key={t.quote.slice(0, 24)}
                className="border-l-2 border-sea pl-5"
              >
                <p className="text-lg text-ink/90">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-2 text-sm text-muted">
                  — {t.name}, {t.location}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
        {page.benefits && (
          <ul className="mt-8 list-disc space-y-2 pl-5 text-ink/90">
            {page.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        {page.earningsNote && (
          <p className="mt-6 text-muted">{page.earningsNote}</p>
        )}
        {page.cta && <p className="mt-6 font-medium text-sea-deep">{page.cta}</p>}
        {page.conditions && (
          <ul className="mt-8 list-disc space-y-2 pl-5 text-ink/90">
            {page.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        {page.rules?.map((r) => (
          <section key={r.heading} className="mt-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sea-deep">
              {r.heading}
            </h2>
            <p className="mt-2 text-ink/90">{r.body}</p>
          </section>
        ))}
        {children}
        {slug === "list-your-home" && (
          <form
            className="mt-10 grid gap-3 border border-drift bg-foam/40 p-6"
            action={`mailto:${CONTACT.email}`}
            method="get"
          >
            <p className="font-semibold text-sea-deep">Enquire to list</p>
            <input
              name="subject"
              type="hidden"
              value="List my home enquiry"
            />
            <input
              required
              name="body"
              placeholder="Your name, property location, and a short note"
              className="border border-drift bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-sea px-4 py-2.5 text-sm font-medium text-white hover:bg-sea-deep"
            >
              Email us
            </button>
          </form>
        )}
      </main>
    </>
  );
}

export const aboutMetadata = () => pageMeta("about-us");

export function createMarketingPage(slug: string) {
  return {
    generateMetadata: async (): Promise<Metadata> => pageMeta(slug),
    Page: function Page() {
      return <StaticPage slug={slug} />;
    },
  };
}

export { StaticPage, pageMeta };
export type { PageJson };
