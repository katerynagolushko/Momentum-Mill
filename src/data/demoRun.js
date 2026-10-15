/** Vigil — brand-in, mentions-out demo data. */

export const AGENT_DESIGN = {
  count: 5,
  runDuration: {
    demoCycle: '~20 seconds (sped-up)',
    production: 'Continuous 24/7 listen; poll every 90s until you pause',
    taskToWorkflow: 'Brand → listen → notice mention → witty reply → ship or approve',
  },
  plan: [
    'You submit a brand.',
    'Scout searches X, LinkedIn, Reddit, Instagram for that brand.',
    'Analyst picks which comments need a reply.',
    'Voice writes a witty reply in brand voice.',
    'Publisher posts high-confidence ones; queues the rest for you.',
  ],
  handoffs: [
    'You → Scout (brand keywords)',
    'Scout → Analyst (mentions found)',
    'Analyst → Voice (reply this one)',
    'Voice → Publisher (draft ready)',
    'Publisher → you (if unsure)',
  ],
  recovery: [
    'Rate limit → wait and retry (don’t drop the mention)',
    'Reply too corporate → rewrite funnier',
    'Post fails → retry, then ask you',
  ],
};

export const AGENTS = [
  { id: 'scout', name: 'Scout', role: 'Finds mentions', brief: 'Pulls brand mentions across social' },
  { id: 'analyst', name: 'Analyst', role: 'Picks priorities', brief: 'Decides what needs a reply' },
  { id: 'voice', name: 'Voice', role: 'Writes witty', brief: 'Drafts replies in brand voice' },
  { id: 'publisher', name: 'Publisher', role: 'Posts', brief: 'Ships or queues for approve' },
  { id: 'strategist', name: 'Strategist', role: 'Goes proactive', brief: 'Suggests the next post' },
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

/** Timeline personalized to the submitted brand. */
export function buildRunEvents(brand) {
  const { name, handle } = brand;
  return [
    {
      t: 0,
      agent: 'scout',
      type: 'status',
      text: `Got it. Watching social for “${name}” and ${handle}…`,
    },
    {
      t: 800,
      agent: 'scout',
      type: 'scan',
      platform: 'x',
      text: `Searching X for ${name}…`,
    },
    {
      t: 1600,
      agent: 'scout',
      type: 'scan',
      platform: 'reddit',
      text: `Searching Reddit for ${name}…`,
    },
    {
      t: 2200,
      agent: 'scout',
      type: 'scan',
      platform: 'instagram',
      text: `Searching Instagram tags for ${name}…`,
    },
    {
      t: 2800,
      agent: 'scout',
      type: 'scan',
      platform: 'linkedin',
      text: `Searching LinkedIn mentions of ${name}…`,
    },
    {
      t: 3600,
      agent: 'scout',
      type: 'find',
      mentionId: 'm1',
      text: `Noticed a comment on X about ${name}.`,
    },
    {
      t: 4400,
      agent: 'scout',
      type: 'find',
      mentionId: 'm2',
      text: `Noticed a Reddit hot take about ${name}.`,
    },
    {
      t: 5200,
      agent: 'scout',
      type: 'find',
      mentionId: 'm3',
      text: `Noticed an Instagram tag of ${name}.`,
    },
    {
      t: 5800,
      agent: 'scout',
      type: 'handoff',
      to: 'analyst',
      text: 'Handing 3 mentions to Analyst → who needs a witty reply?',
    },
    {
      t: 6600,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm1',
      text: 'X comment is fun + public → reply now.',
    },
    {
      t: 7400,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm2',
      text: 'Reddit fight is spicy → witty reply, but ask human before post.',
    },
    {
      t: 8200,
      agent: 'analyst',
      type: 'score',
      mentionId: 'm3',
      text: 'Instagram love → quick witty thank-you.',
    },
    {
      t: 8800,
      agent: 'analyst',
      type: 'handoff',
      to: 'voice',
      text: 'Handing m1 + m2 + m3 → Voice (witty mode).',
    },
    {
      t: 9600,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm1',
      text: 'Wrote a witty X reply.',
    },
    {
      t: 10800,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm2',
      text: 'Wrote a witty Reddit clap-back.',
    },
    {
      t: 11800,
      agent: 'voice',
      type: 'draft',
      mentionId: 'm3',
      text: 'Wrote a witty Instagram reply.',
    },
    {
      t: 12600,
      agent: 'voice',
      type: 'handoff',
      to: 'publisher',
      text: 'Drafts ready → Publisher.',
    },
    {
      t: 13400,
      agent: 'publisher',
      type: 'ship',
      mentionId: 'm1',
      text: 'Posted witty reply on X.',
    },
    {
      t: 14200,
      agent: 'publisher',
      type: 'ship',
      mentionId: 'm3',
      text: 'Posted witty reply on Instagram.',
    },
    {
      t: 15000,
      agent: 'publisher',
      type: 'queue',
      mentionId: 'm2',
      text: 'Queued Reddit reply for your approve (spicy thread).',
    },
    {
      t: 16000,
      agent: 'scout',
      type: 'find',
      mentionId: 'm4',
      text: `Also pulled a LinkedIn mention of ${name}.`,
    },
    {
      t: 17000,
      agent: 'strategist',
      type: 'play',
      mentionId: 'm4',
      text: 'Proactive: draft a short thank-you / amplify on LinkedIn.',
    },
    {
      t: 18000,
      agent: 'scout',
      type: 'status',
      text: `Still watching ${name}. Next check in 90s — crew stays on.`,
    },
  ];
}

export function buildProofOfRun({ logs, stats, brand, finishedAt }) {
  const name = brand?.name ?? 'Brand';
  const lines = [
    '# Proof of a Run — Vigil',
    '',
    `**Brand submitted:** ${name} (${brand?.handle ?? ''})`,
    `**Finished at:** ${finishedAt ?? new Date().toISOString()}`,
    '',
    '## What happened',
    `1. Founder submitted brand **${name}**`,
    '2. Scout pulled mentions from X, Reddit, Instagram, LinkedIn',
    '3. Voice wrote witty replies',
    '4. Publisher shipped safe ones; queued spicy ones for approve',
    '',
    '## Results',
    `| Metric | Count |`,
    `| --- | --- |`,
    `| Mentions noticed | ${stats.found} |`,
    `| Witty drafts | ${stats.drafted} |`,
    `| Posted | ${stats.shipped} |`,
    `| Needs your approve | ${stats.queued} |`,
    '',
    '## Agent log',
    '',
  ];
  for (const l of logs) {
    lines.push(`- \`${l.at}\` **[${l.agent}]** ${l.type}: ${l.text}`);
  }
  return lines.join('\n');
}
