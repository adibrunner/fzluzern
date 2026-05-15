import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import PublicNavbar from "@/app/components/PublicNavbar";

export default async function AktuellesPage() {
  const posts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { firstName: true, lastName: true } } },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 py-12 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Aktuelles</h1>
        {posts.length === 0 ? (
          <p className="text-base-content/60">Noch keine Beiträge vorhanden.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((p) => (
              <Link key={p.id} href={`/aktuelles/${p.id}`} className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow block">
                <div className="card-body">
                  <h2 className="card-title">{p.title}</h2>
                  <p className="text-sm text-base-content/60 line-clamp-3">{p.body}</p>
                  <p className="text-xs text-base-content/40 mt-2">
                    {p.author.firstName} {p.author.lastName} · {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("de-CH") : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <footer className="bg-base-200 text-base-content/60 text-sm py-6 px-6 text-center">
        © {new Date().getFullYear()} Freizeit Luzern · Stadt Luzern
      </footer>
    </div>
  );
}
