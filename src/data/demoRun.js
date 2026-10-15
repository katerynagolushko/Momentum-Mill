/** Vigil — multi-agent social GTM crew (demo run data). */

export const BRAND = {
  name: 'Fractile',
  handle: '@fractileai',
  voice: 'Sharp, technical, founder-friendly. Never corporate.',
};

/** Judging: agent design */
export const AGENT_DESIGN = {
  count: 5,
  runDuration: {
    demoCycle: '~24 seconds (sped-up)',
    production: 'Continuous 24/7 listen loop; poll every 90s; a "shift" never ends until the founder pauses the crew',
    taskToWorkflow:
      'Each mention is a task. The crew turns it into a workflow: listen → triage → draft → gate → ship → watch replies → invent next play.',
  },
  plan: [
    'Scout owns the long-running listen plan (platform queue + keyword set).',
    'Analyst builds a triage plan per mention (urgency × risk × opportunity) and chooses the next agent.',
    'Voice plans a reply (tone check, cite source, length cap) before drafting.',
    'Publisher plans delivery (auto vs approve vs retry) from confidence + platform rate limits.',
    'Strategist plans proactive GTM plays from unused positive signal.',
  ],
  handoffs: [
    'Scout → Analyst (batch of mentions)',
    'Analyst → Voice (reply tasks) or Strategist (amplify / proactive)',
    'Voice → Publisher (draft + confidence score)',
    'Publisher → Scout (watch thread for follow-ups)',
    'Any agent → human (confidence < 0.8 or brand-risk flag)',
  ],
  recovery: [
    'API / rate-limit errors: exponential backoff, then re-queue the same task (no drop).',
    'Brand-voice fail: Voice rewrites once; second fail → human queue.',
    'Publish fail: Publisher keeps draft, marks retry, alerts founder after 3 attempts.',
    'Ambiguous sentiment: Analyst escalates to human instead of guessing.',
  ],
};

export const AGENTS = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Listen',
    brief: 'Long-running poll of X, LinkedIn, Reddit, Instagram for brand + competitor mentions',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    role: 'Triage',
    brief: 'Scores sentiment, urgency, brand risk; chooses handoff target',
  },
  {
    id: 'voice',
    name: 'Voice',
    role: 'Write',
    brief: 'Drafts replies in brand voice; self-checks tone before handoff',
  },
  {
    id: 'publisher',
    name: 'Publisher',
    role: 'Ship',
    brief: 'Posts high-confidence replies; queues the rest; retries on failure',
  },
  {
    id: 'strategist',
    name: 'Strategist',
    role: 'Lead',
    brief: 'Turns signal into proactive plays — threads, AMAs, amplify posts',
  },
];

export const PLATFORMS = [
  { id: 'x', label: 'X', color: 'oklch(0.92 0 0)' },
  { id: 'linkedin', label: 'LinkedIn', color: 'oklch(0.55 0.14 250)' },
  { id: 'reddit', label: 'Reddit', color: 'oklch(0.65 0.18 40)' },
  { id: 'instagram', label: 'Instagram', color: 'oklch(0.70 0.16 340)' },
];

/**
 * Timeline of agent events (ms from run start).
 * Includes planning, handoffs, errors, and recoveries for judges.
 */
export const RUN_EVENTS = [
  {
    t: 0,
    agent: 'scout',
    type: 'plan',
    text: 'PLAN: Continuous listen. Platforms=[X,LinkedIn,Reddit,Instagram]. Cadence=90s. Keywords=@fractileai|Fractile|inference chip.',
  },
  {
    t: 600,
    agent: 'scout',
    type: 'status',
    text: 'Crew online. Shift started — run does not end; this demo shows one cycle sped-up.',
  },
  {
    t: 1200,
    agent: 'scout',
    type: 'scan',
    platform: 'x',
    text: 'Scanning X for @fractileai, "Fractile", "inference chip"…',
  },
  {
    t: 2000,
    agent: 'scout',
    type: 'scan',
    platform: 'linkedin',
    text: 'Scanning LinkedIn company page + founder comments…',
  },
  {
    t: 2600,
    agent: 'scout',
    type: 'scan',
    platform: 'reddit',
    text: 'Scanning r/MachineLearning, r/LocalLLaMA, r/startups…',
  },
  {
    t: 3200,
    agent: 'scout',
    type: 'scan',
    platform: 'instagram',
    text: 'Scanning Instagram tagged posts + story mentions…',
  },
  {
    t: 3800,
    agent: 'scout',
    type: 'error',
    platform: 'instagram',
    text: 'ERROR: Instagram Graph API 429 rate limit. Task not dropped.',
  },
  {
    t: 4600,
    agent: 'scout',
    type: 'recover',
    platform: 'instagram',
    text: 'RECOVER: Backoff 2s → retry poll. Instagram listen restored. Mentions buffered.',
  },
  {
    t: 5400,
    agent: 'scout',
    type: 'find',
    mentionId: 'm1',
    text: 'Hit: customer question on X about latency claims.',
  },
  {
    t: 6000,
    agent: 'scout',
    type: 'find',
    mentionId: 'm2',
    text: 'Hit: Reddit thread comparing Fractile vs GPU inference costs.',
  },
  {
    t: 6600,
    agent: 'scout',
    type: 'find',
    mentionId: 'm3',
    text: 'Hit: LinkedIn praise from design partner — ripe for amplify.',
  },
  {
    t: 7200,
    agent: 'scout',
    type: 'handoff',
    to: 'analyst',
    text: 'HANDOFF Scout → Analyst: 3 mentions (batch).',
  },
  {
    t: 8000,
    agent: 'analyst',
    type: 'plan',
    text: 'PLAN: Score each mention on urgency × sentiment × brand-risk. Route reply work → Voice; amplify → Strategist.',
  },
  {
    t: 8800,
    agent: 'analyst',
    type: 'score',
    mentionId: 'm1',
    text: 'X Q&A → HIGH urgency. Route → Voice.',
  },
  {
    t: 9600,
    agent: 'analyst',
    type: 'score',
    mentionId: 'm2',
    text: 'Reddit debate → MEDIUM risk (competitor framing). Route → Voice + human gate.',
  },
  {
    t: 10400,
    agent: 'analyst',
    type: 'score',
    mentionId: 'm3',
    text: 'LinkedIn love → LOW risk / HIGH leverage. Route → Strategist.',
  },
  {
    t: 11000,
    agent: 'analyst',
    type: 'handoff',
    to: 'voice',
    text: 'HANDOFF Analyst → Voice: m1 + m2.',
  },
  {
    t: 11800,
    agent: 'voice',
    type: 'plan',
    text: 'PLAN: Draft in brand voice. Cap length. Cite public bench. Self-check tone before handoff.',
  },
  {
    t: 12600,
    agent: 'voice',
    type: 'error',
    mentionId: 'm1',
    text: 'ERROR: Brand-voice check failed on m1 (too salesy: "world-class").',
  },
  {
    t: 13400,
    agent: 'voice',
    type: 'recover',
    mentionId: 'm1',
    text: 'RECOVER: Rewrite once — sharper, technical, cites fractile.ai/bench. Tone check passed.',
  },
  {
    t: 14200,
    agent: 'voice',
    type: 'draft',
    mentionId: 'm1',
    text: 'Drafted X reply (confidence 0.91).',
  },
  {
    t: 15200,
    agent: 'voice',
    type: 'draft',
    mentionId: 'm2',
    text: 'Drafted Reddit reply (confidence 0.74 — below auto-ship threshold).',
  },
  {
    t: 16000,
    agent: 'voice',
    type: 'handoff',
    to: 'publisher',
    text: 'HANDOFF Voice → Publisher: m1 auto, m2 approve queue.',
  },
  {
    t: 16800,
    agent: 'publisher',
    type: 'plan',
    text: 'PLAN: confidence≥0.8 → auto-ship; else queue. On 5xx/429 → retry with backoff (max 3).',
  },
  {
    t: 17600,
    agent: 'publisher',
    type: 'error',
    mentionId: 'm1',
    text: 'ERROR: X API 503 on post. Keeping draft; not marking shipped.',
  },
  {
    t: 18600,
    agent: 'publisher',
    type: 'recover',
    mentionId: 'm1',
    text: 'RECOVER: Retry #1 after 1s backoff → post succeeded.',
  },
  {
    t: 19200,
    agent: 'publisher',
    type: 'ship',
    mentionId: 'm1',
    text: 'Shipped reply on X. Handoff → Scout to watch thread for follow-ups.',
  },
  {
    t: 20000,
    agent: 'publisher',
    type: 'queue',
    mentionId: 'm2',
    text: 'Queued Reddit reply for founder approve (confidence 0.74).',
  },
  {
    t: 20800,
    agent: 'analyst',
    type: 'handoff',
    to: 'strategist',
    text: 'HANDOFF Analyst → Strategist: m3 + market signal.',
  },
  {
    t: 21600,
    agent: 'strategist',
    type: 'plan',
    text: 'PLAN: Convert unused positive signal into proactive GTM plays (thread + amplify).',
  },
  {
    t: 22400,
    agent: 'strategist',
    type: 'play',
    mentionId: 'm4',
    text: 'Proactive play: founder thread — "why inference cost curves just broke".',
  },
  {
    t: 23200,
    agent: 'strategist',
    type: 'play',
    mentionId: 'm3',
    text: 'Amplify play: quote-repost LinkedIn win + ask for case-study call.',
  },
  {
    t: 24000,
    agent: 'scout',
    type: 'status',
    text: 'Cycle complete. Listen loop continues (next poll 90s). Long-running crew stays warm — not a one-shot chat.',
  },
];

export const MENTIONS = {
  m1: {
    id: 'm1',
    platform: 'x',
    author: '@ml_ops_jen',
    when: '2m ago',
    text: 'Is @fractileai actually beating GPU $/token on small batches or is that only for their demo workload?',
    sentiment: 'curious',
    urgency: 'high',
    status: 'pending',
    draft:
      "Great Q — small batches are exactly where we win. We published the batch-size curve here: fractile.ai/bench. Happy to run your shape if you share tokens/s + context length.",
  },
  m2: {
    id: 'm2',
    platform: 'reddit',
    author: 'u/tokenburn',
    when: '11m ago',
    text: 'Anyone tried Fractile vs just renting more H100s? Their claims sound spicy but I need real numbers for a 7B serving stack.',
    sentiment: 'skeptical',
    urgency: 'medium',
    status: 'pending',
    draft:
      "Fair ask. For 7B decode-heavy serving we usually see 2–4× better $/token vs H100s at low concurrency — the gap shrinks when you're fully saturating GPUs. Drop your QPS + context and I'll map it to the public bench (or DM a private run).",
  },
  m3: {
    id: 'm3',
    platform: 'linkedin',
    author: 'Priya N. · Staff Eng @ Lattice Labs',
    when: '38m ago',
    text: 'Shoutout to the Fractile team — we cut inference spend ~40% on our eval fleet without rewriting the serving path. Rare when a hardware story is this plug-and-play.',
    sentiment: 'positive',
    urgency: 'low',
    status: 'pending',
    draft:
      "Means a lot coming from Lattice — thank you, Priya. Would love to turn this into a short case study if you're open (happy to draft first).",
  },
  m4: {
    id: 'm4',
    platform: 'x',
    author: '@fractileai',
    when: 'proactive',
    text: 'PROACTIVE: Draft founder thread — "The inference cost curve just broke (and most teams are still budgeting like 2024)."',
    sentiment: 'opportunity',
    urgency: 'medium',
    status: 'pending',
    draft:
      "1/ Most teams still budget inference like last year: more GPUs → more tokens.\n2/ That curve bent. Small-batch + decode-heavy work is where silicon specialization wins.\n3/ We open-sourced the bench. Steal it: fractile.ai/bench\n4/ If your bill is climbing faster than traffic, that's the smell. DM me your shape.",
  },
};

/** Build a markdown Proof of a Run from live logs (for download + judges). */
export function buildProofOfRun({ logs, stats, brand = BRAND, finishedAt }) {
  const lines = [
    '# Proof of a Run — Vigil',
    '',
    `**Product:** Vigil — always-on social GTM agent crew`,
    `**Demo brand:** ${brand.name} (${brand.handle})`,
    `**Finished at:** ${finishedAt ?? new Date().toISOString()}`,
    `**Challenge:** Accel AI Innovate · Long Running Agents — From Task to Workflow`,
    '',
    '## Agent design (judging)',
    '',
    `### How many agents`,
    `${AGENT_DESIGN.count} agents: Scout, Analyst, Voice, Publisher, Strategist.`,
    '',
    '### How they plan',
    ...AGENT_DESIGN.plan.map((p) => `- ${p}`),
    '',
    '### How they hand off work',
    ...AGENT_DESIGN.handoffs.map((p) => `- ${p}`),
    '',
    '### How long a run lasts',
    `- Demo cycle (sped-up): ${AGENT_DESIGN.runDuration.demoCycle}`,
    `- Production: ${AGENT_DESIGN.runDuration.production}`,
    `- Task → workflow: ${AGENT_DESIGN.runDuration.taskToWorkflow}`,
    '',
    '### How they recover from errors',
    ...AGENT_DESIGN.recovery.map((p) => `- ${p}`),
    '',
    '## Run results',
    '',
    `| Metric | Count |`,
    `| --- | --- |`,
    `| Mentions found | ${stats.found} |`,
    `| Drafts written | ${stats.drafted} |`,
    `| Replies shipped | ${stats.shipped} |`,
    `| Queued for human | ${stats.queued} |`,
    `| Proactive plays | ${stats.plays} |`,
    `| Errors recovered | ${logs.filter((l) => l.type === 'recover').length} |`,
    '',
    '## Agent log (full)',
    '',
  ];

  for (const l of logs) {
    const tag = l.to ? ` → ${l.to}` : '';
    const plat = l.platform ? ` (${l.platform})` : '';
    lines.push(`- \`${l.at}\` **[${l.agent}]** ${l.type}${tag}${plat}: ${l.text}`);
  }

  lines.push('', '## Customer & problem', '');
  lines.push(
    '**Customer:** Seed / Series A teams without a full-time social / community hire.',
    '**Problem:** Mentions die unanswered; proactive GTM never ships while founders build product.',
    '**Output of this run:** 1 shipped X reply, 1 Reddit reply ready to approve, 2 proactive plays.',
    '',
  );

  return lines.join('\n');
}
