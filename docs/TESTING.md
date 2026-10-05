# TESTING — which check covers what

Created 2026-08-27 during the starter sync session (PORTS.md card 15). The point
of this file is that nobody writes a fourth check that duplicates the second.

## The checks

| Check             | Command                                                                 | Runtime                                                                                          | Covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests        | `npm run test:unit`                                                     | Node's built-in runner (`node --test`, type-stripped)                                            | Pure functions in `src/lib/*.test.ts` and `scripts/lib/*.test.mjs`: slugify, reservedSlugs, scriptAccent, sectionVisibility, utils, reading-time, phone, image-import helpers, the page-fields drift gate (every line of words the real pages draw, 2026-10-05), **preview-stega-filter** (stega safety of the real pages in the canvas: clean fields, marker-safe cutting, click targets absent on the live site, no unprotected whitespace splits in page files), **theme-tokens** (below), and the Studio checks (2026-10-05): `studio-targets` (Welcome cards and deep links point at panes the desk has, every desk pane has an explicit id, no jargon or em-dashes), `studio-templates` (starting templates match the schema), `studio-theme` (Studio colour contrast and the larger type ramp), `undoRedo` (PORTABLE) and `audit-studio` (the audit's pure helpers); `src/lib/qr/qr.test.ts` (2026-10-05, Phase E): the QR tool's link tagging, sizes, seal fit and colours, and every destination x placement decoded back by a second implementation (`jsqr`, dev dependency) with the seal hole and busy seal art drawn in; Get found site pass (2026-10-05): `utm` (the source-tag whitelist, first-touch session store with a fake window, the owner-email wording), `review-link` (drawn only for a real https address), `schemas` (LocalBusiness `sameAs`: social links plus the Google listing, https only), and `quote-email` gained the "Where they found you" row (owner only, escaped, hidden with no tags)                                                   |
| Type check + lint | `npm run check`                                                         | `astro check` then eslint                                                                        | The family-standard "is it clean" command: zero `astro check` errors, zero eslint errors. Run before pushing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Everything green  | `npm run check:full`                                                    | local                                                                                            | typegen, `npm run check`, unit tests, Astro build (which includes the embedded Studio)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Lint              | `npm run lint`                                                          | eslint                                                                                           | `eslint src scripts tests` — eslint does its own globbing (the `files` patterns in `eslint.config.js` pick up ts/tsx/astro/mjs), so coverage is identical on Windows and Linux CI. Three pre-existing unused-var **warnings**; zero errors is the bar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Format            | `npm run format:check` / `npm run format`                               | prettier + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`                               | Every file prettier can parse, minus `.prettierignore` (generated files, parity baselines, `docs/superpowers`). The tailwind plugin also sorts class lists                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Browser suites    | `npm test` (`npm run test:ui` for the inspector)                        | Playwright, chromium + WebKit iPhone 14, against a fresh `npm run build` served by `http-server` | `tests/smoke.spec.ts` (200 + brand in `<title>` per route), `tests/a11y.spec.ts` (axe default rule set, zero violations), `tests/reflow.spec.ts` (no horizontal overflow at 320 and 1440/1024/768), `tests/reduced-motion.spec.ts` (under `prefers-reduced-motion: reduce` no transition is left running; PORTS.md card 61), `tests/features.spec.ts` (Atelier, quote prefill, quote source tags, thread chart, lightbox, phone menu), `tests/atelier-consumers.spec.ts` (what the ENGINE draws after the quote prefill and the thread-chart rack drive it, and no engine fetch on `/request-a-quote` without initials), `tests/header.spec.ts` (no top rail on any route, the pill condenses inside a fixed box at 1440 and 390, the hero clears the header, keyboard dropdowns, the no-JS header; since the 2026-10-04 audit-fix pass also that the pill layer is hidden at rest and shown when scrolled and that the row keeps one layout box in both states; since 2026-10-05 that the pill's glass has a `backdrop-filter`, that no ancestor of it is a backdrop root (clip-path, opacity, filter, mask, mix-blend-mode, backdrop-filter, will-change or view-transition-name), and, on chromium, that black and white stripes behind the pill come out blurred: these three fail on the pre-fix build). Playwright's Windows WebKit never paints `backdrop-filter` at all, so the pixel check is chromium-only. Routes come from `tests/routes.ts`. 233 tests, all green 2026-10-05 (Get found site pass, +4 "Quote source tags"); credential-less: 118 passed, 16 skipped |
| Internal links    | `npm run check:links`                                                   | linkinator over `dist/client`                                                                    | Every internal link resolves. `/studio`, `/preview` and `/api` are skipped (SSR, or a bare React mount shell)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CI                | push to `main`, any PR, or manual dispatch (`.github/workflows/ci.yml`) | GitHub Actions                                                                                   | `build` job: install, typegen (3-attempt retry), the **stale-types guard**, `astro check`, lint, format check, unit tests, credential-less Astro build (Studio included), link check. `test` job (parallel): the Playwright suites, report uploaded as an artifact. Both jobs are real, independent, parallel jobs named exactly `build` and `test` (the required checks); see "CI shape" below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Lighthouse CI     | `npm run lighthouse` (`.github/workflows/lighthouse.yml`)               | Headless Chrome over `dist/client`                                                               | The 12 routes in `lighthouserc.json` on push to `main`, a weekly cron and manual dispatch; on a PR, only when score-moving paths change, and only 6 routes (one per template, via `--collect.url`). **Accessibility is a hard gate at minScore 1**; LCP under 4.5s and CLS under 0.1 are also errors; performance / best-practices / SEO are warnings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Render parity     | `npm run parity capture` / `compare`                                    | reads `dist/client` (or `--dist <dir>` / `PARITY_DIST`)                                          | 23 built pages, byte-compared against committed baselines (below). `dist/client/studio/` is deliberately skipped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Library drift     | `npm run sync-check`                                                    | node, dependency-free                                                                            | Every `PORTABLE`-marked file, diffed against `ncs-astro-sanity-starter`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Uptime            | `.github/workflows/uptime.yml`, hourly                                  | curl                                                                                             | 4 live routes return 200 (needs the `SITE_URL` repo variable — see docs/PENDING.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## The data audit (`npm run audit:data`, not a CI gate)

`scripts/audit-data-vs-schema.mjs` checks every stored value against the compiled schema (needs the `.env`
token; run through tsx). It exists because array items stored without `_type` made the footer link lists
unopenable in the Studio on 2026-10-05, and nothing else could see that. Must end "Data matches the schema."
after any seed script, import or schema change. The pure helpers have unit tests (`scripts/lib/array-types.test.mjs`).

## The Studio audit (`npm run audit:studio`, not a CI gate)

`scripts/audit-studio.mjs` reads the registered schema files as text and the live dataset read-only, and
prints five checks: hidden-and-required fields, non-string preview titles, stored keys the schema does not
declare, required fields blank in the live data, and words Mary Ann should not read (em-dash, `<em>`, slug,
schema, field, document, URL, CTA...). Exit 1 if anything is found. Needs the `.env` token. Run it after any
schema change; it must end with "Studio is clean." The Studio itself cannot be driven by Playwright (it
needs a Sanity login), so the visual check stays manual (see `docs/PENDING.md`).

## The live-preview check (manual, but do it)

The preview stack is the one part of this repo that no automated gate covers, and
the starter explicitly asked the first real site to prove it (its own copy could
only be shown to fail closed, because that template has no Sanity project). Run it
after any change to `src/lib/cms-preview.ts`, `src/lib/preview-auth.ts`,
`src/pages/preview/`, `src/pages/api/draft-mode/`, or `sanity.config.ts`:

```powershell
npm run build
npm run preview            # wrangler dev -c dist/server/wrangler.json
```

Then, against the running server, the four things that must hold. Verified
2026-08-28 on port 8788 against project `xp3elugr`:

| Check                                                     | Expected                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET /preview/live?page=homePage` with no cookie          | **403** "Preview only"                                                                                          |
| `GET /api/draft-mode/enable` with a junk secret           | **401** "Invalid preview secret"                                                                                |
| `GET /api/draft-mode/enable` with a freshly minted secret | **302** to `/preview`, `Set-Cookie: sanity-preview-perspective=<64 hex>` with httpOnly + secure + SameSite=None |
| `GET /preview` with that cookie                           | 200, `data-draft="1"`, and **stega markers present**; the same URL WITHOUT the cookie must have **zero**        |

Mint the secret with `createPreviewSecret` from
`@sanity/preview-url-secret/create-secret` using the write token.

**Detecting stega is where this check goes wrong.** `@vercel/stega` hides its
markers in zero-width characters — `[​‌‍﻿]` — not in the
Unicode tag block (`U+E0000..U+E007F`). Measuring the tag block reads **zero on a
fully encoded string**, which looks exactly like a broken preview and sent this
session chasing a bug that did not exist. Measured correctly, `/preview` carries
about 20,000 marker characters with the cookie and 0 without.

Also worth running, and how the in-canvas controls get proven: count the
`data-sanity` attributes in the served preview HTML and compare them to what the
page draws. That check is what caught `homePage.trustItems` rendering no controls at
all, because it is an array of plain strings and primitives have no `_key` (see
`src/lib/preview-edit-attr.ts`). Since 2026-10-05 the preview is the real page, so the
count is two for the header and footer plus one per photo or list item the page draws
(home 34, how it works 6, pricing 12, about 12, gallery 71 on the 2026-10-05 data).

**Rendering the canvas locally without the Studio (2026-10-05).** In `astro dev` (only),
`?dev-draft=1` on a `/preview/...` URL turns draft mode on without the cookie, using the
token in `.dev.vars`: drafts, stega and the overlay, exactly as the canvas renders. Use it
to compare each preview with its live page (visible text of `#main` with the markers
stripped must be equal; screenshots at 1440 and 390 after `document.fonts.ready`), and to
scan the HTML for broken stega runs (decode every run with `stegaSource` from
`src/lib/preview-stega.ts`; a broken run is a split or trimmed marker, see
`src/lib/stega-text.ts`). `scripts/check-preview-bypass.mjs` runs in the CI build job and
fails if the switch is in the production bundle. `/preview/live` stays 403 there.

And note gotcha 13 in CLAUDE.md: `/studio` returns 200 with real HTML while being
completely broken at React mount. Open it in a real browser and read the console.

## The Playwright suites

Ported from WCP on 2026-09-05 (the family test standard). `npm test` builds the
site, serves `dist/client` on port 4321 and runs four route suites plus the feature suite on two browser
profiles (Desktop Chrome, and a WebKit iPhone 14 for smoke, a11y and reduced-motion):

| Suite                          | Asserts                                                                                                                                                                                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/smoke.spec.ts`          | every route answers 200 and its `<title>` carries "MAS Monograms"                                                                                                                                                                                                                                   |
| `tests/a11y.spec.ts`           | axe-core's DEFAULT rule set reports zero violations. Do not narrow it to `.withTags([...])`: the default set is what keeps this in step with (and slightly ahead of) the Lighthouse gate                                                                                                            |
| `tests/reflow.spec.ts`         | `document.documentElement.scrollWidth` never exceeds the viewport at 320px, then at 1440, 1024 and 768                                                                                                                                                                                              |
| `tests/reduced-motion.spec.ts` | PORTABLE (starter card 61, 2026-09-30). With reduced motion emulated, no element is left with a running transition. The global reset uses `transition-duration: 0s` plus `transition-delay: 0s` because WebKit never finishes a 0.01ms transition and strands the old values. Runs on both projects |

| `tests/features.spec.ts` | Direction D behaviour (added 2026-10-04, chromium only, 13 tests, about 30s): the home **Atelier studio** (typing cleans to 1 to 3 capitals; style, thread and fabric each update the stage `data-*`, the canvas `aria-label` and the live status; the engine ends on the typed design and the canvas holds real ink; Replay restarts from below 50% and reaches 1; reduced motion's FIRST progress event is 1; with JS off the studio is a GET form that lands on `/request-a-quote?initials=ABC&style=...`), the **quote prefill** (valid params fill Personalization, Thread colour and Item description and reveal the preview; `<img onerror>`, `<script>`, `"><svg onload>`, path junk and HTML in every param run no script, create no element and leave the fields empty), the **thread chart** (a spool recolours `#thread-stage`, names the thread, updates the canvas label and the CTA's `thread=`; the search narrows the rack and the count follows), the **gallery lightbox** (Enter opens, focus lands on Close, arrows step the counter, Escape and Close both close and return focus to the trigger, scroll lock released) the **FAQ accordion** (force-mounted answers stay hidden until clicked with JS, and are all visible with JS off) and the **phone menu** (placeholder at first paint, a tap mounts React, opens the sheet and Escape returns focus; with no tap it mounts on its own after load; at 390x844 the open panel's scrollHeight equals its clientHeight and its twill is on the scroll box itself, attached `local`). Each block skips with a reason when the build has no Sanity content for it (CI builds credential-less) |
| `tests/atelier-consumers.spec.ts` | Added 2026-10-04 (chromium, 5 tests, about 25s) when the consumer guards were removed: asserts `__atelier.getDesign()` (not only `data-*`) after a quote deep link, after a spool picked before the engine starts, after spools picked across its start-up (last wins) and after typed initials; and that `/_astro/engine*` and the worker are never requested on `/request-a-quote` without initials (the `lazy` stage). Skips when the build has no content |

`tests/helpers.ts` has `settle()`: wait for fonts, kill transitions, force the
`.img-curtain` and `[data-reveal]` end-states, so axe never audits a half-drawn
page and reflow never measures fallback font metrics.

**Routes.** `tests/routes.ts` hard-codes the eleven fixed pages and then
discovers whatever else the build emitted (`<dir>/index.html` in `dist/client`),
so locally, with `.env`, the eight item categories and the three legal pages run
too, and in credential-less CI the fixed pages still run. `/studio`, `/preview`
and `/api` are excluded on purpose: the first is a React mount shell that proves
nothing when curled (gotcha 13), the other two are SSR and not in `dist/client`
at all. **`npm run preview` is still the only way to exercise those** (below).

There is no dark-mode axe pass (the site has no dark theme, by decision) and no
visual-regression layer (that needs a fixture-driven `/styleguide` route, which
this site does not have; screenshotting CMS-driven pages would flake with
content).

**Full-page screenshots for visual review** (no committed visual layer, but the
rule holds for any ad-hoc capture, Playwright or otherwise). `fullPage` renders
the document without scrolling it, so the IntersectionObserver behind
`[data-reveal]` and `.img-curtain` never fires below the first viewport and every
revealed band lands in the PNG blank (a grey hole that looks like a design
decision). Before every full-page shutter: scroll through the page in
viewport-sized steps to the bottom, wait a beat, scroll back to the top, wait for
every `<img>` to be `complete && naturalWidth > 0` and for `document.fonts.ready`,
then capture. Any review screenshot with a large uniform band is re-taken, not
accepted. (Vault gotcha: fullpage-screenshot-skips-scroll-reveal. `tests/helpers.ts`
`settle()` solves the same problem for the test suites by forcing the end-states.)

Locally, `npx playwright test --project=chromium --workers=2` is the fast loop;
`reuseExistingServer` means a running `npm run serve:dist` is picked up instead
of rebuilding.

**Reduced motion and `animation-delay`.** The global reset shortens animation durations to
0.01ms but leaves `animation-delay` alone, so a CSS animation with a long delay is still
`running` (in its delay) when the 2.5s check samples it, and an infinite one plays once
afterwards. `/thank-you`'s tie-off (delays up to 3.1s, an infinite sway) failed the spec on
both projects for that reason; the page now sets `animation: none` on those elements under
reduce, which is the right fix for any decorative animation whose resting state is the
finished drawing.

**A stale build holding `dist` (the EPERM lesson, 2026-10-04).** A stray `astro dev` (and its
`workerd.exe`) left running by an earlier agent kept port 4321 and a handle on `dist`.
`reuseExistingServer` would then have run the whole suite against the DEV server, and a build
can fail with `EPERM ... dist\client`. Before a test run, list this project's node/workerd
processes (`Get-CimInstance Win32_Process` filtered on the repo path), stop only those, and
check nothing listens on 4321.

## Design detector (Impeccable, not a CI gate)

`sh ~/.claude/skills/impeccable/scripts/impeccable detect --json src` (exit 2 only means findings exist;
write output into your scratchpad, Node reads `/tmp` as `C:	mp`). It reads `DESIGN.md`'s frontmatter as
the design system and `.impeccable/config.json` for ignores. 2026-10-04: the src scan went from 257
findings to 0 (tokens for the recurring values, snaps for one-offs, reasoned ignores for component display
sizes, material shading, mask alpha, the email body and the editor-only preview and Studio code). URL scans
of a served build still report the advisory and false-positive classes listed in `docs/PENDING.md`.

## Measuring performance (Lighthouse)

Measure through a **gzipping** static server, never `http-server` or `python -m http.server`:
Cloudflare serves HTML, CSS and JS compressed, and an uncompressed local server inflates
transfer sizes enough to move LCP by a second and invent problems. A tiny `node:http` server
with `zlib.gzipSync` for text types is enough. Run mobile Lighthouse (default simulated
throttling) **5 times** and take the median: scores here tend to flip between two values
(for example LCP 3756 or 4215 on the same build) depending on which font or image finishes
first, and three runs can land two of the five on the unlucky side. Compare a before and an
after build served side by side on two ports, alternating, so machine load hits both.

Measured 2026-10-04 (gzip, 5 runs, medians): rendering `PortableText` at build time instead of
as a `client:idle` island (it has no state or handlers) removed ~110 KB of React and Sanity
helpers from `/about` and moved it from perf 82/83, LCP 4138/4215ms to perf 86/87, LCP 3756ms,
CLS unchanged. All `PortableText` islands were dropped the same way (clearance, font guide,
how-it-works, legal, pricing, quote, thank-you, thread chart, ProcessStep).

Measured 2026-10-04 (audit-fix pass, same method): the two Fraunces italic subsets
(`scripts/subset-fraunces-italic.py`) in place of the 150 KB full italic moved `/` from perf 87, LCP 3384ms,
FCP 2709ms to perf 91, LCP 3009ms, FCP 2409ms, CLS 0 both (two alternating rounds). The header morph probe
(Chrome `Performance.getMetrics` LayoutCount over the 900ms after crossing the 24px threshold) went from
38 layouts per toggle to 1 to 6, and layout-shift entries at 1440 from 24 to 0.

## CI shape (2026-10-03, starter PORTS.md card 70: deliberately NOT adopted)

`ci.yml` stays two parallel jobs, `build` and `test`, which are the required
checks (never rename them, never put a path filter on `ci.yml`: a required check
that never reports blocks the merge forever). Only `npm ci --no-audit --no-fund`
was taken from the card.

**Why the starter's split layout was rejected here.** The card splits CI into
`static` + `site`, then an `e2e` job that downloads the built `dist/client`, with
`build`/`test` as aggregator jobs, a Playwright browser cache and optional
shards. On this small site it was measured slower (PR #57, same commit, cold then
warm): **272s then 250s wall-clock against a mean of 212s** over the previous 15
runs. Reasons: the old `build` and `test` jobs already ran in parallel, so the
split only added a serial hop (`e2e` waits for `site`) and a second `npm ci`
(about 36s); the browser cache saved nothing because `playwright install-deps`
(apt libraries, 57s on a hit) cost more than the old full browser download (42s);
and the suite is only about 64s of tests, so sharding (two shards would save
about 32s, three about 43s) cannot repay a per-shard install. Revisit only if
the suite grows to several minutes.

**Lighthouse is where the time was** (about 537s mean, the slowest workflow). It
is not a required check, so `lighthouse.yml` (workflow name stays `Lighthouse CI`:
the dependabot auto-merge workflow listens for it) now runs on push to `main`
(path-filtered), weekly, and manually with the full 12 URLs, and on a PR only when
score-moving paths change, on 6 URLs (`/`, `/pricing/`, `/request-a-quote/`,
`/style-gallery/`, `/thread-color-chart/`, `/404.html`, one per template). Job time
on the sample was 283s. Assertions and median-of-3 are unchanged.

## The stale-types guard

`npm run build` does **not** chain typegen, so `src/lib/sanity.types.ts` is
committed by hand after every schema change. CI regenerates it and fails if that
produces a diff. It found a real staleness the day it was installed (two
`studioGuide` fields missing). Two consecutive local `typegen` runs were verified
byte-identical, so a diff always means a stale commit, never generator noise.

Fix when it fires: `npm run typegen`, then commit the result.

## The theme-token contrast test

`src/lib/theme-tokens.test.ts` (WCAG math in `src/lib/contrast.ts`) parses the
**real** hex values out of the `@theme` block in `src/styles/globals.css` and
asserts the pairs the design system actually renders: every text token on Linen
and on the Sage band, Linen and white reversed out of the indigo/ink/claret
drench surfaces, the gold Petemoss kicker on its permitted dark grounds, and the
interactive field border at the 3:1 non-text threshold.

It exists because this bug class is invisible to everything else: Lighthouse
audits a rendered page, not a palette, and can sit at 100 while a border is
under 3:1. The ratios were previously only recorded in CSS comments, and a
comment cannot fail a build — two of those comments were in fact wrong
(corrected 2026-08-27).

Deliberately not asserted, with the reasons in the file header:
`--color-secondary` (brass, decorative only), `--color-border-soft` and
`--color-error-border` (hairlines), and gold-on-Linen (a pairing the palette
forbids outright). **Any token that becomes a focus ring or a control edge must
be added there with `AA_NON_TEXT`.**

## Render parity

`scripts/page-parity.mjs` snapshots each built page's normalized HTML, so any
change that is _supposed_ to be render-neutral can be proven so: extracting a
component, reordering imports, swapping a wrapper, bumping a dependency.

**Neither mode builds.** The caller builds; the script reads `dist/client` and
warns if that build is over an hour old.

```powershell
npm run build
npm run parity capture              # snapshot all 23 routes
# ...make the render-neutral change...
npm run build
npm run parity compare              # PASS/DIFF per page, exit 1 on any diff
npm run parity compare pricing      # one page only
npm run parity list                 # what it would snapshot
```

**Several agents in one working tree** (2026-10-05): each builds to its own folder with
`npx astro build --outDir <scratch>/s-dist` (through `node scripts/with-workerd.mjs` on Windows) and points
the harness at it with `node scripts/page-parity.mjs compare --dist <scratch>/s-dist/client` (the same
override as `PARITY_DIST`; the flag is removed before the mode and page are read, so old calls are
unchanged).

The normalizer strips exactly four classes of build-varying value — `/_astro/`
content hashes, Astro's generated `data-astro-cid-*` and transition scopes, the
`<astro-island>` render-order prefix, and whitespace between tags. Text, classes,
ids, aria, inline styles and JSON-LD all stay byte-faithful, because those are
what must not drift. **This repo needed no site-local rules**: capture, clean
rebuild, compare reported 23/23 PASS on 2026-08-27 with the ported normalizer
untouched.

Baselines live in `scripts/.parity/*.html` and **are committed** — git history is
the record of when a baseline legitimately moved. Re-capture only when you mean
to move it, and say so in the commit message.

**Tailwind must not scan the baselines.** Tailwind v4 skips only gitignored paths,
and `scripts/.parity/*.html` is committed, so every class in an old baseline kept
its CSS rule alive and a compare could pass because the baselines fed the build.
`src/styles/globals.css` therefore has `@source not` for `scripts/.parity`, `docs`,
`.claude`, `CLAUDE.md` and `README.md` (added and recaptured 2026-10-03; the
shipped BaseLayout sheet dropped 101,489 to 98,195 bytes, 42 dead rules, and 16
page/viewport full-page screenshots stayed pixel-identical). The proof of a clean
loop is a fixpoint: two consecutive build + capture runs leave the stylesheet byte
count unchanged. If you add another committed folder of HTML or Markdown that
names utility classes, exclude it the same way. (Vault gotcha:
committed-parity-baselines-feed-tailwind.)

Capture baselines from a plain `npm run build` only, never from the Playwright
webServer build (a test-runner build can inject different env, which shows up
as a diff that is not a regression). The baselines were re-captured on
2026-09-05 after the prettier pass: `prettier-plugin-tailwindcss` sorts class
lists, and class strings are byte-faithful in the snapshots.

## Tap-target scan (not a CI gate)

`scripts/measure-tap-targets.mjs` (PORTABLE, PORTS.md card 83) counts the links, buttons and form controls under
44px at 390px and hit-tests the ones that rely on a `hit-44` area. It needs a served build and Chromium:

```bash
npm run build
node node_modules/http-server/bin/http-server dist/client -p 4321 -a 127.0.0.1 -s -c-1 --silent &
MSYS_NO_PATHCONV=1 node scripts/measure-tap-targets.mjs http://127.0.0.1:4321 --paths /,/request-a-quote/,/style-gallery/
```

(Under Git Bash set `MSYS_NO_PATHCONV=1` or `/` becomes a Windows path. Use the live Worker URL instead of a local
server to check production.) Measured 2026-10-04 over the 22 prebuilt routes: 23 to 149 under 44px per route
before (27 on `/`, 42 on `/request-a-quote/`, 149 on `/style-gallery/`), 0 after, with 4 inline-in-sentence
links exempt (the email address in the legal pages, "Font Guide →" and "Color Chart →" on the quote form).

**Closed `<details>` (fixed 2026-10-04, starter PR #85).** The mobile filter panel on `/style-gallery/` is a closed
`<details>` at load. Chrome still reports geometry for its chips, but they are not rendered or tappable, and the hit
test lands on the gallery photos beneath, so the old scan printed 68 stolen-tap warnings there. The scan now skips
content inside a closed `<details>` (other than its `<summary>`). Measured at 390px on `/style-gallery/`: 0 under
44px, 0 stolen-tap warnings, 58 lifted by a hit-area; with `--include-closed-details` (the old behaviour) 0 under
44px, 68 stolen-tap warnings, 126 lifted. Open the panel yourself, or pass the flag, if you want the chips measured.

## Library drift

`npm run sync-check` walks this repo for files whose first lines carry
`PORTABLE: canonical copy - ncs-astro-sanity-starter is the library of record`
and byte-diffs each against the starter's copy (line endings normalized).
Currently marked (34 as of 2026-10-04, all SAME; `npm run sync-check` prints the full set, the
original six are named here): `scripts/free-dist.mjs`,
`scripts/with-workerd.mjs`, `scripts/lib/loadEnv.mjs`, `scripts/lib/sanity-lib.mjs`,
`scripts/sync-check.mjs`, `src/lib/contrast.ts`. `src/lib/sanity-dedupe-alias.ts` and its spec
`src/lib/sanity-dedupe-alias.test.ts` joined on 2026-09-29 (card 60). `loadEnv.mjs` joined the set on
2026-08-28 by pulling the starter's marked copy forward; the file body was already
identical, only the marker line was missing.

Since 2026-09-06 this is a CI gate, not only a hand-run check: the build job
checks the starter out at `.ncs-starter` and runs `node scripts/sync-check.mjs`
against it on every push and PR (see the starter's PORTS.md card 36).

It skips `node_modules`, `dist`, `.git`, `worktrees` and `_worktrees` folders, so live git worktrees
under `_worktrees/` do not double the count (PORTS.md card 80).

Point it at the library with `NCS_STARTER_DIR`, or leave it to find a sibling
`ncs-astro-sanity-starter` directory. Drift means: either fold this repo's
improvement back into the starter (with a PORTS.md card in the same commit), or
pull the starter's copy forward.

`scripts/page-parity.mjs` and `src/lib/theme-tokens.test.ts` are **not** marked,
on purpose — the parity harness is a pattern that grows site-local rules, and the
theme-token pair list is Heirloom Coast, not the starter's palette.
