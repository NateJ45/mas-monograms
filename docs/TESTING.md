# TESTING — which check covers what

Created 2026-08-27 during the starter sync session (PORTS.md card 15). The point
of this file is that nobody writes a fourth check that duplicates the second.

## The checks

| Check | Command | Runtime | Covers |
|---|---|---|---|
| Unit tests | `npm test` | Node's built-in runner (`node --test`, type-stripped) | Pure functions in `src/lib/*.test.ts` and `scripts/lib/*.test.mjs`: slugify, reservedSlugs, scriptAccent, sectionVisibility, utils, reading-time, phone, image-import helpers, and **theme-tokens** (below) |
| Everything green | `npm run check` | local | typegen, Astro build, Studio build, unit tests — the one command to run before pushing |
| Lint | `npm run lint` | eslint | `src/**/*.{ts,tsx,astro}` + `scripts/**/*.mjs`. Two pre-existing unused-var **warnings**; zero errors is the bar |
| CI | push to `main` / any PR (`.github/workflows/ci.yml`) | GitHub Actions | install (root + studio), typegen, the **stale-types guard**, lint, credential-less Astro build, Studio build, unit tests |
| Lighthouse CI | `npm run lighthouse` (`.github/workflows/lighthouse.yml`) | Headless Chrome over `dist/client` | The 12 routes in `lighthouserc.json`. **Accessibility is a hard gate at minScore 1** |
| Render parity | `npm run parity capture` / `compare` | reads `dist/client` | 23 built pages, byte-compared against committed baselines (below) |
| Library drift | `npm run sync-check` | node, dependency-free | Every `PORTABLE`-marked file, diffed against `ncs-astro-sanity-starter` |
| Uptime | `.github/workflows/uptime.yml`, hourly | curl | 4 live routes return 200 (needs the `SITE_URL` repo variable — see docs/PENDING.md) |

There is **no Playwright suite in this repo.** The sibling repos have one
(smoke + axe light/dark + a 320-1440 reflow sweep); here the accessibility floor
is held by the Lighthouse hard gate plus the theme-token unit test. If a11y
regressions ever slip through, porting that suite is the next move — not adding
more Lighthouse URLs.

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
change that is *supposed* to be render-neutral can be proven so: extracting a
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

Note for whoever adds a Playwright suite later: capture baselines from a plain
`npm run build` only. A test-runner webServer build can inject different env
(fake tracker ids), which shows up as a diff that is not a regression.

## Library drift

`npm run sync-check` walks this repo for files whose first lines carry
`PORTABLE: canonical copy - ncs-astro-sanity-starter is the library of record`
and byte-diffs each against the starter's copy (line endings normalized).
Currently marked: `scripts/free-dist.mjs`, `scripts/with-workerd.mjs`,
`scripts/lib/sanity-lib.mjs`, `scripts/sync-check.mjs`, `src/lib/contrast.ts`.

Point it at the library with `NCS_STARTER_DIR`, or leave it to find a sibling
`ncs-astro-sanity-starter` directory. Drift means: either fold this repo's
improvement back into the starter (with a PORTS.md card in the same commit), or
pull the starter's copy forward.

`scripts/page-parity.mjs` and `src/lib/theme-tokens.test.ts` are **not** marked,
on purpose — the parity harness is a pattern that grows site-local rules, and the
theme-token pair list is Heirloom Coast, not the starter's palette.
