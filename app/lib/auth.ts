import { createSupabaseServerClient } from "./supabase/server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { supabaseId: user.id } });
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/auth/anmelden");
  return user;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/anmelden");
  return profile;
}

export async function requireRole(...roles: string[]) {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return profile;
}
