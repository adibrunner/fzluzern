/**
 * app/lib/prisma.ts - Prisma Client Singleton mit Connection Management
 * 
 * Best Practices für Supabase + Next.js:
 * - Singleton Pattern verhindert mehrere Client-Instanzen (Development)
 * - Connection Pool Limits über DATABASE_URL gesteuert
 * - Graceful Shutdown beim Beenden (nur lokal, nicht Serverless)
 * - Development Logging für Query-Debugging
 * - Vercel-optimiert: Kein Singleton in Production (Serverless)
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const isDevelopment = process.env.NODE_ENV === "development";
const isVercel = process.env.VERCEL === "1";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: isDevelopment ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isVercel && isDevelopment) {
  globalForPrisma.prisma = prisma;
}

if (!isVercel) {
  const cleanup = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
