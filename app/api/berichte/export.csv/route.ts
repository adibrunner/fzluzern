import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const activities = await prisma.activity.findMany({
    include: {
      phase: { select: { name: true } },
      instructor: { select: { firstName: true, lastName: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: [{ phase: { createdAt: "desc" } }, { title: "asc" }],
  });

  const rows = [
    ["Phase", "Aktivität", "Leitung", "Status", "Bestätigt", "Kapazität", "Auslastung %"],
    ...activities.map((a) => [
      a.phase.name,
      a.title,
      `${a.instructor.firstName} ${a.instructor.lastName}`,
      a.status,
      String(a._count.registrations),
      String(a.capacity),
      String(Math.round((a._count.registrations / a.capacity) * 100)),
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bericht-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
