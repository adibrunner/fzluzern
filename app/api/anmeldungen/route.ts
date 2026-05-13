import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "PARENT") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { activityId, childId } = await req.json();
  if (!activityId || !childId) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: profile.id } });
  if (!child) return NextResponse.json({ error: "Kind nicht gefunden" }, { status: 404 });

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity || activity.status !== "REGISTRATION") {
    return NextResponse.json({ error: "Anmeldung nicht möglich" }, { status: 400 });
  }

  const existing = await prisma.registration.findUnique({ where: { activityId_childId: { activityId, childId } } });
  if (existing && existing.status !== "CANCELLED") {
    return NextResponse.json({ error: "Kind bereits angemeldet" }, { status: 409 });
  }

  const confirmedCount = await prisma.registration.count({ where: { activityId, status: "CONFIRMED" } });
  const spotsLeft = activity.capacity - confirmedCount;
  const newStatus = spotsLeft > 0 ? "CONFIRMED" : "WAITLISTED";

  let waitlistPos: number | null = null;
  if (newStatus === "WAITLISTED") {
    const lastWaitlisted = await prisma.registration.findFirst({
      where: { activityId, status: "WAITLISTED" },
      orderBy: { waitlistPos: "desc" },
    });
    waitlistPos = (lastWaitlisted?.waitlistPos ?? 0) + 1;
  }

  let registration;
  if (existing) {
    registration = await prisma.registration.update({
      where: { id: existing.id },
      data: { status: newStatus, waitlistPos, parentId: profile.id },
    });
  } else {
    registration = await prisma.registration.create({
      data: { activityId, childId, parentId: profile.id, status: newStatus, waitlistPos },
    });
  }

  return NextResponse.json({ registration, status: newStatus }, { status: 201 });
}
