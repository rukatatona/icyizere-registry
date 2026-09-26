# Icyizere Registry

A verification and work-history registry for domestic workers in Rwanda.

Families hiring a maid have almost no reliable way to know who they're letting
into their home. This app is a neutral, paid record-keeping service — not a
staffing agency, no placement commissions — that builds an honest, growing
work history on each worker: identity and criminal-record verification up
front, then every placement she takes afterward, with what each household
says about her.

See `PITCH.md` for the business case (problem, model, pricing, why it's
different, why it compounds in value).

## What's here

A real, working full-stack app — not a mockup:

- **Overview** (`/`) — counts: workers on file, active placements, clear vs. flagged
- **All Workers** (`/registry`) — searchable list, click into any worker's file
- **Worker detail** (`/registry/[id]`) — ID info, verification status, and a
  placement timeline you can add to
- **Add Worker** (`/add`) — the intake form for a first-time verification

Data is stored in a real SQLite database on disk (`data/registry.db`), via
[better-sqlite3](https://github.com/WiseLibs/better-sqlite3). No external
service, no API keys needed to run it locally.

## Running it locally

Requires Node.js 18+.

```bash
npm install
npm run seed   # loads two clearly-marked example records so it's not empty
npm run dev    # starts at http://localhost:3000
```

## Project structure

```
app/
  page.js                 Overview
  registry/page.js        Worker list + search
  registry/[id]/page.js   Worker detail + placement history
  add/page.js             Add-worker form
  api/
    workers/route.js       GET (list), POST (create)
    workers/[id]/route.js  GET one worker + their placements
    placements/route.js    POST (add a placement)
    stats/route.js         GET summary counts
lib/db.js                  SQLite schema + queries
scripts/seed.js             Loads example records
```

## Deploying this for real

SQLite works well for the pilot (you and your on-the-ground verifier using
this day to day), but it lives on one machine's disk, so it doesn't survive
on serverless hosts like Vercel, which reset the filesystem between
requests. Two straightforward paths once you're ready to put this on a real
domain:

1. **A host with a persistent disk** — Render, Fly.io, or a small VPS. The
   app runs as-is; you just need a volume mounted at `data/`.
2. **Swap in a hosted database** — point `lib/db.js` at a free-tier hosted
   Postgres (e.g. Supabase or Neon) instead of SQLite once you have real
   users and want something more robust. The rest of the app (routes, pages)
   doesn't need to change — only the queries in `lib/db.js`.

Either way, the codebase is yours: no Claude or Anthropic dependency, no
platform lock-in, nothing to migrate off of later.

## Why this shape

- **SQLite to start** so there's nothing to configure or pay for while
  you're validating the idea with real families.
- **Next.js** because it's one of the most common stacks a Rwandan or
  international contract developer will already know, if you hand this off
  later.
- **Plain CSS, no framework lock-in** so a future developer isn't fighting a
  design system to make changes.
