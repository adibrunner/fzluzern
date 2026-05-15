import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { Role } from "@/app/generated/prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const caller = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!caller || caller.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { role } = await req.json();
  if (!["PARENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Ungültige Rolle" }, { status: 400 });
  }

  const profile = await prisma.profile.update({
    where: { id },
    data: { role: role as Role },
  });

  return NextResponse.json({ profile });
}
