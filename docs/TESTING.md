# TESTING — which check covers what

Created 2026-08-27 during the starter sync session (PORTS.md card 15). The point
of this file is that nobody writes a fourth check that duplicates the second.

## The checks

| Check             | Command                                                                             | Runtime                                                                                          | Covers                                                                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit tests        | `npm run test:unit`                                                                 | Node's built-in runner (`node --test`, type-stripped)                                            | Pure functions in `src/lib/*.test.ts` and `scripts/lib/*.test.mjs`: slugify, reservedSlugs, scriptAccent, sectionVisibility, utils, reading-time, phone, image-import helpers, the page-fields drift gate, and **theme-tokens** (below)                            |
| Type check + lint | `npm run check`                                                                     | `astro check` then eslint                                                                        | The family-standard "is it clean" command: zero `astro check` errors, zero eslint errors. Run before pushing                                                                                                                                                       |
| Everything green  | `npm run check:full`                                                                | local                                                                                            | typegen, `npm run check`, unit tests, Astro build (which includes the embedded Studio)                                                                                                                                                                             |
| Lint              | `npm run lint`                                                                      | eslint                                                                                           | `eslint src scripts tests` — eslint does its own globbing (the `files` patterns in `eslint.config.js` pick up ts/tsx/astro/mjs), so coverage is identical on Windows and Linux CI. Three pre-existing unused-var **warnings**; zero errors is the bar              |
| Format            | `npm run format:check` / `npm run format`                                           | prettier + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`                               | Every file prettier can parse, minus `.prettierignore` (generated files, parity baselines, `docs/superpowers`). The tailwind plugin also sorts class lists                                                                                                         |
| Browser suites    | `npm test` (`npm run test:ui` for the inspector)                                    | Playwright, chromium + WebKit iPhone 14, against a fresh `npm run build` served by `http-server` | `tests/smoke.spec.ts` (200 + brand in `<title>` per route), `tests/a11y.spec.ts` (axe default rule set, zero violations), `tests/reflow.spec.ts` (no horizontal overflow at 320 and 1440/1024/768). Routes come from `tests/routes.ts`                             |
| Internal links    | `npm run check:links`                                                               | linkinator over `dist/client`                                                                    | Every internal link resolves. `/studio`, `/preview` and `/api` are skipped (SSR, or a bare React mount shell)                                                                                                                                                      |
| CI                | push to `main` / `staging`, any PR, or manual dispatch (`.github/workflows/ci.yml`) | GitHub Actions                                                                                   | `build` job: install, typegen (3-attempt retry), the **stale-types guard**, `astro check`, lint, format check, unit tests, credential-less Astro build (Studio included), link check. `test` job (parallel): the Playwright suites, report uploaded as an artifact |
| Lighthouse CI     | `npm run lighthouse` (`.github/workflows/lighthouse.yml`)                           | Headless Chrome over `dist/client`                                                               | The 12 routes in `lighthouserc.json`. **Accessibility is a hard gate at minScore 1**; LCP under 4.5s and CLS under 0.1 are also errors; performance / best-practices / SEO are warnings                                                                            |
| Render parity     | `npm run parity capture` / `compare`                                                | reads `dist/client`                                                                              | 23 built pages, byte-compared against committed baselines (below). `dist/client/studio/` is deliberately skipped                                                                                                                                                   |
| Library drift     | `npm run sync-check`                                                                | node, dependency-free                                                                            | Every `PORTABLE`-marked file, diffed against `ncs-astro-sanity-starter`                                                                                                                                                                                            |
| Uptime            | `.github/workflows/uptime.yml`, hourly                                              | curl                                                                                             | 4 live routes return 200 (needs the `SITE_URL` repo variable — see docs/PENDING.md)                                                                                                                                                                                |

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
`data-sanity` attributes in the served preview HTML and compare them to the GROQ
array lengths for that page (one per repeatable item, plus one for the closing
CTA). That check is what caught `homePage.trustItems` rendering no controls at
all, because it is an array of plain strings and primitives have no `_key` (see
`src/lib/preview-edit-attr.ts`). Home is 3 + 4 + 1 = 8; How It Works is 4 + 1 = 5.

And note gotcha 13 in CLAUDE.md: `/studio` returns 200 with real HTML while being
completely broken at React mount. Open it in a real browser and read the console.

## The Playwright suites

Ported from WCP on 2026-09-05 (the family test standard). `npm test` builds the
site, serves `dist/client` on port 4321 and runs three suites on two browser
profiles (Desktop Chrome, and a WebKit iPhone 14 for smoke + a11y):

| Suite                  | Asserts                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/smoke.spec.ts`  | every route answers 200 and its `<title>` carries "MAS Monograms"                                                                                                                        |
| `tests/a11y.spec.ts`   | axe-core's DEFAULT rule set reports zero violations. Do not narrow it to `.withTags([...])`: the default set is what keeps this in step with (and slightly ahead of) the Lighthouse gate |
| `tests/reflow.spec.ts` | `document.documentElement.scrollWidth` never exceeds the viewport at 320px, then at 1440, 1024 and 768                                                                                   |

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

Locally, `npx playwright test --project=chromium --workers=2` is the fast loop;
`reuseExistingServer` means a running `npm run serve:dist` is picked up instead
of rebuilding.

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

Capture baselines from a plain `npm run build` only, never from the Playwright
webServer build (a test-runner build can inject different env, which shows up
as a diff that is not a regression). The baselines were re-captured on
2026-09-05 after the prettier pass: `prettier-plugin-tailwindcss` sorts class
lists, and class strings are byte-faithful in the snapshots.

## Library drift

`npm run sync-check` walks this repo for files whose first lines carry
`PORTABLE: canonical copy - ncs-astro-sanity-starter is the library of record`
and byte-diffs each against the starter's copy (line endings normalized).
Currently marked (6, all SAME as of 2026-08-28): `scripts/free-dist.mjs`,
`scripts/with-workerd.mjs`, `scripts/lib/loadEnv.mjs`, `scripts/lib/sanity-lib.mjs`,
`scripts/sync-check.mjs`, `src/lib/contrast.ts`. `loadEnv.mjs` joined the set on
2026-08-28 by pulling the starter's marked copy forward; the file body was already
identical, only the marker line was missing.

Since 2026-09-06 this is a CI gate, not only a hand-run check: the build job
checks the starter out at `.ncs-starter` and runs `node scripts/sync-check.mjs`
against it on every push and PR (see the starter's PORTS.md card 36).

Point it at the library with `NCS_STARTER_DIR`, or leave it to find a sibling
`ncs-astro-sanity-starter` directory. Drift means: either fold this repo's
improvement back into the starter (with a PORTS.md card in the same commit), or
pull the starter's copy forward.

`scripts/page-parity.mjs` and `src/lib/theme-tokens.test.ts` are **not** marked,
on purpose — the parity harness is a pattern that grows site-local rules, and the
theme-token pair list is Heirloom Coast, not the starter's palette.
