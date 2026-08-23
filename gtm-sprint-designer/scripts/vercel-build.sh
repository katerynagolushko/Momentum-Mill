#!/bin/bash
set -euo pipefail

# Adapt the Prisma datasource to whatever database is attached:
# - Postgres DATABASE_URL (e.g. Neon via the Vercel integration): switch the
#   provider for this build. The committed schema stays sqlite for local dev.
# - No DATABASE_URL at all: build-local SQLite, seeded and shipped read-only
#   so a preview renders the corpus before any database is attached.
if [ -z "${DATABASE_URL:-}" ] && [ -n "${POSTGRES_URL:-}" ]; then
  export DATABASE_URL="$POSTGRES_URL"
fi
case "${DATABASE_URL:-}" in
  postgres*) sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma ;;
  "") export DATABASE_URL="file:./dev.db" ;;
esac

# Scheme only — never print the URL itself (it contains credentials on Postgres).
echo "Build datasource: ${DATABASE_URL%%:*}"

npx prisma generate
npx prisma db push --skip-generate
npx prisma db seed
npx next build
