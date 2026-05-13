import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { firstName, lastName, phone } = await req.json();
  const profile = await prisma.profile.update({
    where: { supabaseId: user.id },
    data: { firstName, lastName, phone: phone || null },
  });

  return NextResponse.json({ profile });
}
