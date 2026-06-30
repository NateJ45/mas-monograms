# 08: Deployment & Current Status

The "as-built" companion to docs 01–07 (which are the pre-build spec). This is the source of truth
for how the site runs today and what's left before a public launch.

Last updated: 2026-06-30.

---

## Live URLs

| What | URL |
|---|---|
| Site (Cloudflare Worker) | https://mas-monograms.nathanjnixon86.workers.dev/ |
| Custom domain | `mas-monograms.com` — **pending** DNS cutover |
| Sanity Studio (Mary Ann's editor) | https://mas-monograms.sanity.studio/ |
| GitHub repo | `NateJ45/mas-monograms` (private) |
| Sanity project / dataset | `xp3elugr` / `production` |

---

## How a deploy happens

The GitHub repo is connected to **Cloudflare Workers Builds**. Every push to `main` triggers
`npm ci && npm run build` in Cloudflare's CI and auto-deploys the result. There is **no manual
`wrangler deploy`** in the normal flow.

Because `output: 'static'`, all Sanity reads happen **at build time** in CI. The deployed Worker
serves prebuilt HTML — so content only refreshes when a build runs. Two ways to rebuild after editing
content in Sanity:

1. Push any commit to `main`, or
2. Set up a **Sanity webhook → Cloudflare deploy hook** so publishing in the Studio triggers a
   rebuild automatically (recommended before handing off to Mary Ann; not yet wired up).

The Studio is deployed separately: `cd studio && npx sanity deploy` (host `mas-monograms`, appId
pinned in `studio/sanity.cli.ts`).

---

## Environment variables — the part that bites

There are **two** distinct buckets. Putting a variable in the wrong one is the most common failure.

### Build-time variables (Cloudflare → Worker → Settings → build variables)

Read during `npm run build`. Required for the site to pull content:

| Variable | Value | Secret? |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | `xp3elugr` | no |
| `PUBLIC_SANITY_DATASET` | `production` | no |
| `SANITY_API_READ_TOKEN` | Viewer token from sanity.io/manage | **yes** |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key | no (embedded in form HTML) |
| `PUBLIC_CF_ANALYTICS_TOKEN` | optional | no |

### Runtime secrets (the Worker's Variables & Secrets, or `wrangler secret put`)

Used by the quote-form Worker at request time:

| Secret | Purpose |
|---|---|
| `RESEND_API_KEY` | Send owner + customer emails |
| `QUOTE_OWNER_EMAIL` | Where quote notifications go (Mary Ann) |
| `TURNSTILE_SECRET_KEY` | Server-side CAPTCHA verification |
| `QUOTE_BACKUP` (R2 binding) | Bucket `mas-monograms-quotes` for submission backups |

### Two gotchas baked into `src/lib/sanity.ts` (learned the hard way)

1. **Cloudflare injects build vars into `process.env`, but Vite/Astro only surface `PUBLIC_`-prefixed
   vars via `import.meta.env`.** A non-prefixed secret like `SANITY_API_READ_TOKEN` is therefore
   invisible to `import.meta.env` on the CI server — collections come back empty and the dynamic
   category pages never generate. Fix: each var is read as `import.meta.env.X ?? proc.X`, where `proc`
   is `process.env` guarded to `import.meta.env.SSR` so the browser bundle never references `process`.
2. **A blank / whitespace / quote-wrapped `PUBLIC_SANITY_DATASET` crashes the whole build** at
   prerender with `Datasets can only contain lowercase characters…` (the Sanity client rejects the
   malformed value at construction). Fix: a `clean()` helper trims whitespace and stray quotes, treats
   empty as unset, and the dataset is lowercased.

If the live site shows the fallback hero ("Custom Embroidery") and `/tote-bags` 404s, the build ran
without these build vars — check the CI build log and the build-variable settings.

---

## Content status

All text content is **seeded and live** (82 documents) via `scripts/seed-content.mjs`, sourced
verbatim from docs 01–06. Covered: all 13 page singletons, 8 item categories, 18 fonts, 27 thread
colors, 6 FAQs, 4 pricing tiers, 3 testimonials, 3 popular combinations.

Schema fixes made during seeding (see commit history): five body fields were retyped `text` →
Portable Text (homePage.aboutBody, pricingPage.rushBody, threadChartPage.intro, clearancePage.intro,
thankYouPage.body); CTA field names normalized across 9 page schemas; `PercentageIcon` → `TagIcon`;
`notFoundPage` query aliased `"subhead": body`; pricing tiers now render by complexity ("from $X")
rather than per-quantity.

### Placeholders to replace before launch

- `siteSettings.email` = `hello@mas-monograms.com` (placeholder)
- `socialLinks` = empty (real Facebook / Instagram URLs pending)
- 3 testimonials use placeholder names ("Happy Customer" etc.) — quotes are real
- 27 `threadColor` docs are a **common starter set** with approximate hex — replace with real inventory
- 10 line-font `styleTag` values are best guesses — review against the real samples

### Images

Every image field is empty **except** 3 monogram fonts (Master Circle, Vine/Heirloom, Pillow, from
`assets/`). Still needed: hero backgrounds, Mary Ann's portrait, 8 category card/hero images, gallery
photos, popular-combination photos, OG/social images, and per-font previews for the 10 line fonts
(`assets/font-10-popular.jpg`, needs cropping) and 5 appliqué fonts (`assets/fonts-from-pdf.pdf`,
needs export). The Studio flags every missing required image as a validation warning — a built-in
upload TODO list.

---

## Pre-launch checklist

- [ ] Upload images in the Studio (heroes, portrait, category cards, gallery, OG images)
- [ ] Replace placeholders (email, socials, testimonial names, thread inventory)
- [ ] Create R2 bucket: `wrangler r2 bucket create mas-monograms-quotes`
- [ ] Set quote-form runtime secrets (`RESEND_API_KEY`, `QUOTE_OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`)
- [ ] Set Turnstile build var (`PUBLIC_TURNSTILE_SITE_KEY`) + create the Turnstile widget
- [ ] Verify Resend domain (SPF + DKIM) on `mas-monograms.com`
- [ ] Test the quote form end-to-end on a preview deploy (owner + customer email land)
- [ ] (Recommended) Wire a Sanity webhook → Cloudflare deploy hook for content-triggered rebuilds
- [ ] Point `mas-monograms.com` DNS at the Worker; confirm `_redirects` from old Squarespace URLs
- [ ] Final Lighthouse / accessibility pass
