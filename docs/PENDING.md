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

### From the 2026-10-04 audit-fix pass (branch `chore/audit-fixes`)

- **Content for Mary Ann (Sanity, not code).** Eyebrows long enough to read as all-caps body:
  `/request-a-quote` "Free · About 2 minutes · No payment now" (39 characters) and `/how-it-works` "No cart.
  No checkout. No guessing." (34); shorten them or move the line into the lede. Quote-form labels mix
  Title Case ("Personalization Details", "Thread Color Preference (Optional)") with sentence case now that
  they are no longer uppercased; make them sentence case. The Terms page body has em-dashes ("A quote is
  an estimate — it does not..."); house style is commas or colons.
- **Swash fallback reflow on a slow first load** (pre-existing, now shorter). Until the 46 KB swash
  subset arrives (~1.8s on a 1.6 Mbps throttle, was ~2.3s with the full italic) the swash word paints in
  the system italic, which is wider and can rewrap the headline. Fallback metric overrides cannot fix it:
  the swash's width against Georgia italic runs 0.78 to 0.92 across sizes (opsz). Options if it matters:
  `font-display: block` for the swash face only (invisible for that window instead of restyled).
- **Detector false positives left on URL scans** (not bugs, recorded so nobody chases them): low-contrast
  on dark sections (their ground is a `::before`, so the tool composites against Linen), gradient-text on
  the gold swash, hero-eyebrow-chip / kicker-above-heading (the eyebrow is the incumbent identity),
  italic-serif-display, cream-palette, marquee, dark-glow, repeating-stripes-gradient (the linen weave),
  buried-raster, nested-cards (swatch cards in a panel), shape-assembled-illustration (spools and hoops),
  tight-leading on the about pull quote, gray-on-color for taupe text on Kraft (5.2:1, a palette pair).
  Lighthouse and axe are the accessibility truth and both are clean.
- **`DESIGN.md` and `PRODUCT.md` are not in the `@source not` list** in `globals.css`, so class names
  they mention could keep utility rules alive. Add them in a render-neutral pass and re-capture parity.

### From the 2026-10-04 logo, header and footer rework (branch `redesign/header-logo`)

- **Text in the logo is outlined**, so the brand name inside the drawing cannot come from Sanity; the
  accessible name does (`siteSettings.title`). If the business name ever changes, regenerate with
  `docs/logo-concepts/2026-10-04-atelier/generator/brand.mjs` (needs Python fontTools).
- **The Brand kit panel's logo paragraph is hard-coded** (Studio handbook copy in
  `src/sanity/components/BrandKit.tsx`). Left in code on purpose (2026-10-04): the whole Brand kit panel
  is static by design (colours, fonts and logo links, no fetch), and the paragraph is Studio-only, never
  on the public site. Move it only if the panel ever becomes a document. (The phone menu's "At the
  bench" eyebrow moved to `siteSettings.menuContactLabel` on 2026-10-04.)

### From the 2026-10-04 Direction D redesign ("The Atelier", branch `redesign/atelier`)

- **A few hard-coded words are still left on `/style-gallery`** (found 2026-10-04 while paying off the
  Sanity-field list, which is now done): the intro link "Start your quote", the "+ N more" / "Less" tag
  toggle, the filter group's accessible name "Filter gallery", the "Filters" fallback group heading, and
  the " font" suffix after a font name under each photo (`GallerySwatch`). Next field pass: add them to
  `styleGalleryPage` and seed through `scripts/seed-pending-fields.mjs` (setIfMissing).
- **The Start Here "Website pages" row still mentions a per-page "Preview" tab** (and the "You can always
  undo" tip). That wording is owned by the unapplied `scripts/patch-studio-guide-presentation.mjs` (see the
  activation step above). The Monogram Preview page itself was added to the handbook on 2026-10-04 (a map
  row and a how-to, through `seed-studio-guides.mjs`'s add-only mode).
- **Performance: mobile LCP is now 2.9 to 3.8s, still font bound.** Measured 2026-10-04 (gzip server,
  Lighthouse mobile, median of 5): perf 83 to 93 on the 12 audited URLs, TBT 0, CLS at most 0.002,
  accessibility 100 on every run. Slowest: `/about` 3.76s and `/style-gallery/` 3.61s (photo LCP),
  `/` 3.38s. All under the 4.5s CI budget. The remaining cost is the Fraunces italic (next item).
- **Fraunces italic and LCP: decided NOT to defer it (2026-10-04).** Deferring the full italic
  build (the `.swash` words) brings mobile LCP to about 2.6s, but every page then paints a synthetic
  oblique for a beat and swaps to the real italic, which reads as a glitch on the headline itself. Not
  shipped. Revisit with a swash-only subset font (only the glyphs the swash words use, preloaded),
  which would keep the real italic on first paint at a fraction of the bytes.
- **Atelier: small leftovers after the column sweep.** The column sweep (2026-10-04, second pass) made
  the block `A` leg, the `M` and `N` diagonals, the `S` terminal and the `X` crossing clean columns (short
  rows on the fixed test sheet down from 1072 to about 200, most of those now short bridging rows inside a
  column). Still visible on zoomed crops: the bracketed serif feet (`A`, `M`, `F` bases) mitre with a
  slightly ragged edge; a `B`, `S` or `K` curve fans a little on its outside; a faint row-family seam can
  cross a wide column (the top of the block `A` right leg); in the block `N` the heavier stems keep the
  corners, so the diagonal ends on a short level mitre. Mitres on dark thread are now a faint light line.
  (`src/lib/atelier/columns.ts`, `stitches.ts`; see `.claude/rules/atelier-engine.md`.)
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

- 2026-10-05: **The header pill is real frosted glass** (branch `fix/pill-blur`). Its blur had never
  rendered: `view-transition-name` on `<header>` made it a backdrop root. The name moved to three
  sibling layers (row, glass, shadow), the stitch moved onto the row, old header snapshots are hidden
  during navigations (which also ends the header double-printing into the overlay home page). Tint
  90% to 78% Paper, solid fallbacks for no blur and reduced transparency. Gotcha 16 in
  `.claude/rules/design-system.md`; test in `tests/header.spec.ts`.

- 2026-10-04: **Audit-fix pass** (branch `chore/audit-fixes`, after a 15/20 Impeccable audit). Phone menu
  (a real-phone report): no needless scroll at 360x640 to 430x932, twill covers the whole scroll box, a
  test guards it. Header morph is compositor-only (38 layouts per toggle to 1 to 6, layout shift 0). Italic
  subsets: LCP on `/` 3384 to 3009ms. Typeset: labels at 0.75rem minimum, sentence-case form labels, hero
  placeholder at full on-dark muted, reading measures about 70 characters, dead `.prose-blockquote` removed,
  em-dashes out of the quote form's fallback copy. Extract: quote emails in Heirloom Coast, text-step /
  radius / wood / white tokens, src detector findings 257 to 0 (`.impeccable/config.json` holds the reasoned
  ignores). Detail: `docs/TESTING.md`, `docs/02-design-system.md`.

- 2026-10-04: **Hoop crops, the no-JS quote note, concentric stitches** (branch `chore/leftover-fixes`).
  New `galleryItem.hoopFit` ("Show it in a round hoop?"); 9 photos that cannot make a round crop are flagged
  `poor` (`scripts/seed-hoopfit.mjs`, backup `tmp/backups/production-2026-10-04-hoopfit.tar.gz`) and stay out
  of every hoop (`src/lib/hoop.ts`; `/towels-linens` had one in its hero cluster). Hoops now honour the
  hotspots (`IMG_HOOP`). The quote form still needs JavaScript to send (Turnstile is kept), but a `<noscript>`
  note (`requestAQuotePage.noScriptMessage`) now gives Mary Ann's email and phone as links. The quote card,
  thread-chart and quote-preview mounts, header dropdown and the pinked cloths now have concentric stitches.

- **2026-10-04: everything from the redesign day is closed.** Redesign, quote email (Cloudflare Email Service, Email Sending onboarded for mas-monograms.com), Turnstile (widget, secret, build variable, action and hostname checks), phone made optional, hotspots on all 76 gallery and category images (`scripts/set-hotspots.mjs`, decisions in `scripts/data/hotspots-2026-10-04.json`), label fields seeded, handbook entry added. The first real quote request is the live test of the email path.

- 2026-10-04: **Logo, header and footer rework** (branch `redesign/header-logo`). The Hoop Seal and the
  Signature Thread wordmark replace the Flourished Initial and the Shopkeeper's Badge everywhere (header,
  phone menu, footer, favicons and app icons, `public/brand/*.svg`, OG cards, the Studio logo and the
  Brand kit panel). The header's contact strip is gone (contact lives in the phone menu's "At the
  bench" and the footer); the header is a centred editorial row that becomes a glass pill on scroll.
  Footer about half as tall. Per-page OG cards now exist (`npm run og:pages`, `src/lib/brand/ogPages.json`).
  Gates: `check:full` green (338 unit tests), Playwright 218/218, parity re-captured (23/23 on two
  rebuilds), Lighthouse mobile accessibility 1.0 on /, /about, /pricing, /request-a-quote,
  /thread-color-chart, tap targets 0 under 44px at 390 and 320.

- 2026-10-04: **Render-parity baselines regenerated for Direction D.** Compare against the old
  baselines was 0/23 (expected: every page was rebuilt). Re-captured from a plain `npm run build`, then
  two further clean builds compared 23/23 PASS both times. Same pass: `/thank-you` reduced motion, the
  1024px reflow on `/shop-by-item` and `/style-gallery`, the about facts list at 390px, the golden
  thread crossing the header on overlay pages, the no-JS marquee (moved with no way to pause), the
  no-JS hero field (did nothing) and the no-JS FAQ (answers missing from the HTML) were fixed, and
  `tests/features.spec.ts` was added (see `docs/TESTING.md`).

- 2026-10-04: **Atelier follow-ups closed.** Satin columns from the medial axis (`columns.ts`, straight
  ray rows) replace the fanned seams in B, F, K and the serif bases; the quote and thread-chart scripts
  call `setDesign` directly (no `dataset.ready` guard, no `atelier:progress` reconcile; 5 repeats green);
  `QuotePreview` passes `lazy` (no engine fetch without initials); the 16 to 32px favicon is now the
  hoop and a single gold M. The 8 "stolen-tap" warnings from `measure-tap-targets.mjs` at 390px are the
  scan's own scroll stops (each element hit-tests as itself when centred), but a focus probe found two
  gallery buttons landing under the sticky header on Shift+Tab: `html { scroll-padding-top }` from
  `--header-h` fixed that (2 obscured before, 0 after on four routes).

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
