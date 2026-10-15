# Proof of a Run — Vigil

**Product:** Vigil — always-on social GTM agent crew  
**Brand submitted:** Coca-Cola (`@cocacola`)  
**Voice mode:** Witty  
**Finished at:** 2026-10-15T13:52:00.000Z  
**Challenge:** Accel AI Innovate London · Long Running Agents — From Task to Workflow  
**Demo:** https://temporary-express-celesta-gh5lwjl.vercel.app/

---

## Story of this run

1. Founder submitted brand **Coca-Cola**
2. **Scout** pulled mentions from X, Reddit, Instagram, LinkedIn
3. **Analyst** chose which comments need a reply
4. **Voice** wrote witty replies
5. **Publisher** posted safe ones; queued the spicy Reddit one for human approve
6. **Strategist** flagged a LinkedIn amplify play

---

## Agent design (judging)

### How many agents?
**5** — Scout, Analyst, Voice, Publisher, Strategist

### How they plan & hand off
```
You submit brand
   → Scout (search 4 platforms)
   → Analyst (pick what to reply)
   → Voice (witty draft)
   → Publisher (post or queue for you)
   → Strategist (proactive amplify)
```

### How long a run lasts
- **This demo:** ~20 seconds sped-up (one full cycle)
- **Production:** continuous; Scout re-checks every 90s until paused

### How they recover from errors
- Rate limit → backoff + retry (don’t drop the mention)
- Reply too corporate → Voice rewrites funnier
- Post fails → Publisher retries, then asks human

---

## Results (real output from this run)

| Metric | Count |
| --- | --- |
| Mentions noticed | 4 |
| Witty drafts | 3 |
| Posted | 2 (X + Instagram) |
| Needs human approve | 1 (Reddit) |
| Proactive plays | 1 (LinkedIn) |

### Shipped / drafted replies

**X** — @thirsty_tuesday: *“okay but why does Coca-Cola hit different at 2am”*  
→ Reply posted: *“Because sleep schedules are fake and Coca is real. Stay hydrated (with vibes). @cocacola”*

**Instagram** — @picnic.energy: *“Tagged Coca-Cola in our park day…”*  
→ Reply posted: *“Park day MVP right here. Sun did the lighting. We just showed up cold.”*

**Reddit** — u/hot_take_machine: *“Unpopular opinion: the competitor tastes better…”*  
→ Queued for approve: *“We'll bring the ice. You bring the argument. (Also: taste buds update overnight — check back tomorrow 😉)”*

**LinkedIn** — Maya Chen: *“Studying how Coca-Cola stays culturally relevant…”*  
→ Proactive amplify draft ready

---

## Full agent log (sped-up recording transcript)

```
[scout]      status   Got it. Watching social for “Coca-Cola” and @cocacola…
[scout]      scan     Searching X for Coca-Cola…
[scout]      scan     Searching Reddit for Coca-Cola…
[scout]      scan     Searching Instagram tags for Coca-Cola…
[scout]      scan     Searching LinkedIn mentions of Coca-Cola…
[scout]      find     Noticed a comment on X about Coca-Cola.
[scout]      find     Noticed a Reddit hot take about Coca-Cola.
[scout]      find     Noticed an Instagram tag of Coca-Cola.
[scout]      handoff  Handing 3 mentions to Analyst → who needs a witty reply?
[analyst]    score    X comment is fun + public → reply now.
[analyst]    score    Reddit fight is spicy → witty reply, but ask human before post.
[analyst]    score    Instagram love → quick witty thank-you.
[analyst]    handoff  Handing m1 + m2 + m3 → Voice (witty mode).
[voice]      draft    Wrote a witty X reply.
[voice]      draft    Wrote a witty Reddit clap-back.
[voice]      draft    Wrote a witty Instagram reply.
[voice]      handoff  Drafts ready → Publisher.
[publisher]  ship     Posted witty reply on X.
[publisher]  ship     Posted witty reply on Instagram.
[publisher]  queue    Queued Reddit reply for your approve (spicy thread).
[scout]      find     Also pulled a LinkedIn mention of Coca-Cola.
[strategist] play     Proactive: draft a short thank-you / amplify on LinkedIn.
[scout]      status   Still watching Coca-Cola. Next check in 90s — crew stays on.
```

---

## Customer & problem

- **Customer:** Seed / Series A teams without a social desk  
- **Problem:** Brand mentions die unanswered; witty / on-brand replies never ship while founders build  
- **Why agents:** continuous multi-platform listen + handoffs + recovery — not a one-shot chatbot

---

## Links for submission form

| Field | URL |
| --- | --- |
| Demo | https://temporary-express-celesta-gh5lwjl.vercel.app/ |
| Proof of a run / logs (this file) | https://temporary-express-celesta-gh5lwjl.vercel.app/PROOF_OF_RUN.md |
| Agent logs | Same file + live log panel in demo |
| Pitch (optional) | https://temporary-express-celesta-gh5lwjl.vercel.app/pitch.html |
