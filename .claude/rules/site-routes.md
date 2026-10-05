---
paths:
  - 'src/pages/**'
  - 'public/_redirects'
  - 'src/layouts/BaseLayout.astro'
  - 'src/lib/siteSettings.ts'
  - 'wrangler.jsonc'
---

# Routes, quote Worker, redirects, JSON-LD

Loads when you touch pages, redirects, the base layout or the Worker config.

## Routes

Direction D ("The Atelier", 2026-10-04) rebuilt every page; the route set did not change. What each
page now does (brief: `docs/superpowers/specs/2026-10-04-atelier-direction.md`):

- `/`: live-stitching hero, marquee, full Monogram Atelier studio, hoop wall of categories, maker band
  (Mary Ann), stitched process path, studio wall of gallery photos, thread-tied final CTA. Also reads
  `atelierSettings`, `threadColor` and `getGalleryItemsForWall`.
- `/shop-by-item`, `/[slug]`: hoop wall index; category pages open with a hoop, then a swatch-card gallery
  with the lightbox, and a CTA that links to the quote form with `?item=<slug>`.
- `/style-gallery`: filterable swatch-card wall with the native `<dialog>` lightbox
  (`components/gallery/Lightbox.astro`: focus loop, arrow keys, swipe).
- `/thread-color-chart`: the spool rack IS the page; picking a spool recolours a live stage, and its CTA
  carries `?initials&style&thread&fabric` to the quote form.
- `/request-a-quote`: same fields, names, ids, Turnstile and `POST /api/quote`; reskinned, with the Atelier
  hand-off preview (`components/quote/QuotePreview.astro`, hidden until valid initials arrive).
- `/pricing` (hang tags), `/how-it-works`, `/about`, `/clearance` (Stripe links stay plain `<a>`),
  `/thank-you`, `/404`, `/font-lettering-guide`, legal pages: same data, new Atelier components.
- `ThreadLine` (the golden thread) and `RevealScript` are rendered once by `BaseLayout`.

| Page            | Route                   | Schema                                                                 |
| --------------- | ----------------------- | ---------------------------------------------------------------------- |
| Home            | `/`                     | `homePage` (+ `atelierSettings`)                                       |
| How It Works    | `/how-it-works`         | `howItWorksPage`                                                       |
| Pricing         | `/pricing`              | `pricingPage`                                                          |
| About           | `/about`                | `aboutPage`                                                            |
| Request a Quote | `/request-a-quote`      | `requestAQuotePage` (+ `atelierSettings`, `threadColor`)               |
| Shop by Item    | `/shop-by-item`         | `shopIndexPage`                                                        |
| Item category   | `/[slug]`               | `itemCategory`                                                         |
| Style Gallery   | `/style-gallery`        | `styleGalleryPage`                                                     |
| Font Guide      | `/font-lettering-guide` | `fontGuidePage`                                                        |
| Thread Chart    | `/thread-color-chart`   | `threadChartPage`                                                      |
| Clearance       | `/clearance`            | `clearancePage`                                                        |
| Thank You       | `/thank-you`            | `thankYouPage`                                                         |
| 404             | `/404`                  | `notFoundPage`                                                         |
| Studio          | `/studio`               | `@sanity/astro` (mounted) — the embedded Sanity Studio                 |
| Draft preview   | `/preview/**`           | SSR draft preview for the Presentation tool. noindex, sitemap-excluded |
| Preview stream  | `/preview/live`         | SSE proxy for preview auto-refresh (403 without the Studio cookie)     |
| Draft mode      | `/api/draft-mode/*`     | Turns draft mode on/off for the preview                                |

`/preview/**`, `/preview/live`, `/api/draft-mode/*` and `/api/quote` are the site's only
**SSR** routes (`prerender = false`). Everything else stays statically built.

## Quote form Worker

- Route: `POST /api/quote`
- Parses `multipart/form-data` (no npm parser — uses native `Request.formData()`)
- Validates Turnstile token server-side
- Validates uploaded files (type + size)
- Saves submission JSON to R2 (`QUOTE_BACKUP` binding)
- Sends two emails via the Cloudflare Email Service `EMAIL` binding: owner notification (a failure returns 502 so the form shows an error) + customer confirmation
- On success: redirects to `/thank-you`

## Query-string contract on `/request-a-quote`

Parsed client-side by `components/quote/QuotePrefillScript.astro` (the file header is the source of
truth). Producers: the Atelier studio CTA, the thread chart CTA, category pages (`?item=` only).
Every value is capped at 64 characters, validated against a whitelist, and written with `.value` or
`textContent`, never as HTML. Nothing the visitor already typed or chose is overwritten, and a line
already present is not repeated.

| Param      | Accepts                                              | Effect                                                                                      |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `item`     | an `itemCategory` slug                               | selects that Item type option (`data-slug`, then humanised name, then raw)                  |
| `font`     | a font name                                          | selects that Font option, else "Other"                                                      |
| `thread`   | a `threadColor` slug (a thread name is accepted too) | fills the Thread colour field with the Sanity name                                          |
| `initials` | 1 to 3 letters or digits (also `&`); junk is dropped | adds "<initialsLabel>: ABC" to Personalization; 3 letters also pick "Three-letter monogram" |
| `style`    | `classic`, `script`, `block`, `circle`, `single`     | adds "<styleLabel>: <label>" to Personalization                                             |
| `fabric`   | an `atelierSettings.fabrics[].key`                   | adds "<fabricLabel>: <label>" to Item description                                           |

Initials must be a run of letters, digits, `&`, dots, spaces or hyphens, so `<img ...>` never becomes
"IMG". The preview (`QuotePreview`) is revealed only when valid initials arrived and the whitelist
(`data-prefill`, built from `atelierSettings` and `threadColor`) is present; an unknown `style` or
`fabric` is ignored, not guessed. Labels come from `atelierSettings`; the fallbacks in code are
short neutral words used only if that document is missing.

## Queries used by the Atelier pages

`getAtelierSettings()` (singleton, labels and option lists) and `getGalleryItemsForWall(limit)` (featured
first, with `hotspot`/`crop`; every photo has a hotspot since 2026-10-04, callers keep a centre fallback).
Hoop photos come through `IMG_HOOP` and `src/lib/hoop.ts` (photos marked `galleryItem.hoopFit: 'poor'` stay
out of round hoops; `docs/06-sanity-content-model.md`). `/request-a-quote` has a `<noscript>` note
(`requestAQuotePage.noScriptMessage` plus the `siteSettings` email and phone as links) because the form
cannot send without JavaScript
live in `src/lib/queries.ts`. `getAllThreadColors()` returns `slug` as a plain string.

## Redirects (public/_redirects)

```
/aboutcontact  /about  301
/shop          /shop-by-item  301
/cart          /clearance  301
```

## LocalBusiness JSON-LD

Auto-injected in `<BaseLayout>` on every page using `siteSettings` data.
Schema.org type comes from `siteSettings.businessType` field.
