import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role === "PARENT") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { title, description, phaseId, capacity, minAge, maxAge, location, executions } = await req.json();
  if (!title || !phaseId || !capacity) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      title,
      description: description || null,
      phaseId,
      instructorId: profile.id,
      capacity: Number(capacity),
      minAge: minAge ?? null,
      maxAge: maxAge ?? null,
      location: location || null,
      status: "DRAFT",
      executions: executions?.length
        ? {
            create: executions.map((ex: { startDate: string; endDate?: string; location?: string; notes?: string }) => ({
              startDate: new Date(ex.startDate),
              endDate: ex.endDate ? new Date(ex.endDate) : null,
              location: ex.location || null,
              notes: ex.notes || null,
            })),
          }
        : undefined,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
