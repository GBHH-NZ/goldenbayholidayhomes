import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/Header";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Simple markdown-ish rendering for headings and paragraphs
  const html = post.content
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const t = block.trim();
      if (t.startsWith("## ")) {
        return `<h2>${t.slice(3)}</h2>`;
      }
      return `<p>${t.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm text-muted">{post.date}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-sea-deep">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{post.description}</p>
        <article
          className="prose-gb mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </>
  );
}
