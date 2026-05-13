import { requireProfile } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ActivityEditForm from "./ActivityEditForm";

export default async function ActivityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  if (profile.role === "PARENT") notFound();
  const { id } = await params;

  const [activity, phases] = await Promise.all([
    prisma.activity.findUnique({ where: { id }, include: { phase: true } }),
    prisma.coursePhase.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!activity) notFound();
  if (profile.role === "INSTRUCTOR" && activity.instructorId !== profile.id) notFound();

  const registrations = await prisma.registration.findMany({
    where: { activityId: id, status: { not: "CANCELLED" } },
    include: { child: { select: { firstName: true, lastName: true, dateOfBirth: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  return <ActivityEditForm activity={activity} phases={phases} registrations={registrations} isAdmin={profile.role === "ADMIN"} />;
}
