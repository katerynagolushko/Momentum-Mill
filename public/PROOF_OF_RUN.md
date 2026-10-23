# Proof of a Run — Vigil (Agent Logs)

**Product:** Vigil — always-on social GTM agent crew  
**Brand submitted:** Coca-Cola (`@cocacola`)  
**Voice mode:** Witty  
**Finished at:** 2026-10-15T13:52:00.000Z  
**Challenge:** Accel AI Innovate London · Long Running Agents — From Task to Workflow  

**Demo:** https://gtmsprint-uk-git-cursor-soci-34daa5-kateryna-golushkos-projects.vercel.app/

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
- **This demo:** ~20–24 seconds sped-up (one full cycle)
- **Production:** continuous; Scout re-checks every 90s until paused

### How they recover from errors
- Rate limit → backoff + retry (don’t drop the mention)
- Reply too corporate → Voice rewrites funnier
- Post fails → Publisher retries, then asks human

---

## Results

| Metric | Count |
| --- | --- |
| Mentions noticed | 4 |
| Witty drafts | 3 |
| Posted | 2 (X + Instagram) |
| Needs human approve | 1 (Reddit) |
| Proactive plays | 1 (LinkedIn) |

### Shipped / drafted replies

**X** — @thirsty_tuesday: “okay but why does Coca-Cola hit different at 2am”  
→ Posted: “Because sleep schedules are fake and Coca is real. Stay hydrated (with vibes). @cocacola”

**Instagram** — @picnic.energy: “Tagged Coca-Cola in our park day…”  
→ Posted: “Park day MVP right here. Sun did the lighting. We just showed up cold.”

**Reddit** — u/hot_take_machine: “Unpopular opinion: the competitor tastes better…”  
→ Queued: “We'll bring the ice. You bring the argument. (Also: taste buds update overnight — check back tomorrow 😉)”

**LinkedIn** — Maya Chen: “Studying how Coca-Cola stays culturally relevant…”  
→ Proactive amplify draft ready

---

## Full agent log (sped-up recording transcript)

```
13:52:00  [scout]      status   Got it. Watching social for “Coca-Cola” and @cocacola…
13:52:01  [scout]      scan     Searching X for Coca-Cola…
13:52:02  [scout]      scan     Searching Reddit for Coca-Cola…
13:52:02  [scout]      scan     Searching Instagram tags for Coca-Cola…
13:52:03  [scout]      scan     Searching LinkedIn mentions of Coca-Cola…
13:52:04  [scout]      find     Noticed a comment on X about Coca-Cola.
13:52:04  [scout]      find     Noticed a Reddit hot take about Coca-Cola.
13:52:05  [scout]      find     Noticed an Instagram tag of Coca-Cola.
13:52:06  [scout]      handoff  Handing 3 mentions to Analyst → who needs a witty reply?
13:52:07  [analyst]    score    X comment is fun + public → reply now.
13:52:07  [analyst]    score    Reddit fight is spicy → witty reply, but ask human before post.
13:52:08  [analyst]    score    Instagram love → quick witty thank-you.
13:52:09  [analyst]    handoff  Handing m1 + m2 + m3 → Voice (witty mode).
13:52:10  [voice]      draft    Wrote a witty X reply.
13:52:11  [voice]      draft    Wrote a witty Reddit clap-back.
13:52:12  [voice]      draft    Wrote a witty Instagram reply.
13:52:13  [voice]      handoff  Drafts ready → Publisher.
13:52:13  [publisher]  ship     Posted witty reply on X.
13:52:14  [publisher]  ship     Posted witty reply on Instagram.
13:52:15  [publisher]  queue    Queued Reddit reply for your approve (spicy thread).
13:52:16  [scout]      find     Also pulled a LinkedIn mention of Coca-Cola.
13:52:17  [strategist] play     Proactive: draft a short thank-you / amplify on LinkedIn.
13:52:18  [scout]      status   Still watching Coca-Cola. Next check in 90s — crew stays on.
```

---

## Customer & problem

- **Customer:** Seed / Series A teams without a social desk  
- **Problem:** Brand mentions die unanswered; witty replies never ship while founders build  
- **Why agents:** continuous multi-platform listen + handoffs + recovery — not a one-shot chatbot
