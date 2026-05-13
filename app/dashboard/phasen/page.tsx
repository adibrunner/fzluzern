import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Entwurf",
  REGISTRATION_OPEN: "Anmeldung offen",
  REGISTRATION_CLOSED: "Anmeldung geschlossen",
  ALLOCATION: "Zuteilung",
  ACTIVE: "Aktiv",
  REPORTING: "Abschluss",
  ARCHIVED: "Archiviert",
};

export default async function PhasenPage() {
  await requireRole("ADMIN");

  const phases = await prisma.coursePhase.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activities: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kursphasen</h1>
        <Link href="/dashboard/phasen/neu" className="btn btn-primary btn-sm">Neue Phase</Link>
      </div>

      {phases.length === 0 ? (
        <p className="text-base-content/60">Noch keine Kursphasen vorhanden.</p>
      ) : (
        <div className="space-y-4">
          {phases.map((p) => (
            <div key={p.id} className="card bg-base-100 border border-base-200">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{p.name}</h2>
                    <p className="text-sm text-base-content/60 mt-1">
                      {p.registrationStart && `Anmeldung: ${new Date(p.registrationStart).toLocaleDateString("de-CH")}`}
                      {p.registrationEnd && ` – ${new Date(p.registrationEnd).toLocaleDateString("de-CH")}`}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">{p._count.activities} Aktivitäten</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusBadgeClass(p.status)}`}>{STATUS_LABELS[p.status] ?? p.status}</span>
                    <Link href={`/dashboard/phasen/${p.id}`} className="btn btn-sm btn-ghost">Bearbeiten</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    DRAFT: "badge-ghost", REGISTRATION_OPEN: "badge-primary", REGISTRATION_CLOSED: "badge-warning",
    ALLOCATION: "badge-info", ACTIVE: "badge-success", REPORTING: "badge-secondary", ARCHIVED: "badge-neutral",
  };
  return map[status] ?? "badge-ghost";
}
