import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

// Preview fallback: with no DATABASE_URL configured (no database attached yet),
// point Prisma at the SQLite file seeded during the build. Read-only on
// serverless — good enough to render the corpus; attach Postgres for real use.
if (!process.env.DATABASE_URL) {
  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "gtm-sprint-designer", "prisma", "dev.db"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) process.env.DATABASE_URL = `file:${found}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
