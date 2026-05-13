import { requireProfile } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function AktivitaetenDashboardPage() {
  const profile = await requireProfile();
  if (profile.role === "PARENT") return null;

  const where = profile.role === "INSTRUCTOR" ? { instructorId: profile.id } : {};

  const activities = await prisma.activity.findMany({
    where,
    include: {
      phase: { select: { name: true } },
      instructor: { select: { firstName: true, lastName: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Aktivitäten</h1>
        <Link href="/dashboard/aktivitaeten/neu" className="btn btn-primary btn-sm">Neue Aktivität</Link>
      </div>

      {activities.length === 0 ? (
        <p className="text-base-content/60">Noch keine Aktivitäten vorhanden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Titel</th>
                {profile.role === "ADMIN" && <th>Leitung</th>}
                <th>Phase</th>
                <th>Status</th>
                <th>Teilnehmende</th>
                <th>Kapazität</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.title}</td>
                  {profile.role === "ADMIN" && <td className="text-sm">{a.instructor.firstName} {a.instructor.lastName}</td>}
                  <td className="text-sm text-base-content/60">{a.phase.name}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a._count.registrations}</td>
                  <td>{a.capacity}</td>
                  <td>
                    <Link href={`/dashboard/aktivitaeten/${a.id}`} className="btn btn-xs btn-ghost">Bearbeiten</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
