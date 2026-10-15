/** Vigil — brand-in, mentions-out demo data (judging-ready). */

export const AGENT_DESIGN = {
  count: 5,
  runDuration: {
    demoCycle: '~24 seconds (sped-up)',
    production: 'Continuous 24/7 listen loop; poll every 90s; a shift never ends until the founder pauses the crew',
    taskToWorkflow:
      'Brand submitted → listen → notice mention → triage → witty draft → gate → ship → invent next play. Each mention is a task; the crew turns it into a workflow.',
  },
  plan: [
    'Founder submits a brand (keywords + handle).',
    'Scout owns the long-running listen plan across X, LinkedIn, Reddit, Instagram.',
    'Analyst builds a triage plan per mention (urgency × risk) and chooses the next agent.',
    'Voice plans a witty reply (tone check, length cap) before drafting.',
    'Publisher plans delivery (auto vs approve vs retry) from confidence + rate limits.',
    'Strategist plans proactive GTM plays from unused positive signal.',
  ],
  handoffs: [
    'You → Scout (brand keywords)',
    'Scout → Analyst (batch of mentions)',
    'Analyst → Voice (reply tasks) or Strategist (amplify / proactive)',
    'Voice → Publisher (draft + confidence)',
    'Publisher → Scout (watch thread for follow-ups)',
    'Any agent → human (confidence < 0.8 or brand-risk flag)',
  ],
  recovery: [
    'API / rate-limit errors: exponential backoff, then re-queue the same task (no drop).',
    'Brand-voice fail: Voice rewrites once; second fail → human queue.',
    'Publish fail: Publisher keeps draft, marks retry, alerts founder after 3 attempts.',
    'Ambiguous / spicy sentiment: Analyst escalates to human instead of guessing.',
  ],
};

export const AGENTS = [
  { id: 'scout', name: 'Scout', role: 'Listen', brief: 'Long-running poll for brand mentions' },
  { id: 'analyst', name: 'Analyst', role: 'Triage', brief: 'Scores urgency + risk; picks handoff' },
  { id: 'voice', name: 'Voice', role: 'Write', brief: 'Drafts witty replies in brand voice' },
  { id: 'publisher', name: 'Publisher', role: 'Ship', brief: 'Posts high-confidence; queues the rest' },
  { id: 'strategist', name: 'Strategist', role: 'Lead', brief: 'Invent proactive plays from signal' },
];

export const PLATFORMS = [
  { id: 'x', label: 'X', color: 'oklch(0.92 0 0)' },
  { id: 'linkedin', label: 'LinkedIn', color: 'oklch(0.55 0.14 250)' },
  { id: 'reddit', label: 'Reddit', color: 'oklch(0.65 0.18 40)' },
  { id: 'instagram', label: 'Instagram', color: 'oklch(0.70 0.16 340)' },
];

function slugHandle(name) {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'brand';
  return `@${clean}`;
}

/** Build mentions + witty drafts for whatever brand the user typed. */
export function buildBrandPack(brandName) {
  const name = (brandName || 'Coca-Cola').trim() || 'Coca-Cola';
  const handle = slugHandle(name);
  const short = name.split(/\s+/)[0];

  return {
    name,
    handle,
    voice: 'Witty, warm, never corporate. One-liner energy. Sound human.',
    mentions: {
      m1: {
        id: 'm1',
        platform: 'x',
        author: '@thirsty_tuesday',
        when: 'just now',
        text: `okay but why does ${name} hit different at 2am`,
        urgency: 'high',
        status: 'pending',
        draft: `Because sleep schedules are fake and ${short} is real. Stay hydrated (with vibes). ${handle}`,
      },
      m2: {
        id: 'm2',
        platform: 'reddit',
        author: 'u/hot_take_machine',
        when: '4m ago',
        text: `Unpopular opinion: the competitor tastes better than ${name}. Fight me.`,
        urgency: 'medium',
        status: 'pending',
        draft: `We'll bring the ice. You bring the argument. (Also: taste buds update overnight — check back tomorrow 😉)`,
      },
      m3: {
        id: 'm3',
        platform: 'instagram',
        author: '@picnic.energy',
        when: '12m ago',
        text: `Tagged ${name} in our park day — this bottle carried the whole vibe ☀️`,
        urgency: 'low',
        status: 'pending',
        draft: `Park day MVP right here. Sun did the lighting. We just showed up cold.`,
      },
      m4: {
        id: 'm4',
        platform: 'linkedin',
        author: 'Maya Chen · Brand Lead',
        when: '31m ago',
        text: `Studying how ${name} stays culturally relevant without sounding try-hard. Masterclass in consistency.`,
        urgency: 'low',
        status: 'pending',
        draft: `Consistency is just showing up cold and leaving the mic drop. Appreciate you studying the homework.`,
      },
    },
  };
}

/**
 * Timeline personalized to the submitted brand.
 * Includes plan / handoff / error / recover for judges (~24s).
 */
export function buildRunEvents(brand) {
  const { name, handle } = brand;
  return [
    {
      t: 0,
      agent: 'scout',
      type: 'plan',
      text: `PLAN: Continuous listen for “${name}” / ${handle}. Platforms=[X,LinkedIn,Reddit,Instagram]. Cadence=90s.`,
    },
    {
      t: 600,
      agent: 'scout',
      type: 'status',
      text: `Crew online. Watching social for “${name}” — run does not end; this demo shows one cycle sped-up.`,
    },
    {
      t: 1200,
      agent: 'scout',
      type: 'scan',
      platform: 'x',
      text: `Scanning X for ${name}…`,
    },
    {
      t: 2000,
      agent: 'scout',
      type: 'scan',
      platform: 'linkedin',
      text: `Scanning LinkedIn for ${name}…`,
    },
    {
      t: 2600,
      agent: 'scout',
      type: 'scan',
      platform: 'reddit',
      text: `Scanning Reddit for ${name}…`,
    },
    {
      t: 3200,
      agent: 'scout',
      type: 'scan',
      platform: 'instagram',
      text: `Scanning Instagram tags for ${name}…`,
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
      text: 'RECOVER: Backoff 2s → retry poll. Instagram listen restored.',
    },
    {
      t: 5400,
      agent: 'scout',
      type: 'find',
      mentionId: 'm1',
      text: `Noticed a comment on X about ${name}.`,
    },
    {
      t: 6200,
      agent: 'scout',
      type: 'find',
      mentionId: 'm2',
      text: `Noticed a Reddit hot take about ${name}.`,
    },
    {
      t: 7000,
      agent: 'scout',
      type: 'find',
      mentionId: 'm3',
      text: `Noticed an Instagram tag of ${name}.`,
    },
    {
      t: 7600,
      agent: 'scout',
      type: 'handoff',
      to: 'analyst',
      text: 'HANDOFF Scout → Analyst: 3 mentions (batch).',
    },
    {
      t: 8400,
      agent: 'analyst',
      type: 'plan',
      text: 'PLAN: Score urgency × risk. Route reply work → Voice; amplify → Strategist.',
    },
    {
      t: 9200,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm1',
      text: 'X comment is fun + public → reply now.',
    },
    {
      t: 10000,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm2',
      text: 'Reddit fight is spicy → witty reply + human gate.',
    },
    {
      t: 10800,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm3',
      text: 'Instagram love → quick witty thank-you.',
    },
    {
      t: 11400,
      agent: 'analyst',
      type: 'handoff',
      to: 'voice',
      text: 'HANDOFF Analyst → Voice: m1 + m2 + m3.',
    },
    {
      t: 12200,
      agent: 'voice',
      type: 'plan',
      text: 'PLAN: Draft witty, short, on-brand. Self-check tone before handoff.',
    },
    {
      t: 13000,
      agent: 'voice',
      type: 'error',
      mentionId: 'm1',
      text: 'ERROR: Brand-voice check failed on m1 (too corporate).',
    },
    {
      t: 13800,
      agent: 'voice',
      type: 'recover',
      mentionId: 'm1',
      text: 'RECOVER: Rewrite once — sharper, funnier. Tone check passed.',
    },
    {
      t: 14600,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm1',
      text: 'Wrote a witty X reply (confidence 0.91).',
    },
    {
      t: 15600,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm2',
      text: 'Wrote a witty Reddit clap-back (confidence 0.74 — below auto-ship).',
    },
    {
      t: 16400,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm3',
      text: 'Wrote a witty Instagram reply.',
    },
    {
      t: 17200,
      agent: 'voice',
      type: 'handoff',
      to: 'publisher',
      text: 'HANDOFF Voice → Publisher: m1/m3 auto, m2 approve queue.',
    },
    {
      t: 18000,
      agent: 'publisher',
      type: 'plan',
      text: 'PLAN: confidence≥0.8 → auto-ship; else queue. On 5xx/429 → retry with backoff.',
    },
    {
      t: 18800,
      agent: 'publisher',
      type: 'error',
      mentionId: 'm1',
      text: 'ERROR: X API 503 on post. Keeping draft; not marking shipped.',
    },
    {
      t: 19800,
      agent: 'publisher',
      type: 'recover',
      mentionId: 'm1',
      text: 'RECOVER: Retry #1 after 1s backoff → post succeeded.',
    },
    {
      t: 20400,
      agent: 'publisher',
      type: 'ship',
      mentionId: 'm1',
      text: 'Posted witty reply on X.',
    },
    {
      t: 21200,
      agent: 'publisher',
      type: 'ship',
      mentionId: 'm3',
      text: 'Posted witty reply on Instagram.',
    },
    {
      t: 22000,
      agent: 'publisher',
      type: 'queue',
      mentionId: 'm2',
      text: 'Queued Reddit reply for your approve (spicy thread).',
    },
    {
      t: 22800,
      agent: 'analyst',
      type: 'handoff',
      to: 'strategist',
      text: 'HANDOFF Analyst → Strategist: LinkedIn signal.',
    },
    {
      t: 23400,
      agent: 'strategist',
      type: 'plan',
      text: 'PLAN: Convert unused positive signal into a proactive amplify play.',
    },
    {
      t: 24000,
      agent: 'scout',
      type: 'find',
      mentionId: 'm4',
      text: `Also pulled a LinkedIn mention of ${name}.`,
    },
    {
      t: 24600,
      agent: 'strategist',
      type: 'play',
      mentionId: 'm4',
      text: 'Proactive play: draft a short thank-you / amplify on LinkedIn.',
    },
    {
      t: 25200,
      agent: 'scout',
      type: 'status',
      text: `Cycle complete. Still watching ${name} — next poll 90s. Long-running crew stays warm.`,
    },
  ];
}

/** Build a markdown Proof of a Run from live logs (for download + judges). */
export function buildProofOfRun({ logs, stats, brand, finishedAt }) {
  const name = brand?.name ?? 'Brand';
  const lines = [
    '# Proof of a Run — Vigil',
    '',
    `**Product:** Vigil — always-on social GTM agent crew`,
    `**Brand submitted:** ${name} (${brand?.handle ?? ''})`,
    `**Finished at:** ${finishedAt ?? new Date().toISOString()}`,
    `**Challenge:** Accel AI Innovate · Long Running Agents — From Task to Workflow`,
    '',
    '## Agent design (judging)',
    '',
    '### How many agents',
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
    `| Mentions noticed | ${stats.found} |`,
    `| Witty drafts | ${stats.drafted} |`,
    `| Posted | ${stats.shipped} |`,
    `| Needs your approve | ${stats.queued} |`,
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
    '**Customer:** Seed / Series A teams without a full-time social hire.',
    '**Problem:** Mentions die unanswered; witty GTM never ships while founders build.',
    `**Output of this run:** witty replies for **${name}** — some shipped, spicy ones queued for approve, plus a proactive play.`,
    '',
  );

  return lines.join('\n');
}
