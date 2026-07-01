# Momentum Mill Website

The live site at [momentummill.com](https://momentummill.com) — Momentum Mill helps founders raise money and land partnerships, run as short, focused sprints.

## How it's built

Hand-written static HTML/CSS/JS, no build step. GitHub Pages serves the `docs/` folder on `main` (custom domain via `docs/CNAME`).

## Pages

| File | URL |
| --- | --- |
| `docs/index.html` | `/` — homepage |
| `docs/fundraising-sprint.html` | `/fundraising-sprint` — program page |
| `docs/raise-campaign-offer.html` | `/raise-campaign-offer` — full offer (print-friendly) |
| `docs/raise-campaign.pdf.html` | `/raise-campaign.pdf` — plain print version |

Shared assets in `docs/`: `favicon.svg`, `og.png` (social share card), `kateryna.webp`.

## Design tokens

Defined in `:root` at the top of each page's `<style>` block:

- Ivory `#F6F1E7`, cream `#FBF8F1`, bisque `#EBD6B4`
- Gold `#D69946`, deep gold `#9C7128`
- Espresso `#2B221D`
- Type: Newsreader (display), Hanken Grotesk (body), Space Mono (labels)

## Editing

Every page is self-contained — edit the HTML file, commit to a branch, and merge to `main` to deploy. No dependencies to install.

## Archive

`archive/react-prototype/` holds an earlier React/Vite prototype of the site that was never deployed. It is kept for reference only and can be deleted.
