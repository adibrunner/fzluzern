import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import NewsEditForm from "./NewsEditForm";

export default async function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();
  return <NewsEditForm post={post} />;
}
