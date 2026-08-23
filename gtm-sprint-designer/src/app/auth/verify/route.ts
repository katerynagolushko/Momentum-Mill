import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeLoginToken, createSession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const base = process.env.APP_URL || url.origin;

  const email = token ? await consumeLoginToken(token) : null;
  if (!email) {
    return NextResponse.redirect(`${base}/login?error=expired`);
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const { raw, expiresAt } = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return NextResponse.redirect(`${base}/designer`);
}
