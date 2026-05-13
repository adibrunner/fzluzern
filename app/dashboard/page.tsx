import { requireProfile } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (profile.role === "ADMIN") return <AdminDashboard />;
  if (profile.role === "INSTRUCTOR") return <InstructorDashboard profileId={profile.id} />;
  return <ParentDashboard profileId={profile.id} firstName={profile.firstName} />;
}

async function ParentDashboard({ profileId, firstName }: { profileId: string; firstName: string }) {
  const [children, registrations] = await Promise.all([
    prisma.child.findMany({ where: { parentId: profileId } }),
    prisma.registration.findMany({
      where: { parentId: profileId, status: { not: "CANCELLED" } },
      include: { activity: true, child: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Willkommen, {firstName}!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Kinder</div>
          <div className="stat-value text-primary">{children.length}</div>
          <div className="stat-actions">
            <Link href="/dashboard/kinder" className="btn btn-sm btn-ghost">Verwalten</Link>
          </div>
        </div>
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Aktive Anmeldungen</div>
          <div className="stat-value text-secondary">{registrations.length}</div>
          <div className="stat-actions">
            <Link href="/dashboard/anmeldungen" className="btn btn-sm btn-ghost">Alle anzeigen</Link>
          </div>
        </div>
      </div>

      {registrations.length > 0 && (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-base">Neueste Anmeldungen</h2>
            <ul className="divide-y divide-base-200">
              {registrations.map((r) => (
                <li key={r.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{r.activity.title}</p>
                    <p className="text-sm text-base-content/60">{r.child.firstName} {r.child.lastName}</p>
                  </div>
                  <RegistrationBadge status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Link href="/aktivitaeten" className="btn btn-primary">Aktivitäten entdecken</Link>
    </div>
  );
}

async function InstructorDashboard({ profileId }: { profileId: string }) {
  const activities = await prisma.activity.findMany({
    where: { instructorId: profileId },
    include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leiter-Dashboard</h1>
      <div className="stat bg-base-200 rounded-xl w-fit">
        <div className="stat-title">Meine Aktivitäten</div>
        <div className="stat-value text-primary">{activities.length}</div>
      </div>
      <Link href="/dashboard/aktivitaeten/neu" className="btn btn-primary">Neue Aktivität erstellen</Link>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Titel</th><th>Status</th><th>Teilnehmende</th></tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td><Link href={`/dashboard/aktivitaeten/${a.id}`} className="link">{a.title}</Link></td>
                <td><ActivityStatusBadge status={a.status} /></td>
                <td>{a._count.registrations} / {a.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function AdminDashboard() {
  const [phases, activities, profiles] = await Promise.all([
    prisma.coursePhase.count(),
    prisma.activity.count(),
    prisma.profile.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin-Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Kursphasen</div>
          <div className="stat-value">{phases}</div>
          <div className="stat-actions"><Link href="/dashboard/phasen" className="btn btn-sm btn-ghost">Verwalten</Link></div>
        </div>
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Aktivitäten</div>
          <div className="stat-value">{activities}</div>
          <div className="stat-actions"><Link href="/dashboard/aktivitaeten" className="btn btn-sm btn-ghost">Verwalten</Link></div>
        </div>
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Benutzende</div>
          <div className="stat-value">{profiles}</div>
          <div className="stat-actions"><Link href="/dashboard/benutzende" className="btn btn-sm btn-ghost">Verwalten</Link></div>
        </div>
      </div>
    </div>
  );
}

function RegistrationBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "badge-success",
    WAITLISTED: "badge-warning",
    PENDING: "badge-info",
    CANCELLED: "badge-error",
  };
  const labels: Record<string, string> = {
    CONFIRMED: "Bestätigt",
    WAITLISTED: "Warteliste",
    PENDING: "Ausstehend",
    CANCELLED: "Storniert",
  };
  return <span className={`badge ${map[status] ?? "badge-ghost"}`}>{labels[status] ?? status}</span>;
}

function ActivityStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "badge-ghost",
    PUBLISHED: "badge-info",
    REGISTRATION: "badge-primary",
    ALLOCATION: "badge-warning",
    EXECUTION: "badge-success",
    REPORTING: "badge-secondary",
    ARCHIVED: "badge-neutral",
  };
  const labels: Record<string, string> = {
    DRAFT: "Entwurf",
    PUBLISHED: "Veröffentlicht",
    REGISTRATION: "Anmeldung",
    ALLOCATION: "Zuteilung",
    EXECUTION: "Durchführung",
    REPORTING: "Abschluss",
    ARCHIVED: "Archiviert",
  };
  return <span className={`badge ${map[status] ?? "badge-ghost"}`}>{labels[status] ?? status}</span>;
}
