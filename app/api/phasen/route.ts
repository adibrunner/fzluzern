import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function GET() {
  const phases = await prisma.coursePhase.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ phases });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { name, registrationStart, registrationEnd, allocationDate, executionStart, executionEnd } = await req.json();
  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });

  const phase = await prisma.coursePhase.create({
    data: {
      name,
      registrationStart: registrationStart ? new Date(registrationStart) : null,
      registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
      allocationDate: allocationDate ? new Date(allocationDate) : null,
      executionStart: executionStart ? new Date(executionStart) : null,
      executionEnd: executionEnd ? new Date(executionEnd) : null,
    },
  });

  return NextResponse.json({ phase }, { status: 201 });
}
