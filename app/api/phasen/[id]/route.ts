import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { PhaseStatus } from "@/app/generated/prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await req.json();
  const phase = await prisma.coursePhase.update({
    where: { id },
    data: {
      name: body.name,
      status: body.status ? (body.status as PhaseStatus) : undefined,
      registrationStart: body.registrationStart ? new Date(body.registrationStart) : undefined,
      registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : undefined,
      allocationDate: body.allocationDate ? new Date(body.allocationDate) : undefined,
      executionStart: body.executionStart ? new Date(body.executionStart) : undefined,
      executionEnd: body.executionEnd ? new Date(body.executionEnd) : undefined,
    },
  });

  return NextResponse.json({ phase });
}
