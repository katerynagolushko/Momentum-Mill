import { NextResponse } from "next/server";
import { z } from "zod";
import { createLoginToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

const InputSchema = z.object({ email: z.string().trim().toLowerCase().email().max(320) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const { email } = parsed.data;

  const token = await createLoginToken(email);
  const base = process.env.APP_URL || "http://localhost:3000";
  const url = `${base}/auth/verify?token=${token}`;

  try {
    await sendMagicLink(email, url);
  } catch (e) {
    console.error("magic link send failed:", e);
    return NextResponse.json({ error: "Could not send the sign-in email. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
