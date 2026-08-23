import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VerdictInputSchema, type Plan } from "@/lib/schema";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const run = await prisma.run.findUnique({ where: { id } });
  if (!run || run.userId !== user.id) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (run.verdict) {
    return NextResponse.json({ error: "Verdict already recorded for this run." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = VerdictInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verdict", details: parsed.error.flatten() }, { status: 400 });
  }
  const v = parsed.data;

  const plan = JSON.parse(run.outputJson) as Plan;
  const actuals = [
    v.actualVolume && `volume: ${v.actualVolume}`,
    v.actualReplies && `replies: ${v.actualReplies}`,
    v.actualMeetings && `meetings: ${v.actualMeetings}`,
  ].filter(Boolean).join("; ");

  await prisma.$transaction([
    prisma.run.update({
      where: { id: run.id },
      data: {
        verdict: v.verdict,
        verdictAt: new Date(),
        actualVolume: v.actualVolume,
        actualReplies: v.actualReplies,
        actualMeetings: v.actualMeetings,
        actualNotes: v.actualNotes,
      },
    }),
    // The verdict becomes a corpus case draft (status: unverified) for admin review.
    prisma.caseDraft.create({
      data: {
        runId: run.id,
        userId: user.id,
        stage: run.stage,
        icp: plan.icp_narrowed || run.icp,
        channel: plan.channel || run.channel,
        approach: plan.message_angle,
        volume: v.actualVolume,
        outcome: actuals || "no numbers reported",
        verdict: v.verdict,
        lesson: v.actualNotes,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
