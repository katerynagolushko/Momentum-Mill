import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Case } from "@prisma/client";
import { BENCHMARKS } from "./constants";
import { PlanSchema, type DesignInput, type Plan } from "./schema";
import { caseForPrompt, isFailure } from "./cases";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY server-side

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

const SYSTEM = `You are the GTM Sprint experiment designer for Momentum Mill, built on a corpus of documented founder GTM experiments. You design ONE 4-week outbound experiment with pre-registered numeric kill criteria.

RULES
- Narrow the ICP if it is broad (the corpus shows identical copy going 0.2%->3.3% on narrowing alone).
- Volume must fit the founder's stated hours per week. Small tight lists beat blasts (BM-04).
- kill_criteria must be specific numbers checkable at day 28, set BEFORE any sending starts.
- Cite case ids ONLY from the CITABLE EVIDENCE list. Never cite ids from BACKGROUND PATTERNS — those are unverified and are provided for pattern context only.
- cited_cases MUST include at least one case whose flag is "no" or "mixed", and warning_from_failures must draw on that failure data.
- benchmark_context should compare the plan's targets to the supplied benchmarks.`;

function buildPrompt(input: DesignInput, citable: Case[], background: Case[]): string {
  return `FOUNDER INPUTS
Product: ${input.product}
ICP (as stated): ${input.icp}
Stage: ${input.stage} | ACV band: ${input.acv} | Preferred channel: ${input.channel} | Founder hours/week for GTM: ${input.hoursPerWeek}

CITABLE EVIDENCE (real documented cases; cite by case_id; conf A/B = verified tiers; flag no/mixed = failure data):
${JSON.stringify(citable.map(caseForPrompt))}

BACKGROUND PATTERNS (unverified tier — context only, NEVER cite these ids):
${JSON.stringify(background.map(caseForPrompt))}

BENCHMARKS: ${JSON.stringify(BENCHMARKS)}

Design the experiment now.`;
}

export class DesignRefusedError extends Error {}
export class DesignParseError extends Error {}

async function callOnce(prompt: string, extraInstruction?: string): Promise<Plan | null> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: extraInstruction ? `${prompt}\n\nIMPORTANT: ${extraInstruction}` : prompt,
      },
    ],
    output_config: { format: zodOutputFormat(PlanSchema) },
  });
  if (response.stop_reason === "refusal") {
    throw new DesignRefusedError("The model declined to design this experiment.");
  }
  return response.parsed_output ?? null;
}

// Designs the experiment and enforces the corpus data rules server-side:
// citations restricted to the citable set, at least one failure case included.
// Retries once on a parse failure or a rule violation, per spec.
export async function designExperiment(
  input: DesignInput,
  citable: Case[],
  background: Case[],
): Promise<Plan> {
  const prompt = buildPrompt(input, citable, background);
  const citableIds = new Set(citable.map((c) => c.id));
  const failureIds = new Set(citable.filter(isFailure).map((c) => c.id));

  const validate = (plan: Plan | null): Plan | null => {
    if (!plan) return null;
    const cited = plan.cited_cases.filter((cc) => citableIds.has(cc.id));
    if (cited.length === 0) return null;
    if (!cited.some((cc) => failureIds.has(cc.id))) return null;
    return { ...plan, cited_cases: cited };
  };

  let plan = validate(await callOnce(prompt));
  if (!plan) {
    plan = validate(
      await callOnce(
        prompt,
        "Your previous attempt was rejected. cited_cases must use ONLY ids from CITABLE EVIDENCE and must include at least one case with flag no or mixed.",
      ),
    );
  }
  if (!plan) {
    throw new DesignParseError("Could not produce a valid experiment design after a retry.");
  }
  return plan;
}
