import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "./db";

export const SESSION_COOKIE = "gtm_session";
const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createLoginToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await prisma.authToken.create({
    data: {
      email: email.toLowerCase(),
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS),
    },
  });
  return raw;
}

// Single-use: returns the email for a valid unused token, marking it used.
export async function consumeLoginToken(raw: string): Promise<string | null> {
  const token = await prisma.authToken.findUnique({ where: { tokenHash: sha256(raw) } });
  if (!token || token.usedAt || token.expiresAt < new Date()) return null;
  await prisma.authToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
  return token.email;
}

export async function createSession(userId: string): Promise<{ raw: string; expiresAt: Date }> {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { userId, tokenHash: sha256(raw), expiresAt } });
  return { raw, expiresAt };
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  }
}

export function isAdmin(user: User): boolean {
  const admin = process.env.ADMIN_EMAIL;
  return !!admin && user.email.toLowerCase() === admin.toLowerCase();
}
