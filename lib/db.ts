import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Set it in Vercel Project Settings before deploying database-backed routes.")
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
