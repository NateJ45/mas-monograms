# MAS Monograms — Claude Project Context

## What this is
Mary Ann Stone's custom embroidery studio site in St. Matthews, SC.
Built by Nate's Creations (nathanjnixon86@gmail.com).
Migrated from Squarespace 7.1 → Astro 6 + Sanity 7/5 + Cloudflare Workers.

## Status (current — 2026-06-30)
Built and **deployed**; all content seeded into Sanity and rendering live.
- Live site: https://mas-monograms.nathanjnixon86.workers.dev (custom domain `mas-monograms.com` pending)
- Studio (Mary Ann's editor): https://mas-monograms.sanity.studio
- Repo `NateJ45/mas-monograms` (private) → auto-deploys via **Cloudflare Workers Builds** on push to `main`
- Remaining before launch: images (all empty except 3 fonts), placeholder content (email, socials,
  testimonial names, thread inventory), quote-form secrets + R2 bucket. Full checklist + env-var
  matrix in `docs/08-deployment-and-status.md`.

## Design system note
The current visual identity is **Heirloom Coast** (rebranded 2026-07-01): Fraunces + Mulish +
Petemoss type on a Linen/Ink/Indigo/Claret/Brass palette. It superseded the intermediate "Thread
Ledger" system (which itself superseded the original cream/sage/blush). Full rationale for the
current system: `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`. The
earlier Thread Ledger spec (`docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`)
is retained for history but no longer describes the live code.

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
The rule: **serif display + humanist-sans body + a script face scoped to monogram artifacts only.**
- **Fraunces Variable** — display / headings. The rebrand deliberately introduced a serif; there is
  no longer a "no serif" rule.
- **Mulish Variable** — body / UI text (humanist sans).
- **Petemoss** — the decorative monogram-artifact face. Script is deliberately allowed here, but ONLY
  for on-screen monogram initials (e.g. the combo preview + recipe cards). Do NOT use it for prose,
  headings, or UI chrome.
- The logo's needle-and-thread cross is a hand-built inline SVG (`src/components/Logo.astro`), not a
  webfont.
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
| Claret — CTA | `#8C3A2E` | CTA buttons |
| Claret Deep | `#722C22` | CTA hover |
| Brass — text | `#835A24` | small brass text (AA-safe) |
| Brass — decorative | `#B98A3E` | gallery "hoop ring" frames / decorative strokes only |
| Secondary text | `#5A5148` | secondary text |
| Tertiary text | `#67614F` | tertiary / muted text |

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
- Studio runs at localhost:3333 (`cd studio && npm run dev`); deploy it with `cd studio && npx sanity deploy`
- Astro dev runs at localhost:4321 (`npm run dev`)
- Deploy: push to `main` → Cloudflare Workers Builds auto-builds & deploys. The site reads Sanity at
  build time, so Sanity vars must be set as **build** variables in the Cloudflare dashboard, not
  runtime (see `docs/08`). Local `wrangler deploy` is not the normal path.
- Content was bulk-seeded via `node scripts/seed-content.mjs` (re-runnable, deterministic ids)
