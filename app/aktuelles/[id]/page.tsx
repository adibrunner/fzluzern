import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { id },
    include: { author: { select: { firstName: true, lastName: true } } },
  });
  if (!post || !post.publishedAt) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-primary text-primary-content px-6 shadow">
        <div className="flex-1"><Link href="/" className="text-xl font-bold">Freizeit Luzern</Link></div>
        <div className="flex-none gap-2">
          <Link href="/aktuelles" className="btn btn-ghost btn-sm">← Aktuelles</Link>
        </div>
      </header>
      <main className="flex-1 py-12 px-6 max-w-3xl mx-auto w-full">
        <article className="prose lg:prose-lg max-w-none">
          <h1>{post.title}</h1>
          <p className="text-base-content/50 text-sm not-prose mb-6">
            {post.author.firstName} {post.author.lastName} · {new Date(post.publishedAt).toLocaleDateString("de-CH")}
          </p>
          <div className="whitespace-pre-wrap">{post.body}</div>
        </article>
      </main>
      <footer className="bg-base-200 text-base-content/60 text-sm py-6 px-6 text-center">
        © {new Date().getFullYear()} Freizeit Luzern · Stadt Luzern
      </footer>
    </div>
  );
}
