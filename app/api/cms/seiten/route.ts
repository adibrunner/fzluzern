import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const { title, slug, body } = await req.json();
  if (!title || !slug || !body) return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 });

  try {
    const page = await prisma.infoPage.create({ data: { title, slug, body } });
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
  }
}
