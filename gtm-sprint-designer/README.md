# GTM Sprint Designer

Momentum Mill's experiment designer. A founder enters what they sell, who they think buys it,
stage, ACV band, preferred channel, and hours per week — and gets back **one 4-week outbound
experiment** with a narrowed ICP, list source, message angle, weekly plan sized to their hours,
a success metric, and pre-registered numeric kill criteria (the verdict slip), plus evidence
cards citing real documented founder GTM experiments, each linking to its source.

## Stack

- Next.js (App Router) + TypeScript
- SQLite via Prisma (Postgres-ready — see below)
- Anthropic API, called server-side only
- Magic-link email auth (no passwords) — Resend in production, console link in dev

## Quick start

```bash
cd gtm-sprint-designer
npm install
cp .env.example .env      # fill in ANTHROPIC_API_KEY at minimum
npm run setup             # creates the SQLite DB and seeds the corpus from data/cases_v2.csv
npm run dev
```

Open http://localhost:3000. Sign in with any email — without `RESEND_API_KEY` set, the magic
link is printed to the terminal running the dev server. Sign in with `ADMIN_EMAIL` to see
`/admin`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` locally; a Postgres URL in production |
| `ANTHROPIC_API_KEY` | yes | Server-side only; never shipped to the client |
| `ANTHROPIC_MODEL` | no | Model override; defaults to `claude-opus-5` |
| `APP_URL` | yes | Absolute base URL used in magic-link emails |
| `ADMIN_EMAIL` | yes | The single admin account |
| `RESEND_API_KEY` | no | If set, magic links are emailed via Resend; if unset, printed to the server console |
| `EMAIL_FROM` | no | From address for magic-link emails |

## Seed command

```bash
npm run setup        # prisma db push + prisma db seed
# or separately:
npm run db:push
npm run db:seed
```

The seed ingests `data/cases_v2.csv` into the `Case` table, preserving every field verbatim —
including blanks (blank means the source didn't state it; nothing is ever imputed). Re-running
the seed is idempotent (upserts by `case_id`).

## Corpus data rules (enforced in code)

1. **conf A/B** rows are citable in experiment designs. **conf C** rows are quarantine:
   retrievable as background pattern context in the prompt, never cited, never rendered as
   evidence cards, never counted in public copy. The "built on N documented experiments" count
   is the live A+B count from the table.
2. Every designed experiment includes at least one `no`/`mixed` (failure) case; failure cards
   render with a red border and a FAILURE tag. This is enforced server-side after the model
   responds, not just requested in the prompt.
3. Evidence cards link to the case's source URL; a case with no URL cannot be cited.
4. Cited case IDs are validated server-side against the citable set; the model's output is
   schema-validated with zod and retried once on failure.

## Founder workspace

Every run is saved (inputs + full output + timestamp). At day 28 the founder records a verdict
— scale / iterate / kill — with actual numbers. That verdict becomes an **unverified case
draft** in the admin review queue; approving it adds it to the corpus (default tier C —
quarantine — until independently verified; it needs a source URL and an A/B tier to ever be
citable).

## Admin (`/admin`, `ADMIN_EMAIL` only)

- Review queue for founder-submitted verdicts (approve with a conf tier / reject)
- Corpus table with edit and add
- Export the corpus as CSV (same column layout as `cases_v2.csv`)

## Deploying to Vercel

SQLite doesn't persist on serverless — use Postgres in production:

1. Provision a Postgres DB (Vercel Postgres / Neon / Supabase).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   No model changes are needed.
3. Create the Vercel project with **Root Directory** set to `gtm-sprint-designer/`.
4. Set the env vars above in Vercel (with the Postgres `DATABASE_URL`, your `APP_URL`, and a
   `RESEND_API_KEY` so magic links actually send).
5. Run `npx prisma db push && npx prisma db seed` once against the production `DATABASE_URL`.

The build command is the default `npm run build` (it runs `prisma generate` first).
