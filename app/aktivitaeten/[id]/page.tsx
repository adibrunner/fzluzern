import { prisma } from "@/app/lib/prisma";
import { getProfile } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import AnmeldenButton from "./AnmeldenButton";

export default async function AktivitaetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [activity, profile] = await Promise.all([
    prisma.activity.findUnique({
      where: { id },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
        phase: true,
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
    }),
    getProfile(),
  ]);

  if (!activity) notFound();

  const confirmedCount = activity._count.registrations;
  const spotsLeft = activity.capacity - confirmedCount;
  const isOpen = activity.status === "REGISTRATION";

  let children: { id: string; firstName: string; lastName: string }[] = [];
  let existingRegistrations: { childId: string; status: string }[] = [];

  if (profile?.role === "PARENT") {
    [children, existingRegistrations] = await Promise.all([
      prisma.child.findMany({ where: { parentId: profile.id }, select: { id: true, firstName: true, lastName: true } }),
      prisma.registration.findMany({
        where: { parentId: profile.id, activityId: id },
        select: { childId: true, status: true },
      }),
    ]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-primary text-primary-content px-6 shadow">
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold">Freizeit Luzern</Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/aktivitaeten" className="btn btn-ghost btn-sm">Zurück</Link>
          <Link href="/auth/anmelden" className="btn btn-ghost btn-sm">Anmelden</Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-6 max-w-3xl mx-auto w-full">
        <div className="card bg-base-100 border border-base-200 shadow">
          <div className="card-body space-y-4">
            <h1 className="text-2xl font-bold">{activity.title}</h1>

            {activity.description && (
              <p className="text-base-content/70">{activity.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {activity.startDate && (
                <div><p className="text-base-content/50">Startdatum</p><p className="font-medium">{new Date(activity.startDate).toLocaleDateString("de-CH")}</p></div>
              )}
              {activity.endDate && (
                <div><p className="text-base-content/50">Enddatum</p><p className="font-medium">{new Date(activity.endDate).toLocaleDateString("de-CH")}</p></div>
              )}
              {activity.location && (
                <div><p className="text-base-content/50">Ort</p><p className="font-medium">{activity.location}</p></div>
              )}
              <div><p className="text-base-content/50">Leitung</p><p className="font-medium">{activity.instructor.firstName} {activity.instructor.lastName}</p></div>
              {(activity.minAge || activity.maxAge) && (
                <div><p className="text-base-content/50">Alter</p><p className="font-medium">{activity.minAge ?? "–"} bis {activity.maxAge ?? "–"} Jahre</p></div>
              )}
              <div>
                <p className="text-base-content/50">Plätze</p>
                <p className={`font-medium ${spotsLeft === 0 ? "text-error" : "text-success"}`}>
                  {spotsLeft > 0 ? `${spotsLeft} frei` : "Ausgebucht"} (von {activity.capacity})
                </p>
              </div>
            </div>

            {isOpen && profile?.role === "PARENT" && (
              <div className="border-t border-base-200 pt-4">
                <h2 className="font-semibold mb-3">Kind anmelden</h2>
                {children.length === 0 ? (
                  <p className="text-sm text-base-content/60">
                    Sie haben noch keine Kinder erfasst.{" "}
                    <Link href="/dashboard/kinder/neu" className="link link-primary">Kind hinzufügen</Link>
                  </p>
                ) : (
                  <AnmeldenButton
                    activityId={activity.id}
                    children={children}
                    existingRegistrations={existingRegistrations}
                    spotsLeft={spotsLeft}
                  />
                )}
              </div>
            )}

            {isOpen && !profile && (
              <div className="border-t border-base-200 pt-4">
                <p className="text-sm text-base-content/60">
                  <Link href="/auth/anmelden" className="link link-primary">Melden Sie sich an</Link>, um Ihr Kind anzumelden.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-base-200 text-base-content/60 text-sm py-6 px-6 text-center">
        © {new Date().getFullYear()} Freizeit Luzern · Stadt Luzern
      </footer>
    </div>
  );
}
