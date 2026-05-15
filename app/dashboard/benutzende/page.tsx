import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import BenutzendeListe from "./BenutzendeListe";

export default async function BenutzendePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rolle?: string; sort?: string }>;
}) {
  await requireRole("ADMIN");
  const { q, rolle, sort } = await searchParams;

  const where = {
    AND: [
      q ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      } : {},
      rolle ? { role: rolle as "PARENT" | "INSTRUCTOR" | "ADMIN" } : {},
    ],
  };

  const orderBy =
    sort === "email" ? { email: "asc" as const }
    : sort === "role" ? { role: "asc" as const }
    : { lastName: "asc" as const };

  const profiles = await prisma.profile.findMany({ where, orderBy });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Benutzende</h1>
      <BenutzendeListe profiles={profiles} currentQ={q ?? ""} currentRolle={rolle ?? ""} currentSort={sort ?? ""} />
    </div>
  );
}
