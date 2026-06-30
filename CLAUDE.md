# MAS Monograms — Claude Project Context

## What this is
Mary Ann Stone's custom embroidery studio site in St. Matthews, SC.
Built by Nate's Creations (nathanjnixon86@gmail.com).
Migrated from Squarespace 7.1 → Astro 6 + Sanity 7/5 + Cloudflare Workers.

## Stack
- **Astro 6.3+** — `output: 'static'`, `@astrojs/cloudflare` adapter, Sharp image service
- **Cloudflare Workers** — unified Pages/Workers platform, `wrangler deploy`, `wrangler.jsonc`
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

### No dark mode toggle
The brand is warm cream/sage/ink. `.dark` CSS exists but is never applied at runtime.
Do NOT add a ThemeToggle component.

### No Web3Forms
The quote form backend is a Cloudflare Worker + Resend. Do not use Web3Forms.

### Clearance items — Stripe Payment Links only
No cart, no checkout code. Each `clearanceItem` doc has a `stripePaymentLink`.
The buy button is a plain `<a href={...}>` that links to Stripe.

### Worker secrets — never in the repo
`RESEND_API_KEY`, `QUOTE_OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`, `SANITY_API_READ_TOKEN`
are set via `wrangler secret put`. Never write them into `.env` or commit them.

## Typography
- **Playfair Display 400 + 400-italic** — headings. `<em>` inside headings italicizes in Playfair.
- **DM Sans Variable** — body / UI text.
- **Great Vibes** — SVG logo ONLY. Not loaded as a web font anywhere else.
- **Embroidery fonts are NOT web fonts** — each `font` document has a `previewImage` field.

## Color palette
| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#2c2c28` | default text |
| Cream | `#faf8f4` | page background |
| Sage Dark | `#4a5e4c` | primary / links |
| Sage Mid | `#8a9e8c` | secondary / muted |
| Sage Light | `#e8ede8` | tints / subtle bg |
| Blush | `#c9a48a` | CTA buttons ONLY |
| Blush Hover | `#b8926e` | CTA hover state |

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
- Studio runs at localhost:3333 (`cd studio && npm run dev`)
- Astro dev runs at localhost:4321 (`npm run dev`)
- Deploy: `npm run build && wrangler deploy`
