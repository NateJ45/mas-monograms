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
