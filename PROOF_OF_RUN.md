# Proof of a Run — Vigil

**Product:** Vigil — always-on social GTM agent crew  
**Demo brand flow:** submit any brand (e.g. Coca-Cola) → agents notice mentions → witty replies  
**Challenge:** Accel AI Innovate London · *Long Running Agents — From Task to Workflow*  
**Live demo:** open the app → submit a brand → watch the ~24s crew cycle  
**Pitch slides:** [`/pitch.html`](./public/pitch.html) (served at `/pitch.html` on deploy)

---

## Agent design (judging answers)

### How many agents?
**5 agents** working as a crew:

| Agent | Job |
| --- | --- |
| **Scout** | Long-running listen across X, LinkedIn, Reddit, Instagram |
| **Analyst** | Triage: urgency × sentiment × brand risk; choose next agent |
| **Voice** | Draft witty replies in brand voice; self-check tone |
| **Publisher** | Ship high-confidence replies; queue the rest; retry failures |
| **Strategist** | Invent proactive GTM plays from unused signal |

### How they plan
1. **Scout** owns the listen plan (platform queue + keywords + 90s cadence).
2. **Analyst** builds a triage plan per mention and picks the handoff target.
3. **Voice** plans reply constraints (tone, length) before drafting.
4. **Publisher** plans delivery from confidence + rate limits (auto / approve / retry).
5. **Strategist** plans proactive plays from positive signal that never became a reply.

### How they hand off work
```
You ──brand──► Scout ──batch──► Analyst ──reply──► Voice ──draft──► Publisher
                                  │                                    │
                                  └── amplify ──► Strategist           └──► You (approve) or Scout (watch)
```

### How long a run lasts
- **Demo cycle (sped-up for judges):** ~24 seconds — one full listen→ship→play loop with errors + recoveries.
- **Production:** continuous 24/7. Scout polls every **90 seconds**; a shift lasts until the founder pauses it.
- **Task → workflow:** each mention is a task; the crew turns it into a multi-agent workflow.

### How they recover from errors
| Failure | Recovery |
| --- | --- |
| Instagram / X API rate limit or 5xx | Exponential backoff, re-queue same task (never drop) |
| Brand-voice check fail | Voice rewrites once; second fail → human queue |
| Publish fail after retries | Keep draft, alert founder after 3 attempts |
| Spicy / high brand-risk | Analyst escalates to human instead of guessing |

**Shown live in the demo log:** Instagram 429 → backoff retry; Voice tone fail → rewrite; X 503 → Publisher retry → ship.

---

## What the run produced

| Metric | Result |
| --- | --- |
| Mentions found | 3 (+ 1 LinkedIn amplify) |
| Witty drafts | 3 replies + amplify play |
| Auto-shipped | X + Instagram (after recover from 503) |
| Queued for human | 1 Reddit reply (spicy / lower confidence) |
| Errors recovered | 3 (rate limit, tone, publish) |

---

## Agent log (sample — full log via in-app download)

```
[scout] PLAN: Continuous listen…
[scout] ERROR: Instagram Graph API 429 rate limit. Task not dropped.
[scout] RECOVER: Backoff 2s → retry poll. Instagram listen restored.
[scout] HANDOFF Scout → Analyst: 3 mentions (batch).
[analyst] PLAN: Score urgency × sentiment × brand-risk…
[voice] ERROR: Brand-voice check failed (too corporate).
[voice] RECOVER: Rewrite once — sharper one-liner. Tone check passed.
[publisher] ERROR: X API 503 on post.
[publisher] RECOVER: Retry #1 → post succeeded.
[strategist] Proactive amplify play ready.
```

After a finished run, click **Download Proof of a Run** for the full personalized transcript.

---

## Pitch slides

Open **`/pitch.html`** on the same deployment (or `public/pitch.html` in the repo).
