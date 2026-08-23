import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, CaseFieldsSchema, normalizeFlag } from "@/lib/admin";

const CreateSchema = CaseFieldsSchema.extend({
  id: z.string().trim().min(1).max(40),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid case", details: parsed.error.flatten() }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;

  const existing = await prisma.case.findUnique({ where: { id } });
  if (existing) return NextResponse.json({ error: `Case ${id} already exists.` }, { status: 409 });

  const created = await prisma.case.create({
    data: { id, ...fields, flagNorm: normalizeFlag(fields.flag), origin: "seed" },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
