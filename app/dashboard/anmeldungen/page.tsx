import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { CancelButton } from "./CancelButton";

export default async function AnmeldungenPage() {
  const profile = await requireRole("PARENT");

  const registrations = await prisma.registration.findMany({
    where: { parentId: profile.id },
    include: {
      activity: { include: { phase: { select: { name: true } } } },
      child: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = registrations.filter((r) => r.status !== "CANCELLED");
  const cancelled = registrations.filter((r) => r.status === "CANCELLED");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meine Anmeldungen</h1>

      {active.length === 0 ? (
        <p className="text-base-content/60">Keine aktiven Anmeldungen.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kind</th>
                <th>Aktivität</th>
                <th>Phase</th>
                <th>Status</th>
                <th>Angemeldet am</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {active.map((r) => (
                <tr key={r.id}>
                  <td>{r.child.firstName} {r.child.lastName}</td>
                  <td>{r.activity.title}</td>
                  <td className="text-sm text-base-content/60">{r.activity.phase.name}</td>
                  <td><StatusBadge status={r.status} waitlistPos={r.waitlistPos} /></td>
                  <td className="text-sm text-base-content/60">{new Date(r.createdAt).toLocaleDateString("de-CH")}</td>
                  <td>
                    {r.status !== "CANCELLED" && (
                      <CancelButton registrationId={r.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelled.length > 0 && (
        <details className="collapse collapse-arrow bg-base-200">
          <summary className="collapse-title font-medium text-sm">Stornierte Anmeldungen ({cancelled.length})</summary>
          <div className="collapse-content">
            <table className="table table-sm">
              <thead><tr><th>Kind</th><th>Aktivität</th><th>Storniert</th></tr></thead>
              <tbody>
                {cancelled.map((r) => (
                  <tr key={r.id} className="opacity-60">
                    <td>{r.child.firstName} {r.child.lastName}</td>
                    <td>{r.activity.title}</td>
                    <td>{new Date(r.updatedAt).toLocaleDateString("de-CH")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

function StatusBadge({ status, waitlistPos }: { status: string; waitlistPos: number | null }) {
  if (status === "CONFIRMED") return <span className="badge badge-success">Bestätigt</span>;
  if (status === "WAITLISTED") return <span className="badge badge-warning">Warteliste {waitlistPos ? `#${waitlistPos}` : ""}</span>;
  if (status === "PENDING") return <span className="badge badge-info">Ausstehend</span>;
  return <span className="badge badge-ghost">{status}</span>;
}
