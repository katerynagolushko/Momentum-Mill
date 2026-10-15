# Proof of a Run — Vigil

## Demo story
1. Founder submits a brand (e.g. **Coca-Cola**)
2. **Scout** pulls mentions from X, Reddit, Instagram, LinkedIn
3. **Analyst** picks which comments need a reply
4. **Voice** writes **witty** replies
5. **Publisher** posts safe ones; queues spicy ones for approve

## Agent design
- **5 agents:** Scout, Analyst, Voice, Publisher, Strategist
- **Plan / handoff:** Brand → Scout → Analyst → Voice → Publisher (Strategist for amplify)
- **Run length:** ~20s sped-up cycle; production = continuous listen every 90s
- **Recovery:** rate-limit retry, rewrite if too corporate, publish retry

## How to reproduce
Open the demo → type **Coca-Cola** → **Watch agents listen** → approve the Reddit reply → **Download Proof of a run***
