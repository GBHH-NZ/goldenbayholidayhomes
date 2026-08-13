import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/env";

export function HostsVignette({
  intro,
  caption,
  image,
  imageAlt,
}: {
  intro: string;
  caption: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section aria-labelledby="hosts-heading" className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:px-6">
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden bg-drift">
            <Image
              src={assetPath(image)}
              alt={imageAlt}
              fill
              className="object-cover object-[50%_40%]"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
          <figcaption className="mt-3 text-sm italic text-muted">
            {caption}
          </figcaption>
        </figure>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sea">
            Your hosts
          </p>
          <h2
            id="hosts-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-sea-deep md:text-4xl"
          >
            Michael &amp; Katja
          </h2>
          <p className="mt-4 text-ink/90 leading-relaxed">{intro}</p>
          <Link
            href="/about-us"
            className="mt-6 inline-block text-sm font-semibold text-sea underline-offset-2 hover:underline"
          >
            About us
          </Link>
        </div>
      </div>
    </section>
  );
}
