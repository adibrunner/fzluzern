import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { ActivityStatus } from "@/app/generated/prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role === "PARENT") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const isOwner = activity.instructorId === profile.id;
  if (!isOwner && profile.role !== "ADMIN") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const { title, description, capacity, minAge, maxAge, location, startDate, endDate, status } = await req.json();

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      title: title ?? activity.title,
      description: description ?? activity.description,
      capacity: capacity != null ? Number(capacity) : activity.capacity,
      minAge: minAge ?? activity.minAge,
      maxAge: maxAge ?? activity.maxAge,
      location: location ?? activity.location,
      startDate: startDate ? new Date(startDate) : activity.startDate,
      endDate: endDate ? new Date(endDate) : activity.endDate,
      status: status ? (status as ActivityStatus) : activity.status,
    },
  });

  return NextResponse.json({ activity: updated });
}
