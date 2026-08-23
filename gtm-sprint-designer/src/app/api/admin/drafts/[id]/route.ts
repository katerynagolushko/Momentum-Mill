import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("reject") }),
  z.object({
    action: z.literal("approve"),
    conf: z.enum(["A", "B", "C"]).default("C"),
    url: z.string().trim().default(""), // founder cases have no public source unless one is added
  }),
]);

// verdict -> flag: a scale verdict is a success case, kill a failure, iterate mixed.
const FLAG_BY_VERDICT: Record<string, string> = { scale: "yes", kill: "no", iterate: "mixed" };

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const draft = await prisma.caseDraft.findUnique({ where: { id }, include: { run: true } });
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  if (draft.status !== "unverified") {
    return NextResponse.json({ error: "Draft already reviewed." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (parsed.data.action === "reject") {
    await prisma.caseDraft.update({
      where: { id },
      data: { status: "rejected", reviewedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  const founderCount = await prisma.case.count({ where: { origin: "founder" } });
  const caseId = `FDR-${String(founderCount + 1).padStart(3, "0")}`;
  const flag = FLAG_BY_VERDICT[draft.verdict] ?? "mixed";

  await prisma.$transaction([
    prisma.case.create({
      data: {
        id: caseId,
        actor: "Momentum Mill founder (workspace)",
        person: "",
        stage: draft.stage,
        icp: draft.icp,
        channel: draft.channel,
        approach: draft.approach,
        volume: draft.volume,
        timeframe: "4 weeks",
        openRate: "",
        replyRate: draft.run.actualReplies ?? "",
        acceptOrPositive: "",
        meetings: draft.run.actualMeetings ?? "",
        outcome: draft.outcome,
        verdict: draft.verdict,
        lesson: draft.lesson,
        url: parsed.data.url,
        conf: parsed.data.conf,
        flag,
        flagNorm: flag,
        origin: "founder",
      },
    }),
    prisma.caseDraft.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, caseId });
}
