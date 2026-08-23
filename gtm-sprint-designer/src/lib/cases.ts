import type { Case } from "@prisma/client";
import { prisma } from "./db";

// The corpus stores channels as free text ("linkedin outreach", "cold calls + emails"),
// so preference matching goes through keyword families rather than equality.
const CHANNEL_FAMILIES: Record<string, string[]> = {
  "cold email": ["email"],
  linkedin: ["linkedin"],
  "cold calling": ["calling", "cold calls", "phone"],
  "community/content": [
    "community", "content", "reddit", "hacker news", "product hunt",
    "quora", "clubhouse", "seo", "build-in-public",
  ],
};

export function isCitable(c: Pick<Case, "conf" | "url">): boolean {
  return (c.conf === "A" || c.conf === "B") && c.url.trim() !== "";
}

export function isFailure(c: Pick<Case, "flagNorm">): boolean {
  return c.flagNorm === "no" || c.flagNorm === "mixed";
}

function score(c: Case, channelKeywords: string[], hasPreference: boolean): number {
  let s = 0;
  const ch = c.channel.toLowerCase();
  if (hasPreference) {
    if (channelKeywords.some((k) => ch.includes(k))) s += 3;
  } else {
    s += 1;
  }
  if (c.stage.toLowerCase().includes("early") || c.stage.toLowerCase().includes("pre-revenue")) s += 1;
  if (isFailure(c)) s += 2; // guarantee failure cases surface
  if (c.replyRate) s += 1;
  return s;
}

export interface EvidenceSelection {
  citable: Case[]; // sent to Claude as citable evidence (conf A/B, has URL)
  background: Case[]; // conf C: pattern context only, never citable
}

// Top ~12 citable cases (8 successes + 4 failures, at least one failure always
// present) plus up to 4 quarantined C rows for background pattern context.
export async function selectEvidence(channel: string, _stage: string): Promise<EvidenceSelection> {
  const all = await prisma.case.findMany();
  const hasPreference = !channel.includes("not sure");
  const keywords = CHANNEL_FAMILIES[channel] ?? [];

  const ranked = all
    .map((c) => ({ c, s: score(c, keywords, hasPreference) }))
    .sort((a, b) => b.s - a.s);

  const citableRanked = ranked.filter(({ c }) => isCitable(c));
  const wins = citableRanked.filter(({ c }) => !isFailure(c)).slice(0, 8).map(({ c }) => c);
  const fails = citableRanked.filter(({ c }) => isFailure(c)).slice(0, 4).map(({ c }) => c);
  const background = ranked.filter(({ c }) => c.conf === "C").slice(0, 4).map(({ c }) => c);

  return { citable: [...wins, ...fails], background };
}

// Compact case representation for the prompt — omits DB bookkeeping fields.
export function caseForPrompt(c: Case) {
  return {
    case_id: c.id,
    actor: c.actor,
    stage: c.stage,
    icp: c.icp,
    channel: c.channel,
    approach: c.approach,
    volume: c.volume,
    timeframe: c.timeframe,
    open_rate: c.openRate,
    reply_rate: c.replyRate,
    accept_or_positive: c.acceptOrPositive,
    meetings: c.meetings,
    outcome: c.outcome,
    verdict: c.verdict,
    lesson: c.lesson,
    conf: c.conf,
    flag: c.flagNorm,
  };
}

// Fields for evidence cards in the UI: always built from DB rows, never from
// model output, so only citable cases can ever render.
export function caseForCard(c: Case) {
  return {
    id: c.id,
    actor: c.actor,
    channel: c.channel,
    replyRate: c.replyRate,
    outcome: c.outcome,
    lesson: c.lesson,
    url: c.url,
    conf: c.conf,
    flagNorm: c.flagNorm,
  };
}
export type EvidenceCard = ReturnType<typeof caseForCard>;
