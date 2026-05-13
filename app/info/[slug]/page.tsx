import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.infoPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-primary text-primary-content px-6 shadow">
        <div className="flex-1"><Link href="/" className="text-xl font-bold">Freizeit Luzern</Link></div>
      </header>
      <main className="flex-1 py-12 px-6 max-w-3xl mx-auto w-full">
        <article className="prose lg:prose-lg max-w-none">
          <h1>{page.title}</h1>
          <div className="whitespace-pre-wrap">{page.body}</div>
        </article>
      </main>
      <footer className="bg-base-200 text-base-content/60 text-sm py-6 px-6 text-center">
        © {new Date().getFullYear()} Freizeit Luzern · Stadt Luzern
      </footer>
    </div>
  );
}
