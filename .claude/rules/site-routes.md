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

**Trailing slash (2026-10-09).** `trailingSlash: 'always'` in `astro.config.mjs`: canonicals and the sitemap use `/about/`, so every internal link must too, or Cloudflare 307s it. Any internal href built at render time (CMS strings, Sanity slugs, data files) goes through `internalHref()` in `src/lib/internal-href.ts`; literals are written with the slash. SSR URLs need it too (`/api/quote/`, `/preview/live/`, `/api/draft-mode/*/`): without it they 301/308. Check after a build: no `href="/..."` without a trailing slash in `dist/client` (files with an extension excepted).

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
- Sends two emails via the Cloudflare Email Service `EMAIL` binding: owner notification (a failure returns 502 so the form shows an error) + customer confirmation. Bodies are built in `src/lib/quote-email.ts` (tests alongside; see `docs/05`), with contact details and next steps read from Sanity at send time
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

## Source tags (utm) contract (2026-10-05, Get found)

QR codes from the Studio tool link to the site as `?utm_source=qr&utm_medium=<placement>&utm_campaign=<batch>`
(`src/lib/qr/url.ts`). The code is `src/lib/utm.ts` (unit tests `utm.test.ts`); the feature test is
"Quote source tags" in `tests/features.spec.ts`.

- **Keys:** `utm_source`, `utm_medium`, `utm_campaign` only. A value is kept only if it is 1 to 40 letters,
  digits, hyphens or underscores; anything else is dropped, never repaired, and never written as HTML.
- **First touch wins for the session.** The header's script (on every page, already an external bundle, so
  no new `<script>` tag) calls `rememberUtm()` on load and on `astro:page-load`: the first landing URL in the
  tab with a valid tag is stored in `sessionStorage['mas-utm-v1']` and later landings never replace it. It
  ends when the tab closes. Storage that throws is ignored (the current URL's tags still apply).
- **Into the form.** `/request-a-quote` carries three empty `<input type="hidden">` (`utm_source`,
  `utm_medium`, `utm_campaign`); `QuotePrefillScript` fills them (`fillUtmFields`) on every run, before the
  `?initials` prefill, so the two never interfere.
- **Server side.** `POST /api/quote` re-validates with `pickUtm(formData)` (same whitelist, ignores
  everything else), stores `utm` (`{}` when none) in the R2 backup JSON, and passes it to the OWNER email
  only, which prints a "Where they found you" row: `QR code on a hang tag or label (campaign fall-fair)`;
  placements tag, card, flyer, insert, sign, box have plain words; an unknown QR medium prints
  `QR code (Other: <value>)`, an unknown source `Other: <value>`; the row is hidden with no tags. The
  customer email never shows it.
- **GA4** reads `utm_*` from the landing URL by itself (`gtag('config')`); nothing in the site strips or
  rewrites the query string, and the live `_redirects` (301) and the trailing-slash 307 keep it
  (checked 2026-10-05). One edge: GA4's library loads at idle after `load`, so a visitor who clicks
  through the router before it arrives may have the first page view recorded on the second URL.

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
Schema.org type comes from `siteSettings.businessType` field. `sameAs` is `sameAsLinks()`: the social
links, then `googleBusinessUrl`, valid `https` addresses only, each once (`src/lib/schemas.test.ts`).
`schemas.ts` imports `../data/site.ts` relatively so the test runs in bare Node.

## Review link (2026-10-05)

`Footer.astro` (contact cluster) and `/thank-you` (under the next steps) draw a review link only when
`siteSettings.googleReviewUrl` is a real `https` address (`src/lib/review-link.ts`); words from
`reviewLinkLabel`, fallback "Leave a review". Empty field: nothing drawn, parity unchanged.
