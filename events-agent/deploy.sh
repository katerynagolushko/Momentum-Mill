#!/usr/bin/env bash
# Refresh the live site: re-run the scraper, then push the fresh report to Vercel.
#
#   events-agent/deploy.sh                          # default profile (investors-sf)
#   events-agent/deploy.sh --topic governance-london --web
#   events-agent/deploy.sh --no-x                   # skip X (free)
#
# Any flags are passed straight through to scrape.py. Deploys to:
#   https://momentum-events-kateryna-golushkos-projects.vercel.app
# using your Vercel token at ~/.claude/kira/.token (same one Kira uses).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN_FILE="$HOME/.claude/kira/.token"
OUT="$ROOT/events-agent/out"

echo "==> Scraping..."
python3 "$ROOT/events-agent/scrape.py" "$@"

echo "==> Staging site..."
STAGE="${TMPDIR:-/tmp}/momentum-events"
rm -rf "$STAGE"; mkdir -p "$STAGE"
cp "$OUT/index.html" "$OUT/events.csv" "$OUT/events.json" "$OUT/events.md" "$STAGE/"

echo "==> Deploying to Vercel..."
npx --yes vercel deploy "$STAGE" --prod --yes \
  --scope kateryna-golushkos-projects \
  --token="$(cat "$TOKEN_FILE")"

echo "==> Live: https://momentum-events-kateryna-golushkos-projects.vercel.app"
