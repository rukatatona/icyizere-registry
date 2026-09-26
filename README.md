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

Data is stored in a real database — SQLite on disk (`data/registry.db`) for
local development, or Postgres automatically when a `POSTGRES_URL` /
`DATABASE_URL` environment variable is present (this is how it runs on
Vercel). No external service or API keys needed to run it locally.

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

## Deploying to Vercel

This project is set up to deploy on Vercel with a real Postgres database —
no separate signup needed, it's built into Vercel's dashboard:

1. Push this repo to GitHub (if it isn't already) and import it at
   [vercel.com/new](https://vercel.com/new).
2. In the project's **Storage** tab, click **Create Database → Postgres**
   and connect it to this project. Vercel adds the `POSTGRES_URL` (and
   related) environment variables for you automatically.
3. Redeploy. The app detects `POSTGRES_URL` and switches from SQLite to
   Postgres automatically — see `lib/db.js`.
4. To load the two example records into the new database, run
   `npm run seed` once locally with `POSTGRES_URL` set in your shell to the
   value Vercel gives you (Project → Storage → your database → `.env.local`
   tab has the exact value to copy).

The codebase is yours either way: no Claude or Anthropic dependency, no
platform lock-in, nothing to migrate off of later. If you ever want to move
off Vercel, any host that gives you a Postgres connection string works the
same way.

## Why this shape

- **SQLite to start** so there's nothing to configure or pay for while
  you're validating the idea with real families.
- **Next.js** because it's one of the most common stacks a Rwandan or
  international contract developer will already know, if you hand this off
  later.
- **Plain CSS, no framework lock-in** so a future developer isn't fighting a
  design system to make changes.
