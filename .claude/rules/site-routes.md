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

| Page            | Route                   | Schema                                                                 |
| --------------- | ----------------------- | ---------------------------------------------------------------------- |
| Home            | `/`                     | `homePage`                                                             |
| How It Works    | `/how-it-works`         | `howItWorksPage`                                                       |
| Pricing         | `/pricing`              | `pricingPage`                                                          |
| About           | `/about`                | `aboutPage`                                                            |
| Request a Quote | `/request-a-quote`      | `requestAQuotePage`                                                    |
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
