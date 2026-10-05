# MAS Monograms — Claude Project Context

## What this is

Mary Ann Stone's custom embroidery studio site in St. Matthews, SC.
Built by Nixon Creative Studio (nathanjnixon86@gmail.com · nixoncreativestudio.com) —
this matches the live footer credit in `siteSettings.footerCredit`.
Migrated from Squarespace 7.1 → Astro 7 + Sanity 6 + Cloudflare Workers.

## Status (current — 2026-10-04)

Built and **deployed**; all content seeded into Sanity. On 2026-10-04 a full redesign, **Direction D,
"The Atelier"**, landed on branch `redesign/atelier` (8 commits ahead of `main`, no PR yet as of this
writing; production still shows the Direction C "Sampler" look until it merges). Nathan's brief: the site looked generic, so make it his best
portfolio piece. Mary Ann's photos are weak, so the site makes its own product pictures: a live
**Monogram Atelier** (canvas embroidery engine, `src/lib/atelier/`) where visitors type initials and watch
them stitched in real thread colours on real fabrics, plus a golden thread sewn down the page on scroll,
hoops, spools, swatch cards and hang tags. Heirloom Coast stays (logo, linen, indigo, claret) with a
deeper Midnight and a thread-gold gradient added. Every page was rebuilt. Rules: `.claude/rules/atelier-engine.md`
(engine), `design-system.md` (look), `site-routes.md` (routes and the quote query-string contract).
Brief: `docs/superpowers/specs/2026-10-04-atelier-direction.md`.

- **New content:** `atelierSettings` singleton and 14 optional `homePage` fields, seeded by
  `scripts/seed-atelier.mjs` (dry run by default; backup `tmp/backups/production-2026-10-04.tar.gz`,
  gitignored). Confirm in the dataset that the seed has been applied before judging the live copy.
- **Removed:** Lenis smooth scroll (2026-10-04). Native scroll only; do not reintroduce it.
- **Merge-ready pass (2026-10-04):** `check:full` green (324 unit tests), Playwright 191/191 (incl. the
  new `tests/features.spec.ts`), parity baselines regenerated (23/23 on two clean rebuilds), Lighthouse
  accessibility 100 on all 12 audited URLs. `PortableText` renders at build time (no island).
- **Open:** Sanity fields the page work wanted, the LCP/font perf pass, hotspots on the
  69 gallery photos, seam polish on heavy block letters. All in `docs/PENDING.md`.
- Studio for Mary Ann: Heirloom Coast theme + "Start Here" handbook + plain-language labels + task-first
  desk; new desk entry "Monogram Preview (live stitching)".
- **Audit-fix pass (2026-10-04, branch `chore/audit-fixes`):** phone-menu scroll fix, compositor-only header
  morph, Fraunces italic subsets (LCP 3.38 to 3.01s on `/`), text-step/radius/wood tokens (detector src
  findings 257 to 0), Heirloom Coast quote emails. What remains is in `docs/PENDING.md`.
- **Logo, header and footer rework (2026-10-04, branch `redesign/header-logo`).** New logo system in
  blue and gold: the **Hoop Seal** (a script S sewn through a roman M and A, in embroidery hoops) is
  the brand mark and the **Signature Thread** wordmark the horizontal lockup; both drawn by
  `src/lib/brand/brandSvg.js` from outlined geometry, so `Logo.astro`, the favicons, `public/brand/*.svg`
  and the OG cards share one drawing. The header lost its top rail and is now a centred editorial row
  that becomes a glass pill on scroll; the footer is about half as tall. Detail and the regeneration
  commands: `docs/logo-concepts/README.md`, `docs/02-design-system.md`, `.claude/rules/design-system.md`.

- Live site: https://mas-monograms.nathanjnixon86.workers.dev (custom domain `mas-monograms.com` pending)
- Studio (Mary Ann's editor): **`<site>/studio`** — embedded in the site build since
  2026-08-28. The old hosted https://mas-monograms.sanity.studio still exists and is now
  a stale duplicate; retiring it and moving Mary Ann's bookmark are in `docs/PENDING.md`.
- Repo `NateJ45/mas-monograms` (private) → auto-deploys via **Cloudflare Workers Builds** on push to `main`
- Real contact info + photography are in; the `popularCombination`/`testimonial` types and the stats
  strip were removed. Remaining before launch: confirm socials, replace the starter thread inventory,
  a few image gaps (About portrait, OG images), quote-form secrets + R2 bucket. Full checklist +
  env-var matrix in `docs/08-deployment-and-status.md`.

- **GA4 wired, inactive (2026-10-04).** `<Analytics />` (PORTABLE) renders GA4 only once `PUBLIC_GA_ID` is set as a **build** variable in Cloudflare Workers Builds (no id exists yet; never put one in `ci.yml`). It fires only on `mas-monograms.com`. Before enabling it, change the Privacy copy in Sanity (says "cookie-free"). `docs/08`, `docs/PENDING.md`.

## Commands

Run from the repo root. Node scripts are in `package.json`.

- `npm run dev`: site at localhost:4321, Studio at localhost:4321/studio
- `npm run build`: `prebuild` frees `dist`, then `astro build` via `scripts/with-workerd.mjs`
- `npm run preview`: `wrangler dev -c dist/server/wrangler.json` on the last build (the only way to test SSR routes locally)
- `npm run check`: `astro check && npm run lint`. `npm run check:full`: typegen + check + unit tests + build
- `npm run typegen`: after ANY schema change, then commit `src/lib/sanity.types.ts`
- `npm run test:unit` (node tests), `npm test` (Playwright smoke/axe/reflow), `npm run format:check`
- `npm run parity` (render parity), `npm run sync-check` (PORTABLE drift)
- Full-page screenshots for review: scroll through the page first or `[data-reveal]` bands capture blank (`docs/TESTING.md`)
- `npm run deploy`: build + `wrangler deploy -c dist/server/wrangler.json`. Not the normal path.

## Stack

- **Astro 7.2** — `output: 'static'` plus a handful of SSR routes, `@astrojs/cloudflare`
  adapter pinned **exactly 14.2.4**, Sharp image service, `session: false`
- **Cloudflare Workers** — unified Pages/Workers platform, Git auto-deploy (Workers Builds),
  `wrangler.jsonc`; wrangler pinned **`~4.110.0`**
- **Sanity 6.4** — headless CMS. The Studio lives IN THIS PACKAGE (schemas in
  `src/sanity/schemaTypes/`, desk in `src/sanity/structure.ts`, config at the repo-root
  `sanity.config.ts`, CLI config in `sanity.cli.ts`) and is **embedded at `/studio`** via
  `@sanity/astro`, so it rebuilds with every deploy and can never drift stale. There is
  deliberately no `studioHost`/`deployment` in `sanity.cli.ts` so a stray `sanity deploy`
  cannot recreate a hosted copy. **The versions are a matched set — see gotcha 9.**
- **Live draft preview at `/preview/**`** through Sanity's Presentation tool: click-to-edit,
  live refresh over SSE, and in-canvas controls on the repeatable lists. See below.
- **Monogram Atelier engine** — vanilla TS canvas renderer in `src/lib/atelier/`, heavy math in a module
  worker (main-thread sliced fallback), lettering fonts lazy-loaded via `FontFace` from `@fontsource`
  great-vibes / playfair-display / cinzel. No animation or smooth-scroll library.
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Cloudflare Email Service** — transactional email from the quote form Worker (`send_email` binding `EMAIL`, no API key; replaced Resend 2026-10-04)
- **Cloudflare R2** (`QUOTE_BACKUP` binding → `mas-monograms-quotes` bucket)
- **Cloudflare Turnstile** — CAPTCHA on quote form

## Absolute rules

### Sanity-first — NO hardcoded content

Every string visible on the site must come from Sanity: headings, prose,
button labels, form labels, pricing, gallery captions, FAQ answers.
Mary Ann must be able to edit everything without touching code.

### No dark mode

The brand is warm linen/ink/indigo/claret ("Heirloom Coast"). There is no `.dark` CSS, no
theme toggle, and no theme-bootstrap script anywhere in the codebase — this was a considered
decision (not just an unused old rule), see `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`.
Do NOT add a ThemeToggle component or reintroduce a `.dark` class. Dark SECTIONS (Midnight, Indigo
bands via `.surface-midnight`) are part of Direction D and are fine; the site itself stays light-first.

### No fabrication

No invented reviews, years in business, client names, prices, order counts, awards or claims. Use only
facts already in Sanity or the docs (home-based, St. Matthews SC, started as a hobby about three years
ago, orders go straight to Mary Ann, hand-stitched locally). `sampleMonograms` are made-up initials,
never real people's names.

### No Web3Forms

The quote form backend is a Cloudflare Worker + Cloudflare Email Service. Do not use Web3Forms or Resend.

### Clearance items — Stripe Payment Links only

No cart, no checkout code. Each `clearanceItem` doc has a `stripePaymentLink`.
The buy button is a plain `<a href={...}>` that links to Stripe.

### Worker secrets — never in the repo

`TURNSTILE_SECRET_KEY`, `SANITY_API_READ_TOKEN`
are set via `wrangler secret put`. Never write them into `.env` or commit them.

## Branch, CI and deploy

- `main` is the only long-lived branch (2026-10-03: staging abandoned). Work on a short-lived branch, open a PR into `main`, and merge only when CI is green (required checks are named exactly `build` and `test`).
- `ci.yml` runs on pushes to `main` and on PRs: two parallel jobs, `build` and `test`, which are the required checks. No path filter, ever; do not adopt the starter's split/aggregator layout (measured slower here, see docs/TESTING.md "CI shape"). Merging to `main` is the production deploy (Cloudflare Workers Builds).
- `npm run preview` runs `wrangler dev -c dist/server/wrangler.json` against the last build.
  That is the only way to exercise the SSR routes and the real response headers locally; a
  static file server proves nothing about them.
- Deploy: push to `main` → Cloudflare Workers Builds auto-builds & deploys. The site reads
  Sanity at build time, so Sanity vars must be set as **build** variables in the Cloudflare
  dashboard, not runtime (see `docs/08`). Local `wrangler deploy` is not the normal path —
  and when it is used it must be `wrangler deploy -c dist/server/wrangler.json` (gotcha 10).

## Never-break gotchas (the rest are numbered in .claude/rules)

<!-- prettier-ignore-start -->
12. **Never rewrite a repo file through PowerShell `Get-Content`/`Set-Content`.**
    `Get-Content` decodes as ANSI on this machine, so a round trip turns every
    em-dash into mojibake and the re-encode is lossy enough that it cannot be
    undone in place. It corrupted `src/sanity/structure.ts` on 2026-08-28 and cost
    a `git checkout` and a redo. Use the editor's own edit tooling for content
    changes; keep PowerShell for running commands.
13. **Curling a page is not verifying it.** `/studio` returns 200 with real HTML
    while being completely broken at React mount. Anything that mounts a client
    framework has to be opened in a real browser with the console read. A healthy
    embedded Studio on an origin that is not yet CORS-allowed shows Sanity's own
    "Connect this Studio to your project" screen and CORS errors in the console,
    and **nothing else** — no styled-components error #18, no
    "Cannot read properties of undefined (reading 'v2')".
<!-- prettier-ignore-end -->

## Docs and rules map

Path-scoped rules in `.claude/rules/` load only when you touch matching files.
The numbered gotchas keep their original numbers because code comments cite them.

- `.claude/rules/atelier-engine.md`: the Monogram Atelier engine, stage components, API, perf numbers, tuning, dev-server and Lenis notes
- `.claude/rules/design-system.md`: Heirloom Coast + Direction D design note, typography, palette, component authoring, gotchas 4, 14, 15
- `.claude/rules/live-preview.md`: `/preview/**`, stega, SSE proxy, in-canvas controls, "Edit here" card
- `.claude/rules/site-routes.md`: route table, quote query-string contract, quote Worker, redirects, JSON-LD
- `.claude/rules/sanity-studio.md`: query pattern, Studio notes, atelierSettings and seed scripts, gotchas 1, 7, 8
- `.claude/rules/dependencies-and-deploy.md`: matched version set and pins, gotchas 9, 10, 11 (read before ANY dependency or deploy change)
- `.claude/rules/ci-and-scripts.md`: workflows, scripts, parity, gotchas 2, 3, 5, 6

- **`PRODUCT.md`** (audience, purpose, tone, anti-references; the customer and reference-site answers are proposed by Claude from repo evidence, unconfirmed by Nathan) and **`DESIGN.md`** (the visual system as built, Direction D) sit at the repo root. Read them before any design work and update them in the same change when the system moves.
- **`docs/PENDING.md`** — the authoritative registry of open patches and
  waiting-on-a-human items. Edit it in the same commit that opens or closes one.
- **`docs/TESTING.md`** — which check covers what, and how to run each.
- **`ncs-astro-sanity-starter/PORTS.md`** — the library of record for the shared
  build/QA plumbing this repo now carries. Files whose first lines say
  `PORTABLE: canonical copy ...` are owned there, not here: change them in the
  starter and pull forward. `npm run sync-check` (with `NCS_STARTER_DIR` set, or
  the starter checked out as a sibling directory) proves there is no drift.

## Vault

Business context and decisions live in `_vault/clients/mas-monograms.md` at the
Projects root (read its `## Current state` first). Work log: the note keeps a `## Work log`, so append a row (`- YYYY-MM-DD | ~Xh | summary`) at the end of each real-work session and commit and push `_vault/` (`_vault/README.md` rule 6), even though `plan` is `none` (hours are the contract-evidence record). Update the repo docs
(this file, the rules, `docs/PENDING.md`) in the same piece of work as any change.

## Ports

`ncs-astro-sanity-starter/PORTS.md` is the registry. Files marked `PORTABLE:` are
canonical in the starter and checked by `node scripts/sync-check.mjs`. A generalising
fix gets a port card in the same commit. Cross-project lessons go to
`_vault/gotchas/` with a "Ported to" checklist.

`.claude/settings.json` is a PORTABLE deny-rules file (blocks `git reset --hard` and force
pushes) copied byte-for-byte from the starter (port card 71) and covered by
`sync-check`. The starter's shared conventions import was deliberately NOT adopted here.
