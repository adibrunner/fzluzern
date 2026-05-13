import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function CmsPage() {
  await requireRole("ADMIN");

  const [newsPosts, infoPages] = await Promise.all([
    prisma.newsPost.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { firstName: true, lastName: true } } } }),
    prisma.infoPage.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">CMS</h1>

      {/* News */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">News-Beiträge</h2>
          <Link href="/dashboard/cms/news/neu" className="btn btn-primary btn-sm">Neuer Beitrag</Link>
        </div>
        {newsPosts.length === 0 ? (
          <p className="text-base-content/60 text-sm">Noch keine Beiträge.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Titel</th><th>Autor</th><th>Veröffentlicht</th><th></th></tr></thead>
              <tbody>
                {newsPosts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="text-sm text-base-content/60">{p.author.firstName} {p.author.lastName}</td>
                    <td>
                      {p.publishedAt
                        ? <span className="badge badge-success badge-sm">{new Date(p.publishedAt).toLocaleDateString("de-CH")}</span>
                        : <span className="badge badge-ghost badge-sm">Entwurf</span>}
                    </td>
                    <td><Link href={`/dashboard/cms/news/${p.id}`} className="btn btn-xs btn-ghost">Bearbeiten</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Info Pages */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Info-Seiten</h2>
          <Link href="/dashboard/cms/seiten/neu" className="btn btn-primary btn-sm">Neue Seite</Link>
        </div>
        {infoPages.length === 0 ? (
          <p className="text-base-content/60 text-sm">Noch keine Seiten.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Titel</th><th>Slug</th><th>Aktualisiert</th><th></th></tr></thead>
              <tbody>
                {infoPages.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.title}</td>
                    <td className="text-sm font-mono text-base-content/60">{p.slug}</td>
                    <td className="text-sm text-base-content/60">{new Date(p.updatedAt).toLocaleDateString("de-CH")}</td>
                    <td><Link href={`/dashboard/cms/seiten/${p.id}`} className="btn btn-xs btn-ghost">Bearbeiten</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
