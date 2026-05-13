import Link from "next/link";
import { prisma } from "./lib/prisma";

export default async function HomePage() {
  const newsPosts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { author: true },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="navbar bg-primary text-primary-content px-6 shadow">
        <div className="flex-1">
          <span className="text-xl font-bold">Freizeit Luzern</span>
        </div>
        <div className="flex-none gap-2">
          <Link href="/aktivitaeten" className="btn btn-ghost btn-sm">Aktivitäten</Link>
          <Link href="/aktuelles" className="btn btn-ghost btn-sm">Aktuelles</Link>
          <Link href="/auth/anmelden" className="btn btn-primary-content btn-sm border border-primary-content">Anmelden</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-focus text-primary-content py-20 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Freizeit für Kinder und Jugendliche in Luzern</h1>
        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
          Entdecken Sie Kursangebote, melden Sie Ihre Kinder an und verwalten Sie alles an einem Ort.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/aktivitaeten" className="btn btn-white text-primary">Aktivitäten entdecken</Link>
          <Link href="/auth/registrieren" className="btn btn-outline btn-white">Jetzt registrieren</Link>
        </div>
      </section>

      {/* News */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6">Aktuelles</h2>
        {newsPosts.length === 0 ? (
          <p className="text-base-content/60">Noch keine Beiträge vorhanden.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsPosts.map((post) => (
              <Link key={post.id} href={`/aktuelles/${post.id}`} className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow">
                <div className="card-body">
                  <h3 className="card-title text-base">{post.title}</h3>
                  <p className="text-sm text-base-content/60 line-clamp-3">{post.body}</p>
                  <p className="text-xs text-base-content/40 mt-2">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("de-CH") : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/aktuelles" className="link link-primary">Alle Beiträge →</Link>
        </div>
      </section>

      <footer className="mt-auto bg-base-200 text-base-content/60 text-sm py-6 px-6 text-center">
        © {new Date().getFullYear()} Freizeit Luzern · Stadt Luzern
      </footer>
    </div>
  );
}
