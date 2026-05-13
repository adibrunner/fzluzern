import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import PhaseEditForm from "./PhaseEditForm";

export default async function PhaseEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const phase = await prisma.coursePhase.findUnique({ where: { id } });
  if (!phase) notFound();
  return <PhaseEditForm phase={phase} />;
}
