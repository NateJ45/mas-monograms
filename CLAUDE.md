# MAS Monograms — Claude Project Context

## What this is
Mary Ann Stone's custom embroidery studio site in St. Matthews, SC.
Built by Nixon Creative Studio (nathanjnixon86@gmail.com · nixoncreativestudio.com) —
this matches the live footer credit in `siteSettings.footerCredit`.
Migrated from Squarespace 7.1 → Astro 7 + Sanity 6 + Cloudflare Workers.

## Status (current — 2026-07-03)
Built and **deployed**; all content seeded into Sanity and rendering live. Design system is Heirloom
Coast wearing the "Direction C — The Sampler" treatment (see below); the Studio has been reworked for
Mary Ann (Heirloom Coast theme + "Start Here" handbook + plain-language labels + task-first desk).
- Live site: https://mas-monograms.nathanjnixon86.workers.dev (custom domain `mas-monograms.com` pending)
- Studio (Mary Ann's editor): **`<site>/studio`** — embedded in the site build since
  2026-08-28. The old hosted https://mas-monograms.sanity.studio still exists and is now
  a stale duplicate; retiring it and moving Mary Ann's bookmark are in `docs/PENDING.md`.
- Repo `NateJ45/mas-monograms` (private) → auto-deploys via **Cloudflare Workers Builds** on push to `main`
- Real contact info + photography are in; the `popularCombination`/`testimonial` types and the stats
  strip were removed. Remaining before launch: confirm socials, replace the starter thread inventory,
  a few image gaps (About portrait, OG images), quote-form secrets + R2 bucket. Full checklist +
  env-var matrix in `docs/08-deployment-and-status.md`.

## Design system note
The current visual identity is **Heirloom Coast** (rebranded 2026-07-01): Fraunces + Mulish +
Petemoss type on a Linen/Ink/Indigo/Claret/Brass palette, wearing the **"Direction C — The Sampler"**
treatment applied 2026-07-03 (indigo-drench hero + bottom CTA band, a gold Petemoss script kicker,
light optical-sized Fraunces, frameless photography, and scroll-in animation removed). It superseded
the intermediate "Thread Ledger" system (which itself superseded the original cream/sage/blush).
Full current design system in `docs/02-design-system.md`; rationale in
`docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`. The earlier Thread Ledger
spec (`docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`) is retained for history
but no longer describes the live code.

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
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Resend** — transactional email from the quote form Worker
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
Do NOT add a ThemeToggle component or reintroduce a `.dark` class.

### No Web3Forms
The quote form backend is a Cloudflare Worker + Resend. Do not use Web3Forms.

### Clearance items — Stripe Payment Links only
No cart, no checkout code. Each `clearanceItem` doc has a `stripePaymentLink`.
The buy button is a plain `<a href={...}>` that links to Stripe.

### Worker secrets — never in the repo
`RESEND_API_KEY`, `QUOTE_OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`, `SANITY_API_READ_TOKEN`
are set via `wrangler secret put`. Never write them into `.env` or commit them.

## Typography
The rule: **serif display (light, optical-sized) + humanist-sans body + a script face for monogram
artifacts and ONE kicker per page.**
- **Fraunces Variable** — display / headings, via the **opsz builds** (`@fontsource-variable/fraunces/opsz.css`
  + `opsz-italic.css` — the real italic cut is loaded; never synthesize oblique). Weight is **440**
  for display sizes and **560** for h4–h6 (set globally in `globals.css`) — do NOT force 700; the
  Direction C decision (2026-07-03) is that hierarchy comes from size + optical axis, not boldness.
- **Mulish Variable** — body / UI text (humanist sans).
- **Petemoss** — the script face. Allowed in exactly two places: (1) on-screen monogram initials
  (the combo preview, recipe cards, and the logo's script M), and (2) **one script kicker per page**
  — the opening hero's eyebrow only, always via `src/components/ScriptKicker.astro` (Claret on light
  grounds, gold `--color-gold-script` on dark grounds only; ≥2.75rem clamp floor). Section eyebrows
  stay tracked caps. Never Petemoss for prose, buttons, nav, or below 2.75rem — the thin script
  stops being legible.
- **Logo system (hybrid, chosen 2026-07-02 — see `docs/logo-concepts/`):** the lockup
  (`src/components/Logo.astro`) is the "Flourished Initial" — an oversized Petemoss script M in
  Claret with a drawn thread-swash under a Fraunces "MAS MONOGRAMS". The compact mark
  (`<Logo mark />`, `public/favicon.svg`, social/stamp uses) is the "Shopkeeper's Badge" — a double
  indigo hoop-ring around an outlined Fraunces-700 M in Claret. The favicon set is generated by
  `scripts/generate-favicons.mjs` (the M is an outlined path — favicons can't load webfonts). The
  old needle-and-thread cross is retired.
- **Embroidery fonts are NOT web fonts** — each `font` document has a `previewImage` field.

## Color palette (Heirloom Coast)
| Token | Hex | Use |
|-------|-----|-----|
| Linen | `#F4EEE3` | page background |
| Paper | `#FBF8F1` | raised surfaces / cards |
| Sage band | `#E4E2D3` | alternating section band |
| Heirloom Ink | `#26312E` | default text |
| Heritage Indigo | `#28486B` | primary / links |
| Indigo Deep | `#1C3550` | link / primary hover |
| Claret — CTA | `#8C3A2E` | CTA buttons on LIGHT surfaces; running-stitch borders |
| Claret Deep | `#722C22` | CTA hover |
| Brass — text | `#835A24` | small brass text (AA-safe) |
| Brass — decorative | `#B98A3E` | decorative strokes only (never text on light) |
| Gold — script | `#D9B15F` | Petemoss kicker + hairlines ON INDIGO/DARK ONLY (≈1.6:1 on Linen) |
| Secondary text | `#5A5148` | secondary text |
| Tertiary text | `#67614F` | tertiary / muted text |

Direction C surface rules (2026-07-03): Heritage Indigo is also a **drench surface** (home hero band,
bottom CTA band) with Linen/Paper type on it. On any dark surface the primary button is **paper bg +
ink text** (`CtaLink` handles this via `onDark`) — never claret-on-indigo. The old near-black
`#1A1512` slab is retired from bands (still used as the photo-scrim base in `HeroBackground`).

Full rationale, contrast math, and what NOT to use these for:
`docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`.

## Routes
| Page | Route | Schema |
|------|-------|--------|
| Home | `/` | `homePage` |
| How It Works | `/how-it-works` | `howItWorksPage` |
| Pricing | `/pricing` | `pricingPage` |
| About | `/about` | `aboutPage` |
| Request a Quote | `/request-a-quote` | `requestAQuotePage` |
| Shop by Item | `/shop-by-item` | `shopIndexPage` |
| Item category | `/[slug]` | `itemCategory` |
| Style Gallery | `/style-gallery` | `styleGalleryPage` |
| Font Guide | `/font-lettering-guide` | `fontGuidePage` |
| Thread Chart | `/thread-color-chart` | `threadChartPage` |
| Clearance | `/clearance` | `clearancePage` |
| Thank You | `/thank-you` | `thankYouPage` |
| 404 | `/404` | `notFoundPage` |
| Studio | `/studio` | `@sanity/astro` (mounted) — the embedded Sanity Studio |
| Draft preview | `/preview/**` | SSR draft preview for the Presentation tool. noindex, sitemap-excluded |
| Preview stream | `/preview/live` | SSE proxy for preview auto-refresh (403 without the Studio cookie) |
| Draft mode | `/api/draft-mode/*` | Turns draft mode on/off for the preview |

`/preview/**`, `/preview/live`, `/api/draft-mode/*` and `/api/quote` are the site's only
**SSR** routes (`prerender = false`). Everything else stays statically built.

## Live draft preview (`/preview/**`)

Added 2026-08-28 (PORTS.md cards 10, 11, 17). Mary Ann sees her **unpublished drafts**
rendered live inside the Studio: open the **Preview** tool at `/studio`, and the page list
on the left drives an iframe of the site.

- `src/lib/cms-preview.ts` is a SECOND Sanity client, separate from `src/lib/sanity.ts`
  (build-time): it reads the token from the **Worker runtime env** per request, uses
  `perspective: 'drafts'`, and turns on **stega** so click-to-edit works. It accepts either
  `SANITY_TOKEN` or this project's existing `SANITY_API_READ_TOKEN`.
- **Never compare a stega-encoded string in logic.** Stega hides about 1KB of invisible
  markers inside every string it touches, so `linkType === 'internal'` is `false` on an
  encoded value and the component silently picks the wrong branch, **in preview only**.
  Every enum that drives rendering is excluded via `NON_STEGA_FIELDS` in `cms-preview.ts`.
  **Add any new logic-driving dropdown field to that list the day you add the field.**
- `src/pages/preview/live.ts` is an **SSE proxy**: it holds ONE long-lived connection to
  Sanity's listen API server-side (the token never reaches the browser) and forwards a tiny
  "change" signal. `VisualEditingOverlay` soft-refetches the page and swaps `#main`. It is
  event-driven on purpose. **Never replace it with an interval poll** (that is what burned
  the WCP Sanity quota).
- The preview cookie carries an **unforgeable fingerprint** of the server-side token
  (`src/lib/preview-auth.ts`), not the package's default `'true'`.
- Preview pages render chrome-less (a slim bar says so). The real Header and Footer link to
  the live site and would bounce Mary Ann's iframe out of the preview.
- **Every page here previews as its EDITABLE SURFACE**, not as a pixel copy. This site has
  no page builder: all twelve page singletons are bespoke fixed-field documents and there
  is no `SectionRenderer`. So `/preview/*` renders the real Hero, then each repeatable list
  the page is built from, then the closing CTA, with a note on the page saying so.
- **In-canvas controls.** Each repeatable list item carries a `data-sanity` attribute built
  by `arrayItemEditAttr` in `src/lib/preview-edit-attr.ts`, so the overlay can outline it
  and offer insert-before/after, duplicate, remove and drag-to-reorder right on the page.
  Two rules. (1) The attribute is **preview-only**: no static page calls the helper, so
  every live render is byte-identical, and `npm run parity compare` is the gate. (2) The
  wrapper must be a **real block box**, never `display: contents`, because the overlay
  outlines the element's rect and a `contents` element has none.
- **The path-to-type map lives in THREE places that must stay in sync:**
  `SINGLETON_PREVIEW_PATHS` in `src/sanity/resolve.ts`, `PREVIEW_PAGES` in
  `src/pages/preview/[...slug].astro`, and `FIRST_SEGMENT_PREVIEWABLE` in
  `src/layouts/PreviewLayout.astro`'s click interceptor. The third is the one that degrades
  **silently**: a missed entry does not error, it just lets a click escape to the live site.
- **Activating preview takes two things outside the code:** the runtime token (`.dev.vars`
  locally, `npx wrangler secret put` in production) and the origin on the project's CORS
  allow list (`npx sanity cors add <origin> --credentials`). Without the token everything
  **fails closed**: the preview routes answer 503 naming the missing pieces rather than a
  stack trace. The public site builds and serves normally either way.

## Sanity query pattern
```ts
import { sanityClient } from '@/lib/sanity';
import type { SomePageType } from '@/sanity.types';

// In Astro page (build-time, token-authenticated)
const data = await sanityClient.fetch<SomePageType>(
  `*[_type == "homePage"][0]`,
);
```

## Quote form Worker
- Route: `POST /api/quote`
- Parses `multipart/form-data` (no npm parser — uses native `Request.formData()`)
- Validates Turnstile token server-side
- Validates uploaded files (type + size)
- Saves submission JSON to R2 (`QUOTE_BACKUP` binding)
- Sends two emails via Resend: owner notification + customer confirmation
- On success: redirects to `/thank-you`

## Redirects (public/_redirects)
```
/aboutcontact  /about  301
/shop          /shop-by-item  301
/cart          /clearance  301
```

## LocalBusiness JSON-LD
Auto-injected in `<BaseLayout>` on every page using `siteSettings` data.
Schema.org type comes from `siteSettings.businessType` field.

## Read these early
- **`docs/PENDING.md`** — the authoritative registry of open patches and
  waiting-on-a-human items. Edit it in the same commit that opens or closes one.
- **`docs/TESTING.md`** — which check covers what, and how to run each.
- **`ncs-astro-sanity-starter/PORTS.md`** — the library of record for the shared
  build/QA plumbing this repo now carries. Files whose first lines say
  `PORTABLE: canonical copy ...` are owned there, not here: change them in the
  starter and pull forward. `npm run sync-check` (with `NCS_STARTER_DIR` set, or
  the starter checked out as a sibling directory) proves there is no drift.

## Project notes
- `npm run typegen` must be run after any schema changes to regenerate `sanity.types.ts`.
  It runs from the **repo root** now (`sanity schema extract --force && sanity typegen
  generate`), not from a `studio/` workspace.
- **There is no separate studio dev server or deploy.** `npm run dev` serves the site at
  localhost:4321 and the Studio at **localhost:4321/studio**; deploying the site deploys the
  Studio. For CLI work (`sanity dataset`, `sanity cors`, typegen) run `npx sanity ...` from
  the repo root; `sanity.cli.ts` configures it. Do **not** run `npx sanity deploy`.
  The Studio theme is **Heirloom Coast** (`buildLegacyTheme` in the repo-root
  `sanity.config.ts` — Linen/Ink/Indigo/Claret, matches the site; kept deliberately across
  the Sanity 6 upgrade, see the file header). The "Start Here" handbook
  (StudioGuide/BusinessOverview/BrandKit/StudioPlaybook, now in `src/sanity/components/`)
  is what Mary Ann sees first — keep it current with the live site.
- `npm run preview` runs `wrangler dev -c dist/server/wrangler.json` against the last build.
  That is the only way to exercise the SSR routes and the real response headers locally; a
  static file server proves nothing about them.
- Deploy: push to `main` → Cloudflare Workers Builds auto-builds & deploys. The site reads
  Sanity at build time, so Sanity vars must be set as **build** variables in the Cloudflare
  dashboard, not runtime (see `docs/08`). Local `wrangler deploy` is not the normal path —
  and when it is used it must be `wrangler deploy -c dist/server/wrangler.json` (gotcha 10).
- A note on `npx sanity build`: it writes to `./dist` by default, which would clobber the
  Astro build. The Studio is built by `astro build`, so there is no `studio:build` script.
  A standalone bundle needs an explicit dir: `npx sanity build .studio-dist`.
- Content was bulk-seeded via `node scripts/seed-content.mjs` (re-runnable, deterministic ids)
- The "Start Here" studio guides (studioGuide/studioNotes/studioPlaybook singletons) are seeded via
  `node scripts/seed-studio-guides.mjs` (idempotent createOrReplace). Do NOT run `scripts/seed-core.mjs`
  — it is the leftover interior-design "Studio Starter" seed and would inject junk `service`/`journalEntry`
  docs.
- New scripts (2026-08-27, from the starter): `npm run parity` (render-parity
  harness), `npm run sync-check` (library-drift check), `npm run free-dist`
  (also wired as the `prebuild` hook). `scripts/with-workerd.mjs` became the
  `build` wrapper on 2026-08-28 with the Astro 7 upgrade — see gotcha 3.
- Workflows: `ci.yml` (install + typegen + stale-types guard + lint + build +
  tests; the separate studio install and studio build steps went away with the
  fold), `lighthouse.yml` (accessibility hard-gated at 1.0),
  `sanity-backup.yml` (nightly), `uptime.yml` (hourly). The last two are gated
  on a secret/variable that is not set yet — see `docs/PENDING.md`.
- Any new seed or patch script should import `scripts/lib/sanity-lib.mjs` rather
  than build its own client: it brings a **dry-run-by-default** gate (`--apply`
  to actually write), Portable Text builders, and an idempotent asset uploader.

## Gotchas (each one cost real time somewhere in this family)

1. **The committed `src/lib/sanity.types.ts` goes stale silently.** `npm run
   build` does not chain typegen, so the file is committed by hand after every
   schema change — and on 2026-08-27 it was already two `studioGuide` fields
   behind, on a green build. presacademy shipped types describing a schema that
   no longer existed the same way. CI now regenerates and fails on any diff. Two
   consecutive local typegen runs are byte-identical, so a diff always means a
   stale commit, never generator noise. Fix: `npm run typegen`, commit.
2. **`EPERM, Permission denied: ...\dist\client` is not a permissions problem.**
   It means a `wrangler dev` / `astro preview` is still holding `dist`, and Astro
   empties `dist` at the start of every build. The `prebuild` hook
   (`scripts/free-dist.mjs`) now clears it automatically on Windows, killing only
   node/workerd processes whose command line mentions **both** this project's
   directory **and** a dev server. Doing it by hand: killing `workerd.exe` alone
   is not enough (the parent wrangler/node process keeps the handle and can
   respawn it), and never blanket-kill `node.exe` — the editor/agent session is
   itself node.
3. **`scripts/with-workerd.mjs` is now WIRED** (`"build": "node
   scripts/with-workerd.mjs astro build"`, 2026-08-28). It works around a Windows
   workerd crash that happens on Astro 7 / `@astrojs/cloudflare` 14, where
   prerendering routes through `@cloudflare/vite-plugin`: the plugin's pinned
   workerd dies instantly with `std::terminate` behind a
   `MiniflareCoreError [ERR_RUNTIME_FAILURE]`, and the newer workerd bundled
   inside wrangler runs the identical config fine. It is a no-op off Windows, so
   Linux CI is untouched. This note said "must stay unwired" until the upgrade
   landed; the upgrade is the day it was meant to be wired.
4. **Palette ratios in CSS comments are not a gate.** Two of this file's own
   documented ratios were wrong (gold-on-indigo was 4.67 not 4.84; error text on
   Linen 5.60 not 5.35 — that was text-tertiary's number). `src/lib/
   theme-tokens.test.ts` now parses the real hex out of `globals.css` and asserts
   the pairs under `npm test`. **Any token that becomes a focus ring or the
   visible edge of a control must be added there** with `AA_NON_TEXT`, or the one
   bug class Lighthouse cannot see stays invisible.
5. **Parity baselines come from a plain `npm run build`, nothing else.** A build
   run under a test runner or with different env (fake tracker ids, empty Sanity
   credentials) produces a diff that is not a regression. Re-capture only when a
   markup change is intended, and say so in the commit message.
6. **`sanity-backup.yml` and `uptime.yml` are silently inert** until
   `SANITY_AUTH_TOKEN` (secret) and `SITE_URL` (repo **variable**, not a secret)
   exist. They warn-and-skip by design so they can be committed before launch —
   which also means "the workflow is green" does not mean "the backup ran". Check
   `gh secret list` / `gh variable list` before believing in either.
7. **A quoted token in `.env` yields a 401 that reads like a permissions
   problem.** `scripts/lib/loadEnv.mjs` takes quoted values literally, quotes
   included. Write tokens bare. And Sanity refuses to delete a document that other
   documents still reference, so cleanup scripts must unlink before deleting.
8. **Studio files never port blindly between these repos.** This project is now on
   Sanity **6.4**, the same major as WCP, presacademy and the starter, but the
   rule stands: a file copied across a major boundary compiles and then dies at
   browser runtime — which is also where schema errors surface, since they pass
   the build. Port the pattern, write the file against the target repo's actual
   major, and open the Studio in a real browser to verify.
9. **The Astro / adapter / wrangler / Sanity versions are a MATCHED SET. Do not
   bump one in isolation.** PORTS.md cards 10, 13 and 14 hold the reasons; the
   short version:
   - `@astrojs/cloudflare` is pinned **exactly 14.2.4**, the last release whose
     wrangler peer range is compatible with the pin below (14.2.5 demands
     wrangler ^4.125.0, one minor from the 4.126 rejection).
   - `wrangler` is pinned **`~4.110.0`**, and here that pin is **load-bearing, not
     belt-and-braces**. Verified 2026-08-28: adapter 14.2.4 on THIS config does
     emit `"legacy_env": true` into the generated `dist/server/wrangler.json`, and
     wrangler 4.126+ rejects that field outright. (The starter checked the same
     thing and found no `legacy_env` on its config, so do not take its "currently
     belt-and-braces" note as applying here.)
   - `react`, `react-dom` and `react-is` are pinned **exact** at 19.2.7. A
     mismatch dies inside workerd behind a wall of Miniflare stack frames; the
     real message, `Incompatible React versions`, is buried **above** the
     `MiniflareCoreError`.
   - The Sanity set is pinned to a combination known to work **together**:
     `sanity` 6.4.0, `@sanity/ui` **3.3.5**, `styled-components` 6.4.3,
     `@sanity/client` 7.23.0, `sanity-plugin-media` 5.0.11,
     `sanity-plugin-asset-source-unsplash` 7.0.15, `@sanity/orderable-document-list`
     2.0.9, plus `sanity-plugin-utils` 2.0.6 and `@sanity/visual-editing` 5.4.5
     held through **`overrides`** — a plain dependency pin does not stop npm
     nesting a newer `@sanity/visual-editing` under `@sanity/astro` and dragging a
     second `@sanity/ui` in with it. "Latest v3" is not close enough:
     `@sanity/ui` 3.5.x fails against `sanity` 6.4.0's expected theme shape.
   - **Invariant after any Sanity dependency work:** exactly ONE `@sanity/ui` on
     disk, and exactly ONE styled-components chunk in the build. Verify on DISK,
     not from install output, and re-resolve from a deleted lockfile when an
     override "does not work" (npm keeps an already-resolved nested tree).
     `@sanity/icons` is deliberately NOT deduped (core wants v5, `@sanity/ui` v3
     wants 3.8; icons are stateless, and deduping them broke the build elsewhere
     in the family on a missing v5 `CogIcon`). Nine `@sanity/icons` copies on disk
     is expected and fine.
   - **`session: false` in `astro.config.mjs` is load-bearing.** Left on, the
     Cloudflare adapter auto-declares a `SESSION` KV binding in the generated
     config, and a KV binding with no namespace id fails the deploy. This site has
     no login.
   - **No `assets.not_found_handling` in `wrangler.jsonc`** (removed 2026-08-28).
     With `404-page` set, Cloudflare answers navigation requests that miss the
     asset store from the static 404 page **without invoking the Worker**, which
     silently 404s every SSR route for real browsers while curl (which sends no
     `Sec-Fetch-*` headers) sees them working.
   - **Astro 7 wanted vite 8.** The `overrides: { "vite": "^7" }` carried since the
     initial commit held vite at 7.3.6 and the build died with "Could not find the
     prerender entry point in the build output", which reads like an Astro bug and
     is really a pinned bundler. The override is gone.
10. **`grep "errors.md#"` over the built chunks is a FALSE-POSITIVE-PRONE check.**
   The family's one-styled-components invariant is usually written as
   `grep -l "errors.md#" dist/client/_astro/*.js` must list ONE file. It lists TWO
   here and always will: `polished` (a Sanity dependency) uses the same
   `errors.md#` filename in its own error URL. The precise check is the
   styled-components-specific path:
   `Select-String -Path "dist\client\_astro\*.js" -Pattern "styled-components/src/utils/errors\.md#" -List`
   which must return exactly one file. Verified 2026-08-28.
11. **`wrangler deploy` must name the generated config.** Use
   `wrangler deploy -c dist/server/wrangler.json`; a plain `wrangler deploy` reads
   the root `wrangler.jsonc`, which knows nothing about the SSR entrypoint, and
   every SSR route 404s. The `deploy` and `preview` scripts already do this.
   **Cloudflare Workers Builds runs its own deploy command from the dashboard**,
   so that setting has to be changed by hand — see `docs/PENDING.md`.
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
