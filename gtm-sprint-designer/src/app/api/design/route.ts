import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { selectEvidence, caseForCard } from "@/lib/cases";
import { designExperiment, DesignParseError, DesignRefusedError } from "@/lib/design";
import { DesignInputSchema } from "@/lib/schema";
import { prisma } from "@/lib/db";

export const maxDuration = 120;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = DesignInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const { citable, background } = await selectEvidence(input.channel, input.stage);

  let plan;
  try {
    plan = await designExperiment(input, citable, background);
  } catch (e) {
    if (e instanceof DesignRefusedError || e instanceof DesignParseError) {
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    console.error("design call failed:", e);
    return NextResponse.json({ error: "The design service is unavailable right now." }, { status: 502 });
  }

  const citedIds = plan.cited_cases.map((c) => c.id);
  const evidence = citable.filter((c) => citedIds.includes(c.id)).map(caseForCard);

  const run = await prisma.run.create({
    data: {
      userId: user.id,
      product: input.product,
      icp: input.icp,
      stage: input.stage,
      acv: input.acv,
      channel: input.channel,
      hoursPerWeek: input.hoursPerWeek,
      outputJson: JSON.stringify(plan),
      citedCaseIds: JSON.stringify(citedIds),
    },
  });

  return NextResponse.json({ runId: run.id, plan, evidence });
}
