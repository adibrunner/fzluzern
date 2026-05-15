import { prisma } from "@/app/lib/prisma";
import PublicNavbar from "@/app/components/PublicNavbar";
import Link from "next/link";

export default async function AktivitaetenPage() {
  const activities = await prisma.activity.findMany({
    where: { status: { in: ["PUBLISHED", "REGISTRATION", "ALLOCATION", "EXECUTION"] } },
    include: {
      instructor: { select: { firstName: true, lastName: true } },
      phase: { select: { name: true } },
      executions: { orderBy: { startDate: "asc" }, take: 1 },
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "WAITLISTED"] } } } } },
    },
    orderBy: { title: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 px-6 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Aktivitäten</h1>
        <p className="text-base-content/60 mb-8">Entdecken Sie aktuelle Kursangebote für Kinder und Jugendliche.</p>

        {activities.length === 0 ? (
          <div className="text-center py-20 text-base-content/40">
            <p className="text-lg">Momentan sind keine Aktivitäten verfügbar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((a) => (
              <Link key={a.id} href={`/aktivitaeten/${a.id}`} className="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="card-title text-base leading-tight">{a.title}</h2>
                    <ActivityBadge status={a.status} />
                  </div>
                  {a.description && (
                    <p className="text-sm text-base-content/60 line-clamp-2">{a.description}</p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-base-content/50">
                    {a.executions[0] && <p>📅 {new Date(a.executions[0].startDate).toLocaleDateString("de-CH")}</p>}
                    {(a.executions[0]?.location ?? a.location) && <p>📍 {a.executions[0]?.location ?? a.location}</p>}
                    {(a.minAge || a.maxAge) && (
                      <p>👤 {a.minAge && `ab ${a.minAge} J.`}{a.minAge && a.maxAge && " – "}{a.maxAge && `bis ${a.maxAge} J.`}</p>
                    )}
                    <p>👥 {a._count.registrations} / {a.capacity} Plätze belegt</p>
                  </div>
                  <div className="text-xs text-base-content/40 mt-1">
                    Leitung: {a.instructor.firstName} {a.instructor.lastName}
                  </div>
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

function ActivityBadge({ status }: { status: string }) {
  if (status === "REGISTRATION") return <span className="badge badge-primary badge-sm">Anmeldung offen</span>;
  if (status === "EXECUTION") return <span className="badge badge-success badge-sm">Läuft</span>;
  return null;
}
