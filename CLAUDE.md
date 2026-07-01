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
The visual identity described below ("Thread Ledger") superseded the original cream/sage/blush
system. Full rationale: `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.

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
The brand is warm parchment/ink/pine-teal/rust ("Thread Ledger"). There is no `.dark` CSS, no
theme toggle, and no theme-bootstrap script anywhere in the codebase — this was a considered
decision (not just an unused old rule), see `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.
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
- **Bricolage Grotesque Variable** — headings (weight 700, 600 for sub-headings). No serif anywhere
  in the system — this is deliberate, see the design spec referenced below.
- **Work Sans Variable** — body / UI text.
- No script font. The logo's needle-and-thread cross is a hand-built inline SVG
  (`src/components/Logo.astro`), not a webfont.
- **Embroidery fonts are NOT web fonts** — each `font` document has a `previewImage` field.

## Color palette
| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#2b2420` | default text |
| Parchment | `#f7f1e6` | page background |
| Pine Teal | `#1f5c4f` | primary / links |
| Muted | `#6b6258` | secondary text |
| Rust — decorative | `#c1542c` | large text (18px+) and decorative strokes only |
| Rust — CTA | `#b8492a` | CTA buttons ONLY (the decorative shade is too light for small white-on-rust text) |
| Mustard | `#d9a441` | gallery photo "hoop ring" frames, highlights |

Full rationale, contrast math, and what NOT to use these for:
`docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.

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
