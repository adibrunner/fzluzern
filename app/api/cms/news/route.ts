import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const { title, body, publish } = await req.json();
  if (!title || !body) return NextResponse.json({ error: "Titel und Inhalt erforderlich" }, { status: 400 });

  const post = await prisma.newsPost.create({
    data: { title, body, authorId: profile.id, publishedAt: publish ? new Date() : null },
  });

  return NextResponse.json({ post }, { status: 201 });
}
