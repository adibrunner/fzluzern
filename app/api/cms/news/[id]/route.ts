import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
  if (!profile || profile.role !== "ADMIN") return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });

  const { title, body, publish } = await req.json();
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const post = await prisma.newsPost.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      body: body ?? existing.body,
      publishedAt: publish ? (existing.publishedAt ?? new Date()) : null,
    },
  });

  return NextResponse.json({ post });
}
