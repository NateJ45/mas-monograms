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

- **Add the CORS origins the embedded Studio needs.** The Studio now lives at
  `<site>/studio` and calls the Sanity API from the SITE's origin, which is not
  on the project's allow list. Until it is, the Studio renders Sanity's own
  "Connect this Studio to your project" screen instead of the desk (verified
  2026-08-28 in a real browser: React mounts fine, the console shows only CORS
  errors). Two origins:
  ```
  npx sanity cors add https://mas-monograms.nathanjnixon86.workers.dev --credentials
  npx sanity cors add http://localhost:4321 --credentials
  ```
  `--credentials` is required; without it the login session never reaches the
  Studio. Add `https://mas-monograms.com` at the custom-domain cutover.
- **Point the runtime token at the Worker, or confirm it is already there.** The
  live draft preview reads Sanity per request through
  `SANITY_TOKEN` **or** the `SANITY_API_READ_TOKEN` this project already uses, so
  if that secret is set on the Worker there is nothing to do. Check with
  `npx wrangler secret list`; if it is absent,
  `npx wrangler secret put SANITY_TOKEN` (a **read** token is enough). Locally
  `.dev.vars` is already wired. Without it the preview routes fail closed with a
  503 naming what is missing, and the public site is unaffected.
- **Change the Cloudflare Workers Builds deploy command.** With
- **Activation step (after the staging merge is LIVE):** run
  `node scripts/patch-studio-guide-presentation.mjs --apply` to update
  Mary Ann's Start Here guide for the new Studio (the removed per-page
  Preview tab becomes the Presentation tool, plus a new how-to for
  seeing drafts live). Deliberately NOT applied yet: until the embedded
  Studio ships, the new wording would not match the Studio she is
  actually using. Dry-run verified 2026-08-28 (3 changes).

  `@astrojs/cloudflare` 14 the authoritative config is the generated
  `dist/server/wrangler.json`, not the root `wrangler.jsonc`. The dashboard's
  deploy command must become
  `npx wrangler deploy -c dist/server/wrangler.json`.
  This one cannot be done from the repo: Workers Builds keeps its build and
  deploy commands in the Cloudflare dashboard (Workers & Pages → mas-monograms →
  Settings → Builds). Confirmed 2026-08-28 that the generated config carries the
  R2 `QUOTE_BACKUP` binding through, so nothing is lost by using it. **Do this
  before the next push to `main`,** or the deploy will use the root config, which
  knows nothing about the SSR entrypoint and 404s `/studio` and `/preview/**`.
- **Retire the hosted Studio at mas-monograms.sanity.studio.** It is now a stale
  duplicate: `studioHost`/`deployment` are gone from `sanity.cli.ts`, so it will
  never update again while still pointing at the same production data. Delete it
  at sanity.io/manage → project `xp3elugr`, and move Mary Ann's bookmark to
  `<site>/studio`. Until it is deleted, the `https://*.sanity.studio` entries in
  `public/_headers` stay.
- **Tell Mary Ann her editor moved**, and that the Preview tool is new. The
  in-dataset "Start Here" guide documents (`studioGuide`, `studioNotes`,
  `studioPlaybook`) are CONTENT, not code, so this session could not update them:
  any step in them that says "go to mas-monograms.sanity.studio" or describes the
  old per-page "Preview" tab (that iframe pane is gone, replaced by the
  Presentation tool) is now wrong. Edit them in the Studio, or write a seed patch
  through `scripts/lib/sanity-lib.mjs` with its dry-run gate.

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
- **Commit the regenerated `src/lib/sanity.types.ts`.** The 2026-08-27 staleness
  (missing `studioGuide.videoUrl` / `videoLabel`) is long since fixed and
  committed. What is uncommitted now is a **purely cosmetic** re-wrap from the
  Sanity 6.4 toolchain: one union type that used to be printed one member per
  line is now printed on a single line. No schema meaning changed. Verified
  2026-08-28 that two consecutive `npm run typegen` runs are byte-identical, so
  the CI stale-types guard stays safe to gate on — but CI will FAIL until this is
  committed.

## Open — code/content work queued

- **The parity baselines are unowned until the first real refactor.**
  `scripts/.parity/*.html` holds 23 committed snapshots captured 2026-08-27 off
  a clean build. They only earn their keep if `npm run parity compare` is
  actually run after a render-neutral change. Re-capture only when a markup
  change is *intended*, and say so in the commit message.
- **`scripts/lib/sanity-lib.mjs` is installed but unused.** Ported 2026-08-27 so
  the *next* seed or patch script gets a dry-run gate for free instead of
  re-inventing one. The existing `scripts/*.mjs` still carry their own inline
  clients; converting them is optional and should happen one script at a time,
  when one is being touched anyway.
- **Unregistered starter schemas are still on disk.** `sections.ts`,
  `richSections.ts`, `page.ts`, `processPage.ts`, `servicesPage.ts`, `service.ts`,
  `philosophyPoint.ts`, `journalEntry.ts` and friends live in
  `src/sanity/schemaTypes/` but are deliberately not imported by `index.ts`. They
  are the reason a naive grep for `pageBuilder` finds arrays this site does not
  actually have (which cost time during the 2026-08-28 preview work). Deleting
  them is safe and would make the schema directory mean what it says; it is
  deferred only because it is unrelated churn.
- **The preview surface is a summary, not the page.** `/preview/*` renders the
  hero, the repeatable lists and the closing CTA, because this site has no page
  builder and no `SectionRenderer` to reuse. Converting one or more of the bespoke
  singletons to a section array (PORTS.md card 12) would upgrade its preview to
  full fidelity for free. Worth doing for Home first if Mary Ann ever asks to
  reorder page sections herself.

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

- 2026-08-28 — **Card 10 + 17 upgrade: Astro 7, Sanity 6.4, embedded Studio, live
  preview.** Astro 6.3 → 7.2.9 with `@astrojs/cloudflare` exactly 14.2.4 and
  wrangler `~4.110.0`; `with-workerd.mjs` wired as the build wrapper;
  `session: false`; `nodejs_compat`; `not_found_handling` removed; assets moved to
  `dist/client`. Sanity 5 → the 6.4.0 pin set on a deleted lockfile, the nested
  `studio/` package folded into the root (`src/sanity/`, repo-root
  `sanity.config.ts` + `sanity.cli.ts` with no `studioHost`), and the Studio
  embedded at `/studio`. The full preview stack landed and was verified end to end
  against the real project. Gates: build green, parity 23/23 twice, 105 tests,
  `npm run check` green, sync-check 6/6 SAME, one `@sanity/ui` on disk, one
  styled-components chunk. Follow-ups are the human items at the top of this file.
- 2026-08-28 — **`sanity.cli.ts` typegen config resolved.** `typegen.path` still
  reads `./schema.json`, matching the starter's copy byte for byte, and the file
  now says WHY in a comment: this codebase types its GROQ results by hand in
  `src/lib/queries.ts` and only consumes the schema types, so "0 queries found in
  0 files" is the intended outcome rather than a half-finished config. Point it at
  `./src/**/*.{ts,astro}` on the day someone wants generated result types.
  (`--force` is now passed too, which the starter proved exists on 6.4.0 and which
  a re-runnable typegen needs.)
- 2026-08-28 — **`scripts/with-workerd.mjs` is wired.** It was installed-but-unwired
  on purpose while this repo was on Astro 6.3 / adapter 13.5.5, which cannot hit
  the Windows workerd crash. The Astro 7 upgrade is the day it was meant to be
  wired, and it is (`"build": "node scripts/with-workerd.mjs astro build"`). It
  reported "using wrangler's workerd" on the first Astro 7 build.
- 2026-08-28 — **`loadEnv.mjs` pulled forward from the library of record.** It now
  carries the `PORTABLE:` marker, so `npm run sync-check` covers it: 6 marked
  files, all SAME.
- 2026-08-27 — **Lint now covers the same files on CI as locally.** The `lint`
  script passed `src/**/*.{ts,tsx,astro}` as a shell argument; on Linux CI's
  `sh` the `**` degraded to one level and only ~54 files were linted. The
  scripts are now `eslint src scripts`, letting eslint's own globbing (driven
  by the `files` patterns in `eslint.config.js`) walk the tree on every OS.
  Verified 129 files linted = 129 matching files on disk; the wider sweep
  surfaced nothing new (still 0 errors, the same 2 unused-var warnings).
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
