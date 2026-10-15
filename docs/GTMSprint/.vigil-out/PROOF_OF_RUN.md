# Proof of a Run — Vigil

**Product:** Vigil — always-on social GTM agent crew  
**Demo brand:** Fractile (`@fractileai`)  
**Challenge:** Accel AI Innovate London · *Long Running Agents — From Task to Workflow*  
**Live demo:** run the app → **Start crew run** (sped-up recording of a full cycle)  
**Pitch slides:** [`/pitch.html`](./public/pitch.html) (also served at `/pitch.html` on Vercel)

---

## Agent design (judging answers)

### How many agents?
**5 agents** working as a crew:

| Agent | Job |
| --- | --- |
| **Scout** | Long-running listen across X, LinkedIn, Reddit, Instagram |
| **Analyst** | Triage: urgency × sentiment × brand risk; choose next agent |
| **Voice** | Draft replies in brand voice; self-check tone |
| **Publisher** | Ship high-confidence replies; queue the rest; retry failures |
| **Strategist** | Invent proactive GTM plays from unused signal |

### How they plan
1. **Scout** owns the listen plan (platform queue + keywords + 90s cadence).
2. **Analyst** builds a triage plan per mention and picks the handoff target.
3. **Voice** plans reply constraints (tone, citations, length) before drafting.
4. **Publisher** plans delivery from confidence + rate limits (auto / approve / retry).
5. **Strategist** plans proactive plays from positive signal that never became a reply.

### How they hand off work
```
Scout ──batch──► Analyst ──reply tasks──► Voice ──draft+score──► Publisher
                     │                                              │
                     └── amplify / proactive ──► Strategist         └──► Scout (watch thread)
Any agent ──confidence < 0.8 or brand-risk──► Human approve queue
```

### How long a run lasts
- **Demo cycle (sped-up for judges):** ~24 seconds — one full listen→ship→play loop with errors + recoveries.
- **Production:** continuous 24/7. The crew does **not** end after one task. Scout polls every **90 seconds**; a “shift” lasts until the founder pauses it.
- **Task → workflow:** each mention is a task; the crew turns it into a multi-agent workflow (listen → triage → draft → gate → ship → watch → invent next play).

### How they recover from errors
| Failure | Recovery |
| --- | --- |
| Instagram / X API rate limit or 5xx | Exponential backoff, re-queue same task (never drop) |
| Brand-voice check fail | Voice rewrites once; second fail → human queue |
| Publish fail after retries | Keep draft, alert founder after 3 attempts |
| Ambiguous / high brand-risk | Analyst escalates to human instead of guessing |

**Shown live in the demo log:** Instagram 429 → backoff retry; Voice tone fail → rewrite; X 503 → Publisher retry → ship.

---

## What the run produced (real output)

| Metric | Result |
| --- | --- |
| Mentions found | 3 (+ 1 proactive play) |
| Drafts written | 2 replies + amplify + founder thread |
| Auto-shipped | 1 X reply (after recover from 503) |
| Queued for human | 1 Reddit reply (confidence 0.74) |
| Proactive plays | 2 |
| Errors recovered | 3 (rate limit, tone, publish) |

Usable outputs a customer could take: shipped reply text, approve-ready Reddit draft, founder thread draft, LinkedIn amplify ask.

---

## Agent log (canonical sped-up recording transcript)

Paste from a live run, or click **Download Proof of a Run** in the app after **Start crew run**. Sample:

```
[scout] PLAN: Continuous listen. Platforms=[X,LinkedIn,Reddit,Instagram]. Cadence=90s.
[scout] ERROR: Instagram Graph API 429 rate limit. Task not dropped.
[scout] RECOVER: Backoff 2s → retry poll. Instagram listen restored.
[scout] HANDOFF Scout → Analyst: 3 mentions (batch).
[analyst] PLAN: Score urgency × sentiment × brand-risk. Route reply → Voice; amplify → Strategist.
[analyst] HANDOFF Analyst → Voice: m1 + m2.
[voice] ERROR: Brand-voice check failed on m1 (too salesy).
[voice] RECOVER: Rewrite once — tone check passed.
[voice] HANDOFF Voice → Publisher: m1 auto, m2 approve queue.
[publisher] ERROR: X API 503 on post. Keeping draft.
[publisher] RECOVER: Retry #1 → post succeeded.
[publisher] Shipped reply on X. Handoff → Scout to watch thread.
[strategist] Proactive play: founder thread on inference cost curves.
[scout] Cycle complete. Listen loop continues (next poll 90s).
```

---

## Business viability

- **Customer:** Seed / Series A teams without a social desk.
- **Problem:** Mentions die; proactive GTM never ships while founders build.
- **Why agents (not a chatbot):** work is continuous, multi-platform, and needs handoffs + recovery — not a single prompt.

---

## Links for submission form

| Field | Link |
| --- | --- |
| Demo / product | Deployed Vercel URL of this branch (root `/`) |
| Proof of a run | This file + in-app **Download Proof of a Run** |
| Agent logs / sped-up recording | Live log panel in demo; transcript above |
| Pitch slides | `/pitch.html` on the same deployment |
