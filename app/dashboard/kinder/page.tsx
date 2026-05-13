import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function KinderPage() {
  const profile = await requireRole("PARENT");
  const children = await prisma.child.findMany({
    where: { parentId: profile.id },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meine Kinder</h1>
        <Link href="/dashboard/kinder/neu" className="btn btn-primary btn-sm">Kind hinzufügen</Link>
      </div>

      {children.length === 0 ? (
        <div className="card bg-base-200 body-padding text-center py-12">
          <p className="text-base-content/60 mb-4">Sie haben noch keine Kinder erfasst.</p>
          <Link href="/dashboard/kinder/neu" className="btn btn-primary">Kind hinzufügen</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="card bg-base-100 border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-base">{child.firstName} {child.lastName}</h2>
                <p className="text-sm text-base-content/60">
                  Geburtsdatum: {new Date(child.dateOfBirth).toLocaleDateString("de-CH")}
                </p>
                {child.medicalNotes && (
                  <p className="text-sm text-warning">⚕ Medizinische Hinweise vorhanden</p>
                )}
                <div className="card-actions justify-end mt-2">
                  <Link href={`/dashboard/kinder/${child.id}`} className="btn btn-sm btn-ghost">Bearbeiten</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
