import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function BerichtePage() {
  await requireRole("ADMIN");

  const phases = await prisma.coursePhase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      activities: {
        include: {
          instructor: { select: { firstName: true, lastName: true } },
          _count: {
            select: {
              registrations: { where: { status: "CONFIRMED" } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Berichte</h1>
        <Link href="/api/berichte/export.csv" className="btn btn-outline btn-sm">CSV exportieren</Link>
      </div>

      {phases.map((phase) => (
        <section key={phase.id} className="space-y-3">
          <h2 className="text-lg font-semibold border-b border-base-300 pb-2">{phase.name}</h2>
          {phase.activities.length === 0 ? (
            <p className="text-sm text-base-content/60">Keine Aktivitäten.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Aktivität</th>
                    <th>Leitung</th>
                    <th>Status</th>
                    <th>Bestätigt</th>
                    <th>Kapazität</th>
                    <th>Auslastung</th>
                  </tr>
                </thead>
                <tbody>
                  {phase.activities.map((a) => {
                    const confirmed = a._count.registrations;
                    const pct = Math.round((confirmed / a.capacity) * 100);
                    return (
                      <tr key={a.id}>
                        <td className="font-medium">{a.title}</td>
                        <td className="text-sm">{a.instructor.firstName} {a.instructor.lastName}</td>
                        <td><StatusBadge status={a.status} /></td>
                        <td>{confirmed}</td>
                        <td>{a.capacity}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <progress className="progress progress-primary w-16" value={pct} max={100} />
                            <span className="text-xs">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-ghost", PUBLISHED: "badge-info", REGISTRATION: "badge-primary",
    ALLOCATION: "badge-warning", EXECUTION: "badge-success", REPORTING: "badge-secondary", ARCHIVED: "badge-neutral",
  };
  const labels: Record<string, string> = {
    DRAFT: "Entwurf", PUBLISHED: "Veröffentlicht", REGISTRATION: "Anmeldung",
    ALLOCATION: "Zuteilung", EXECUTION: "Durchführung", REPORTING: "Abschluss", ARCHIVED: "Archiviert",
  };
  return <span className={`badge badge-sm ${map[status] ?? "badge-ghost"}`}>{labels[status] ?? status}</span>;
}
