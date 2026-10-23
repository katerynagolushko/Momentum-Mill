# Vigil — Social GTM Agent Crew

Hackathon demo for **Accel AI Innovate London** (Future Founders: Long Running Agents).

Five Claude-style agents form a social desk:

1. **Scout** — listens on X, LinkedIn, Reddit, Instagram  
2. **Analyst** — triages urgency / risk / opportunity  
3. **Voice** — drafts replies in brand voice  
4. **Publisher** — ships high-confidence replies; queues the rest  
5. **Strategist** — invents proactive GTM plays  

## Demo

```bash
npm install
npm run dev
```

Open the app → **Start crew run**. Watch live handoffs, drafts, and approve a queued Reddit reply.

No API keys required — the run is a scripted live simulation so judges can see the agent workflow end-to-end.

## Deploy (Vercel)

Repo already has `vercel.json` (Vite → `dist`). Push this branch and import / redeploy on Vercel.
