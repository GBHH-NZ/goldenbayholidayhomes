import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";
import { assetPath } from "@/lib/env";
import { markdownToHtml } from "@/lib/markdown";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    images: post.image ? [{ url: post.image }] : undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const html = markdownToHtml(post.content);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm text-muted">{post.date}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{post.description}</p>
        {post.image ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-drift">
            <Image
              src={assetPath(post.image)}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}
        <article
          className="prose-gb mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </>
  );
}
