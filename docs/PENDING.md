# PENDING — the open-loops registry

Created 2026-08-27 during the starter sync session (PORTS.md card 15, pattern
from the WCP and presacademy repos).

The live registry of open patches, known gaps, and waiting-on-a-human items.
**Read it early in a session; update it in the same commit that opens, closes,
or discovers an item.** It is a registry, not a changelog: it is meant to be
edited in place and stay short, not appended to forever.

Each item says what it is, why it is open, and what unblocks it. Finished items
move to "Recently closed" with a date; prune that section when it gets long.

Launch content and env-var work is tracked separately in
`docs/08-deployment-and-status.md` (pre-launch checklist + env-var matrix).
This file tracks the things that have no other home.

## Open — needs a human (Nathan)

- **Set the `SANITY_AUTH_TOKEN` repo secret** so the nightly dataset backup
  actually runs. `.github/workflows/sanity-backup.yml` is committed and its
  schedule is on, but it gates on that secret and currently logs a warning and
  stops every night (`gh secret list --repo NateJ45/mas-monograms` was empty on
  2026-08-27). A **read** token is enough. Create it at sanity.io/manage →
  project `xp3elugr` → API → Tokens, then
  `gh secret set SANITY_AUTH_TOKEN --repo NateJ45/mas-monograms`. Until this is
  set there is no second copy of Mary Ann's content anywhere.
- **Set the `SITE_URL` repo variable** to turn on the hourly uptime check
  (`.github/workflows/uptime.yml`, same warn-and-skip gate). A **variable**, not
  a secret — the origin is public. Today:
  `https://mas-monograms.nathanjnixon86.workers.dev`. After the custom-domain
  cutover, repoint the variable to `https://mas-monograms.com`; the workflow
  itself never needs editing.
  `gh variable set SITE_URL --repo NateJ45/mas-monograms --body "<origin>"`
- **Commit the regenerated `src/lib/sanity.types.ts`.** Found stale on
  2026-08-27: the committed file was missing `studioGuide.videoUrl` and
  `studioGuide.videoLabel`, which have been in the schema for some time. The new
  CI stale-types guard would have caught it, and will from now on. The
  regenerated file is in the working tree.

## Open — code/content work queued

- **The parity baselines are unowned until the first real refactor.**
  `scripts/.parity/*.html` holds 23 committed snapshots captured 2026-08-27 off
  a clean build. They only earn their keep if `npm run parity compare` is
  actually run after a render-neutral change. Re-capture only when a markup
  change is *intended*, and say so in the commit message.
- **`studio/sanity.cli.ts` typegen config looks half-right.** Its `typegen.path`
  is set to `./schema.json` (the schema file) rather than a source glob, and
  every run reports "0 queries ... found queries in 0 files after evaluating 1
  file". Schema types generate correctly, which is all the codebase uses today
  (`src/lib/queries.ts` types its results by hand), so nothing is broken. But
  GROQ result types are silently not being generated, and the day someone
  expects them the failure will be confusing. Decide: fix the config to point at
  `../src/**/*.{ts,astro}`, or write down that this project only wants schema
  types.
- **`npm run lint` covers less on Linux CI than it does locally.** The script
  passes `src/**/*.{ts,tsx,astro}` as a shell argument. On Windows, cmd does not
  expand it and eslint's own globstar walks the whole tree; on CI's `sh`, `**`
  degrades to one level, so only 54 files are linted and everything under, say,
  `src/components/sections/` is skipped. Nothing errors, which is why it has gone
  unnoticed. Fix by letting eslint do the globbing (`eslint src scripts`, with
  the extensions settled in `eslint.config.js`) and then clearing whatever the
  wider sweep finds — that second half is why this is queued, not done.
- **`scripts/lib/sanity-lib.mjs` is installed but unused.** Ported 2026-08-27 so
  the *next* seed or patch script gets a dry-run gate for free instead of
  re-inventing one. The existing `scripts/*.mjs` still carry their own inline
  clients; converting them is optional and should happen one script at a time,
  when one is being touched anyway.
- **`scripts/with-workerd.mjs` is installed but deliberately unwired.** This repo
  is Astro 6.3 / `@astrojs/cloudflare` 13.5.5, which does not prerender through
  `@cloudflare/vite-plugin`, so the Windows workerd crash it works around cannot
  happen here. Wire it (`"build": "node scripts/with-workerd.mjs astro build"`)
  the day this repo takes the Astro 7 / adapter 14 upgrade — that is exactly
  where presacademy hit it.

## Standing risks (not tasks)

- **Worker secrets live only in Cloudflare.** `RESEND_API_KEY`,
  `QUOTE_OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`, `SANITY_API_READ_TOKEN` are set
  via `wrangler secret put` and are in no repo and no backup. Losing the
  Cloudflare account loses them.
- **Sanity refuses to delete a document other documents reference.** Cleanup
  scripts must unlink first, then delete. (Carried from the WCP repo.)
- **A quoted token in `.env` produces a 401 that reads like a permissions
  problem.** `scripts/lib/loadEnv.mjs` takes quoted values literally, quotes
  included. Write tokens bare. (Also carried from WCP.)

## Recently closed

- 2026-08-27 — **Build CI restored.** `.github/workflows/ci.yml` did not exist;
  `lighthouse.yml` was the only workflow, and it never installed the studio
  workspace, never ran typegen, and never ran `npm test`. CI now runs install
  (root + studio), typegen, the stale-types guard, lint, the Astro build, the
  Studio build, and the unit tests on every push to `main` and every PR.
- 2026-08-27 — **Starter sync session** (see PORTS.md in
  `ncs-astro-sanity-starter`): `free-dist.mjs` (wired as `prebuild`),
  `with-workerd.mjs`, `sanity-lib.mjs`, `contrast.ts`, `sync-check.mjs`, the
  `page-parity.mjs` harness with 23 committed baselines, a theme-token contrast
  gate for the Heirloom Coast palette, and the nightly-backup and uptime
  workflows. `npm run sync-check` reports all canonical copies SAME.
