import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, CaseFieldsSchema, normalizeFlag } from "@/lib/admin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = CaseFieldsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid case", details: parsed.error.flatten() }, { status: 400 });
  }
  const fields = parsed.data;

  await prisma.case.update({
    where: { id },
    data: { ...fields, flagNorm: normalizeFlag(fields.flag) },
  });
  return NextResponse.json({ ok: true });
}
