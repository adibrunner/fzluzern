import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, supabaseId } = await req.json();

    if (!firstName || !lastName || !email || !supabaseId) {
      return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        supabaseId,
        firstName,
        lastName,
        email,
        role: "PARENT",
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error("Profil-Erstellung fehlgeschlagen:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
