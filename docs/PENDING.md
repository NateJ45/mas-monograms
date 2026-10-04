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

### From the 2026-09-06 Sanity phase-1 stack bump

- **Sign in to the live Studio, then open Presentation.** The stack moved to
  `sanity` 6.9.1 / `@sanity/ui` 3.5.4 / `@sanity/client` 7.26.2 /
  `@sanity/visual-editing` 5.7.3 / `@sanity/preview-url-secret` 4.1.5. Every
  automated gate is green and the single-instance invariant holds on disk and in
  the bundle (one `@sanity/ui` 3.5.4, one `styled-components` 6.5.3, one
  styled-components `errors.md#` chunk). But the failure this pinning regime
  exists for shows up ONLY after sign-in: the login screen is core code and
  renders fine even when the theme context is broken. So open `/studio` on
  the live site, sign in, open a document with a custom component pane, then open
  **Presentation** and hover a headline so the in-canvas text popover draws and
  a bold or italic toggle writes back. If the desk throws styled-components
  error #18 or `Cannot read properties of undefined (reading 'v2')`, the bump is
  bad and the revert is the two-file diff on package.json + package-lock.json.
  Bonus while you are in there: 6.6.0 added **tables in Portable Text**, so a
  table should now be insertable in body copy.

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
- **Activation step (after the Studio rework is LIVE):** run
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

- **Backups are deliberately OFF (Nathan, 2026-10-03).** The nightly
  `.github/workflows/sanity-backup.yml` was only ever warn-and-skip (no
  `SANITY_AUTH_TOKEN`), so it reported green without backing anything up. It is
  now disabled in GitHub (`gh workflow disable 344134314 --repo NateJ45/mas-monograms`;
  the file stays in the repo). There is no second copy of Mary Ann's content
  anywhere and no restore drill. To turn backups on later: create a **read** token
  at sanity.io/manage → project `xp3elugr` → API → Tokens, set
  `SANITY_AUTH_TOKEN` and `BACKUP_PASSPHRASE` with `gh secret set`, run
  `gh workflow enable 344134314 --repo NateJ45/mas-monograms`, confirm a real run,
  then do `docs/RESTORE-DRILL.md`.
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

### From the 2026-10-04 Direction D redesign ("The Atelier", branch `redesign/atelier`)

- **Land the branch.** 8 commits ahead of `main`, no PR as of 2026-10-04. Needs a PR with green `build`
  and `test`, then a live-site check after merge. Until then production is still the Direction C look.
- **Confirm `scripts/seed-atelier.mjs` has been applied** to the production dataset (dry run is the
  default; backup is `tmp/backups/production-2026-10-04.tar.gz`, gitignored). Until `atelierSettings`
  exists, the Atelier pages fall back to short neutral strings in code.
- **Sanity fields the page work wanted but could not add** (each is currently a neutral code fallback,
  which breaks Sanity-first; add the field, query it, seed it, then drop the fallback):
  - `pricingTier.highlightLabel`, `pricingPage.tierPricePrefix`
  - `font.popularLabel` / `fontGuidePage.popularLabel`, and an `atelierStyle` key per font (so a font's
    "try it" button can load the matching Atelier style)
  - `legalPage.lastUpdatedLabel`
  - `thankYouPage.nextStepsLabel`, `thankYouPage.responseTimeLabel`
  - `notFoundPage`: `getNotFoundPage` should also fetch `seoTitle` / `seoDescription`
  - `styleGalleryPage`: lightbox labels (dialog name, close, previous, next) and the announcement text
  - `itemCategory`: `galleryHeading`, `requestSimilarLabel`, `crossSellHeading`
  - `clearancePage.quantityLeftLabel`
  - `threadChartPage.filterLabel`
  - `atelierSettings`: pause and play labels for the hero and the Marquee (WCAG 2.2.2; `Marquee` falls
    back to "Pause" / "Play" today)
- **Set hotspots on the 69 gallery photos and the category card images.** None has one, so every hoop
  and swatch crop defaults to the centre (`getGalleryItemsForWall` returns `hotspot: null`). `HoopFrame`
  also takes a `focal` prop as a stopgap.
- **Add the new Monogram Preview page to the Start Here handbook.** `scripts/seed-studio-guides.mjs` lists
  the page singletons (line ~96) without "Monogram Preview (live stitching)", and still mentions a per-page
  "Preview" tab. Patch through `scripts/lib/sanity-lib.mjs` (dry-run gate).
- **Performance: mobile LCP is now 2.9 to 3.8s, still font bound.** Measured 2026-10-04 (gzip server,
  Lighthouse mobile, median of 5): perf 83 to 93 on the 12 audited URLs, TBT 0, CLS at most 0.002,
  accessibility 100 on every run. Slowest: `/about` 3.76s and `/style-gallery/` 3.61s (photo LCP),
  `/` 3.38s. All under the 4.5s CI budget. The remaining cost is the Fraunces italic (next item).
- **Fraunces italic and LCP: decided NOT to defer it (2026-10-04).** Deferring the full italic
  build (the `.swash` words) brings mobile LCP to about 2.6s, but every page then paints a synthetic
  oblique for a beat and swaps to the real italic, which reads as a glitch on the headline itself. Not
  shipped. Revisit with a swash-only subset font (only the glyphs the swash words use, preloaded),
  which would keep the real italic on first paint at a fraction of the bytes.
- **Quote form: the phone label says "(Optional)" but the field is required.** The Sanity
  `requestAQuotePage.phoneLabel` reads "Phone Number (Optional)" while the input carries `required`
  and `POST /api/quote` rejects an empty phone (same on `main`). Decide which is true: either change
  the label in the Studio, or drop `required` from the input and the Worker check. Content or product
  call, not a code bug in this branch.
- **The quote form needs JavaScript to send.** With JS off every field renders and reads fine, but
  Turnstile cannot run, so the Worker rejects the post. The Atelier studio's hand-off (a GET form)
  and every link work without JS. Acceptable for now; noted so nobody assumes otherwise.
- **Simplify the consumer workarounds** in `QuotePrefillScript` and `ThreadChartScript`: they guard against
  the engine starting late (writing `data-*` and checking `stage.dataset.ready`). The engine now applies
  the latest `setDesign` itself, so they can call it directly.
- **Wire the `lazy` prop in `QuotePreview`** if wanted: its stage is hidden until initials arrive, and
  `lazy` keeps the engine from loading on idle for a visitor who never uses the preview.
- **Heavy block-letter seams.** Bowls of B, the arm of F and the leg of K in the `block` style still show
  seams where tatami rows meet (`src/lib/atelier/stitches.ts`, `field.ts`).
- **Removed on 2026-10-04: Lenis smooth scroll** (script, dependency, hero cue hook). Not an open item;
  recorded so nobody reintroduces it.

- **The parity baselines are unowned until the first real refactor.**
  `scripts/.parity/*.html` holds 23 committed snapshots (re-captured 2026-10-04 for Direction D) off
  a clean build. They only earn their keep if `npm run parity compare` is
  actually run after a render-neutral change. Re-capture only when a markup
  change is _intended_, and say so in the commit message.
- **`scripts/lib/sanity-lib.mjs` is installed but unused.** Ported 2026-08-27 so
  the _next_ seed or patch script gets a dry-run gate for free instead of
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

- **Quote emails need one dashboard step before they work (2026-10-04, PR email/cloudflare-quote).**
  The Worker now sends through the Cloudflare Email Service `EMAIL` binding. Until `mas-monograms.com`
  is onboarded under Compute > Email Service > Email Sending (Nathan, dashboard; the wrangler token
  lacks Email Sending permission), the owner send fails and the form shows an error (the request is
  still saved in R2). Then send one real test quote and confirm both emails land.
- **Turnstile is wired but not live (2026-10-04).** `/api/quote` now verifies the token with the
  action `quote` and our hostnames only (fail closed on any siteverify error), and the widget carries
  `data-action="quote"`. Still missing: the widget itself (the wrangler API token can list but not
  create widgets: it needs `Account.Turnstile:Edit`), the `TURNSTILE_SECRET_KEY` Worker secret, and the
  public site key as `PUBLIC_TURNSTILE_SITE_KEY` in a build env file. Until the secret exists the
  Worker skips the check, and until the site key exists the form shows no widget.

## Standing risks (not tasks)

- **Worker secrets live only in Cloudflare.** `TURNSTILE_SECRET_KEY`, `SANITY_API_READ_TOKEN` are set
  via `wrangler secret put` and are in no repo and no backup. Losing the
  Cloudflare account loses them.
- **Sanity refuses to delete a document other documents reference.** Cleanup
  scripts must unlink first, then delete. (Carried from the WCP repo.)
- **A quoted token in `.env` produces a 401 that reads like a permissions
  problem.** `scripts/lib/loadEnv.mjs` takes quoted values literally, quotes
  included. Write tokens bare. (Also carried from WCP.)

## Recently closed

- 2026-10-04: **Render-parity baselines regenerated for Direction D.** Compare against the old
  baselines was 0/23 (expected: every page was rebuilt). Re-captured from a plain `npm run build`, then
  two further clean builds compared 23/23 PASS both times. Same pass: `/thank-you` reduced motion, the
  1024px reflow on `/shop-by-item` and `/style-gallery`, the about facts list at 390px, the golden
  thread crossing the header on overlay pages, the no-JS marquee (moved with no way to pause), the
  no-JS hero field (did nothing) and the no-JS FAQ (answers missing from the HTML) were fixed, and
  `tests/features.spec.ts` was added (see `docs/TESTING.md`).

- 2026-10-04: **44px tap targets at 390px (PORTS cards 82 and 83).** Footer rows, contact and
  legal links, the arrow links, gallery filter chips, `.form-input` and the quote form's radios and
  checkbox now meet the floor: 0 under 44px on all 22 routes (was 23 to 149), inline-in-sentence
  links exempt. Footer is taller (about 300px on a phone, 160px on desktop). Parity baselines were
  not recaptured: they were already stale against the live content before this change.
  `measure-tap-targets.mjs` is now a marked file (34). Follow-up fixed the same day: the starter's
  scan now skips closed `<details>` content (starter PR #85, taken here by straight overwrite).
  `/style-gallery/` at 390px: 68 false stolen-tap warnings before, 0 after (68 again with
  `--include-closed-details`); all 22 routes still 0 under 44px. See `docs/TESTING.md`.

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
