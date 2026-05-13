import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) return NextResponse.json({ error: "Anmeldung nicht gefunden" }, { status: 404 });

  const isOwner = registration.parentId === profile.id;
  const isAdmin = profile.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  await prisma.registration.update({ where: { id }, data: { status: "CANCELLED", waitlistPos: null } });

  // Promote next waitlisted if spot freed
  if (registration.status === "CONFIRMED") {
    const next = await prisma.registration.findFirst({
      where: { activityId: registration.activityId, status: "WAITLISTED" },
      orderBy: { waitlistPos: "asc" },
    });
    if (next) {
      await prisma.registration.update({ where: { id: next.id }, data: { status: "CONFIRMED", waitlistPos: null } });
      // Shift remaining waitlist positions
      await prisma.registration.updateMany({
        where: { activityId: registration.activityId, status: "WAITLISTED", waitlistPos: { gt: next.waitlistPos ?? 0 } },
        data: { waitlistPos: { decrement: 1 } },
      });
    }
  }

  return NextResponse.json({ success: true });
}
