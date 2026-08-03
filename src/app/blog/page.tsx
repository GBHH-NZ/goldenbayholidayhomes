import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/Header";
import { getAllBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Travel tips for Golden Bay — beaches, walks, dog-friendly stays, and why booking direct helps.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
          Blog
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Ideas and local tips for your Golden Bay holiday.
        </p>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden bg-drift">
                <Image
                  src={post.image ?? "/images/og-default.svg"}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="mt-3 text-xs text-muted">{post.date}</p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-sea-deep group-hover:text-sea">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{post.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
