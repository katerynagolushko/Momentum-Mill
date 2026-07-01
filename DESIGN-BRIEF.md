# Momentum Mill — Website Design Brief

This document is a complete handoff for redesigning **momentummill.com**. It contains the business context, the full content inventory, everything that has been tried so far, what was rejected and why, and the owner's requirements in full. A designer (human or AI) should be able to produce finished design proposals from this document alone, without asking questions.

---

## 1. The business

**Momentum Mill** is a solo consultancy run by **Kateryna Golushko** (VC and early-stage GTM background; has worked with 80+ startups across Ultra.vc, Amazon, Launch Club Capital and RBC Group). It helps startup founders with two things, both run as short, focused "sprints":

1. **Fundraising Sprint** (the flagship program) — "We run your raise like a campaign." 8 weeks of founder-brand building and investor warm-up, then a 1–2 week raise with back-to-back investor calls. Cohort-based: ≤5 founders, first launch July 2026, heavily discounted for design partners.
2. **GTM Sprint** (custom engagement) — customer-acquisition strategy: growth hypotheses, co-marketing partnerships, pilots, automated GTM pipelines.

- **Audience:** startup founders (primary), investors who will inspect the site (secondary). Geography: SF and London.
- **The one conversion action:** "Book a call" → a Google Calendar appointment link. There is no other funnel. Every page should drive to it.
- **Brand line:** "Where momentum is made."
- **Voice:** direct, confident, a bit provocative — e.g. "Investors are attracted to shiny things. Be that thing.", "Wanna be in?", "Investors live for the FOMO." Professional, not corporate; bold, not artsy.

## 2. The website today

- **Stack:** three hand-written, self-contained static HTML pages (all CSS/JS inline per page, no build step), served by GitHub Pages from the `docs/` folder of the repo (`katerynagolushko/Momentum-Mill`, `main` branch, custom domain via CNAME). Deploys happen only when `main` changes.
- **Pages:**
  - `/` — homepage (hero, two offer cards, About Kateryna with photo, contact band, footer)
  - `/fundraising-sprint` — program page (hero, thesis banner, SVG timeline, "what we'll do" cards, FOMO booking-widget mock, logistics stats, CTA band)
  - `/raise-campaign-offer` — long-form offer document (print-friendly, "Save as PDF" button, 9 numbered program steps, logistics, CTA)
- **Current visual system (being replaced):** ivory `#F6F1E7` / cream / bisque `#EBD6B4`, gold `#D69946` / deep gold `#9C7128`, espresso `#2B221D`; Newsreader (display serif), Hanken Grotesk (body), Space Mono (labels); rounded cards, pill buttons, grain texture, fade-up-on-scroll.
- **Assets that exist:** owner's photo (`kateryna.webp`, square), SVG favicon (gold italic "M" on espresso), OG share card 1200×630, Google Calendar booking URL.
- **Verdict on the current design (agreed):** competent but reads as AI-generated — the warm cream + gold + literary serif combination is the recognizable "AI default" look (close to Anthropic's own palette), the section labels use the `/ lowercase mono` AI-signature pattern, and the layout is symmetric cards with even spacing.

## 3. Content inventory (use this copy verbatim)

Copy is the **owner's domain** — design proposals must use this existing copy, not rewrite it. (She knows some lines need editing; that's a separate workstream.)

- **Hero headline:** "We run your raise like a campaign, so the right investors come to you."
- **Hero secondary line:** "Need customers more than cash right now? We run your go-to-market the same way."
- **Hero CTAs:** "See the sprints →" (primary), "Book a call →" (secondary; also in nav)
- **Offers section head:** "Two offers. Pick what you need." + "One is the program, tailored to your needs. The second is an absolutely custom solution." + tag "01 Program / 02 Custom"
- **Offer 01 — Fundraising Sprint:** "We run your raise like a campaign. 8 weeks warming up the right investors, then 1-2 weeks to close the round." Bullets: "A real timeline where every week has a job" / "Founder brand first, so investors arrive warm" / "Deck, one-pager and pipeline, ready up front" / "A 2-week sprint of back-to-back investor calls". Link: "See the program →"
- **Offer 02 — GTM Sprint:** "We analyze your core customer acquisition problem and create theories where your customer could be." Bullets: "Growth hypotheses for personas and channels" / "Co-marketing partners and warm distribution" / "Pilots that get accounts hooked on your product" / "Automated GTM pipelines to find your buyers". Link: "Book a call →"
- **About:** "Momentum Mill is led by **Kateryna Golushko**, who comes from a venture capital and early-stage GTM execution space." / "She's worked with over 80 startups on fundraising and partnerships, across Ultra.vc, Amazon, Launch Club Capital and RBC Group." / "She started Momentum Mill because too many founders leave fundraising and partnerships to luck and charisma." Link: "More about Kateryna →" (to katerynagolushko.com)
- **Contact band:** "Let's get you moving." + "If you're getting ready to raise, or you want a partnership worth doing, let's talk." + "Book a call →"
- **Footer:** "Momentum Mill · Where momentum is made. · © 2026 · katerynagolushko.com"
- **Program-page key lines:** thesis: "Before the raise, become someone investors will be obsessed with. Then announce your raise." / timeline: "8 weeks to build, a 2-week raise." (phases: Strategy & Setup, Build Your Brand, Get Raise-Ready, The Raise Sprint) / stats: ≤5 founders, 8+2 weeks, ~10h/week pre-raise, 40h+ during sprint / closing: "Wanna be in?"

## 4. Design exploration so far (and the verdicts)

**Round 1 — polish of the current site** (better hero hierarchy, restyled labels, favicon/OG). Verdict: not enough; the whole visual language still "gives AI."

**Round 2 — four directions, same copy:**
- A "Signal" (Swiss studio: Space Grotesk, paper, orange, hard borders)
- B "The Desk" (dark financial: Inter Tight + IBM Plex Mono, near-black, amber data strip)
- C "Broadsheet" (newspaper masthead: Fraunces, oxblood, hairline columns)
- D "Poster" (brutalist: Bricolage Grotesque caps, cobalt color blocks)

Verdict: still read as AI to the owner — diagnosis: **the fonts** (Inter, Space Grotesk, Fraunces are AI defaults) and **the spacing** (even, symmetric, card-based).

**Round 3 — three concepts with non-default faces and editorial layout devices:**
- "Flywheel" (Archivo Expanded caps + rotating circular type ring, greige + vermilion, index-table offers)
- "Ledger" (Young Serif prospectus with marginalia columns, dot leaders, § section marks)
- "Heavy" (dark charcoal poster: Anton caps colliding with huge Instrument Serif italic, acid green, vertical brand spine, stacked slab offers)

**Verdict from the owner:** "Heavy" was the most appealing and least AI — **but**: no dark theme, ever (hard rule); acid green is wrong (too edgy/artsy — "which we're not"); and the button font + all-caps sprint titles still felt like classic template fonts (caps are fine, the letterforms were the problem — Anton and Inter-alike body fonts).

**Round 4 — current working direction (approved shape, palette undecided):** the "Heavy" structure translated to a light warm theme:
- Warm paper background, near-black warm ink text.
- Display: **Archivo, extra-wide cut** (variable width ~122–125%, weight 800), uppercase, tight leading, at poster scale (~104px hero).
- Accent moments: **Instrument Serif italic**, lowercase, oversized (e.g. the word "campaign." at 118px in accent color inside the caps headline).
- Body/UI: **Familjen Grotesk** (buttons sentence-case, square corners, no pills).
- Micro-labels only: **Fragment Mono** (tiny spec lines like "COHORT 01 — JULY 2026").
- Layout devices: vertical rotated brand spine down the left page edge ("MOMENTUM MILL ✳ WHERE MOMENTUM IS MADE ✳ SF — LONDON"); offers as full-width stacked slabs with outlined numerals (01/02) and hairline-divided bullet lists — **not** side-by-side cards; a thin "momentum rail" (hairline with accent dot) as a recurring motif; About photo squared with an offset accent-line frame; tinted full-width contact band; single-line footer.
- Two candidate palettes (owner has not yet chosen):
  - **Ember:** paper `#F4F1EA`, ink `#221E19`, accent `#D6491A`/`#C13E13`, tint band `#EFE0D2` — says "campaign energy / momentum."
  - **Heritage:** the brand's own ivory `#F6F1E7`, espresso `#2B221D`, gold `#D69946`/`#9C7128`, bisque tint `#EBD6B4` — continuity with the existing wordmark, buttons espresso-with-gold like the current site.

## 5. The owner's requirements — in full

**Hard rules (non-negotiable):**
1. **It must not look AI-generated.** Named tells to avoid: default AI fonts (Inter, Space Grotesk, Fraunces, Newsreader, generic system sans), the cream+gold+serif "Claude look," `/ lowercase mono` slash-kickers, symmetric twin cards, pill/rounded buttons, even 80px section rhythm, fade-up-on-everything, centered single-column everything.
2. **No dark theme.** Light backgrounds only. Warm is welcome.
3. **No edgy/artsy accent colors** (acid green explicitly rejected). The palette must align with the thesis: professional, momentum, capital. It should feel like a serious firm with energy — not a creative studio, not a rave.
4. **Fonts are the #1 concern — including on buttons and headings.** All-caps is fine; template-y letterforms are not. Faces must feel chosen by a designer (characterful, less-common; variable width axes, caps-×-italic-serif collisions and similar typographic moves are welcome). Anton was rejected as template-y; Archivo Expanded + Instrument Serif italic + Familjen Grotesk are currently accepted.
5. **Spacing/layout must feel art-directed:** asymmetry, extreme scale contrast (tiny mono captions against 100px+ display), editorial devices (vertical spine, index tables, slabs, hairlines, offset frames) instead of card grids.
6. **Budget: zero.** No paid templates, no hired designers, free fonts only (Google Fonts works).
7. **Nothing goes live without explicit approval.** The live site deploys from `main`; all work stays on a branch / as previews until she approves. She wants to see options and previews first, always.
8. **Copy is hers.** Use the existing copy verbatim; do not rewrite. (Separately flagged for her own pass: testimonials/proof, pricing anchor, LinkedIn link, softening the ghostwritten-FOMO framing — content decisions, not design.)

**Taste profile (from her reactions):**
- Liked: poster-scale typography, the caps-grotesk × giant-italic-serif collision, vertical spine, stacked slab offers, outlined numerals, warm paper feel of her original brand.
- Disliked: dark backgrounds, acid/neon accents, anything "artsy," template fonts, twin cards, pill buttons.
- Undecided: ember-red accent vs. her original espresso+gold inside the new system.

**What success looks like:** a founder or investor lands on it and thinks "a professional designer made this," and nothing about it pattern-matches to AI-generated sites.

## 6. Deliverables requested from the designer

1. Homepage design (desktop + mobile) using the copy in §3.
2. The two subpages (`fundraising-sprint`, `raise-campaign-offer`) in the same system — including a timeline visualization, a stats row, and a long-form numbered program list; the offer page must stay print-friendly.
3. A palette recommendation (may be one of the two candidates in §4 or a better proposal that respects rule 3).
4. Any number of options is welcome, but each should be one strong idea executed with restraint — not palette swaps of the same layout.

**Technical constraints for final implementation:** self-contained static HTML per page (inline CSS/JS, no build step); Google Fonts only; keep the existing Google Calendar booking URL as the sole CTA target; keep favicon + OG tags; respect `prefers-reduced-motion`; visible focus states; must hold up on a phone (the owner reviews on mobile first).
