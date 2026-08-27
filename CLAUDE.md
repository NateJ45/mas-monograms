# MAS Monograms — Claude Project Context

## What this is
Mary Ann Stone's custom embroidery studio site in St. Matthews, SC.
Built by Nixon Creative Studio (nathanjnixon86@gmail.com · nixoncreativestudio.com) —
this matches the live footer credit in `siteSettings.footerCredit`.
Migrated from Squarespace 7.1 → Astro 6 + Sanity 7/5 + Cloudflare Workers.

## Status (current — 2026-07-03)
Built and **deployed**; all content seeded into Sanity and rendering live. Design system is Heirloom
Coast wearing the "Direction C — The Sampler" treatment (see below); the Studio has been reworked for
Mary Ann (Heirloom Coast theme + "Start Here" handbook + plain-language labels + task-first desk).
- Live site: https://mas-monograms.nathanjnixon86.workers.dev (custom domain `mas-monograms.com` pending)
- Studio (Mary Ann's editor): https://mas-monograms.sanity.studio
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
- **Astro 6.3+** — `output: 'static'`, `@astrojs/cloudflare` adapter, Sharp image service
- **Cloudflare Workers** — unified Pages/Workers platform, Git auto-deploy (Workers Builds), `wrangler.jsonc`
- **Sanity 7 client + Studio 5** — headless CMS
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
- `npm run typegen` must be run after any schema changes to regenerate `sanity.types.ts`
- Studio runs at localhost:3333 (`cd studio && npm run dev`); deploy it with `cd studio && npx sanity deploy`.
  The Studio theme is **Heirloom Coast** (`buildLegacyTheme` in `studio/sanity.config.ts` — Linen/Ink/
  Indigo/Claret, matches the site). The "Start Here" handbook (StudioGuide/BusinessOverview/BrandKit/
  StudioPlaybook components) is what Mary Ann sees first — keep it current with the live site.
- Astro dev runs at localhost:4321 (`npm run dev`)
- Deploy: push to `main` → Cloudflare Workers Builds auto-builds & deploys. The site reads Sanity at
  build time, so Sanity vars must be set as **build** variables in the Cloudflare dashboard, not
  runtime (see `docs/08`). Local `wrangler deploy` is not the normal path.
- Content was bulk-seeded via `node scripts/seed-content.mjs` (re-runnable, deterministic ids)
- The "Start Here" studio guides (studioGuide/studioNotes/studioPlaybook singletons) are seeded via
  `node scripts/seed-studio-guides.mjs` (idempotent createOrReplace). Do NOT run `scripts/seed-core.mjs`
  — it is the leftover interior-design "Studio Starter" seed and would inject junk `service`/`journalEntry`
  docs.
- New scripts (2026-08-27, from the starter): `npm run parity` (render-parity
  harness), `npm run sync-check` (library-drift check), `npm run free-dist`
  (also wired as the `prebuild` hook). `scripts/with-workerd.mjs` is installed
  but unwired on purpose — see the gotcha below.
- Workflows: `ci.yml` (install + typegen + stale-types guard + lint + both
  builds + tests), `lighthouse.yml` (accessibility hard-gated at 1.0),
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
3. **`scripts/with-workerd.mjs` must stay unwired here.** It works around a
   Windows workerd crash that only happens on Astro 7 / `@astrojs/cloudflare` 14,
   where prerendering routes through `@cloudflare/vite-plugin`. This repo is
   Astro 6.3 / adapter 13.5.5 and never hits it. Wire it
   (`"build": "node scripts/with-workerd.mjs astro build"`) on the day of that
   upgrade, not before. Related, from the same family: adapter and wrangler
   versions are a matched pair — 13.6.0 regressed the image optimizer, and
   adapter 14 emits a `legacy_env` field that wrangler 4.126+ rejects outright.
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
8. **Studio files never port blindly between these repos.** This project is on
   Sanity **5**; WCP and presacademy are on **6**. A file copied across that
   boundary compiles and then dies at browser runtime — which is also where
   schema errors surface, since they pass the build. Port the pattern, write the
   file against this repo's actual major, and open the Studio to verify.
