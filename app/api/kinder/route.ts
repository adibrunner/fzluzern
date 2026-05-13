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

  const { firstName, lastName, dateOfBirth, emergencyName, emergencyPhone, medicalNotes } = await req.json();
  if (!firstName || !lastName || !dateOfBirth) {
    return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      parentId: profile.id,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      medicalNotes: medicalNotes || null,
    },
  });

  return NextResponse.json({ child }, { status: 201 });
}
