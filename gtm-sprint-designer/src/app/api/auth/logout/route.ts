import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  await destroySession();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  const base = process.env.APP_URL || new URL(req.url).origin;
  return NextResponse.redirect(`${base}/`, { status: 303 });
}
