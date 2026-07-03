# 08: Deployment & Current Status

The "as-built" companion to docs 01–07 (which are the pre-build spec). This is the source of truth
for how the site runs today and what's left before a public launch.

Last updated: 2026-07-03.

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

## Design & studio (2026-07-03)

- **Design system:** "Heirloom Coast" (rebranded 2026-07-01) with the "Direction C — The Sampler"
  treatment applied 2026-07-03 (indigo drench hero + CTA band, gold Petemoss script kicker, light
  optical Fraunces, frameless photography, scroll-animation removed). Full detail in `docs/02`.
- **Studio:** rebranded to the Heirloom Coast theme and reworked for Mary Ann — a "Start Here" handbook
  (studioGuide / studioNotes / studioPlaybook singletons, seeded by `scripts/seed-studio-guides.mjs`),
  plain-language field labels, collapsed SEO fields, and a task-first desk ("Photos & products",
  "Business info & contact", "Website pages"). Forms default to the "All fields" tab.
- **Content cleanup:** the `popularCombination` and `testimonial` types and the homepage stats strip
  were removed along with their orphaned fields; residual field values were unset and missing array
  `_key`s backfilled (`scripts/fix-orphan-data.mjs`).

## Content status

All text content is **seeded and live** via `scripts/seed-content.mjs`, sourced verbatim from
docs 01–06. Covered: all 13 page singletons, 8 item categories, 18 fonts, thread-color chart, FAQs,
and 4 complexity-based pricing tiers (rendered "from $X"). Real contact info is set
(`owner@example.com`, `(000) 000-0000`). Real photography has been imported — the hero snapshot
collage, style gallery, and category images are populated.

### Placeholders / follow-ups before launch

- `socialLinks` — confirm the real Facebook / Instagram URLs are set.
- `threadColor` docs are a **common starter set** with approximate hex — replace with real inventory.
- Line-font `styleTag` values were best guesses — review against the real samples.
- Testimonials: the on-site testimonials feature is **off** (no real reviews yet). Collect genuine
  Google/Facebook reviews, then re-enable and add them (see the studio "Grow your studio" guide).
- Remaining image gaps to fill in the Studio: the About-page portrait (`aboutPage.heroImage` — adding
  one flips that hero to a two-column layout automatically), OG/social share images, and previews for
  any fonts still missing one. The Studio flags every missing required image as a validation warning.

---

## Pre-launch checklist

- [ ] Fill the remaining image gaps in the Studio (About portrait, OG/social images, any missing font previews)
- [ ] Confirm social URLs and replace the starter thread-color inventory (contact info + photos already done)
- [ ] Create R2 bucket: `wrangler r2 bucket create mas-monograms-quotes`
- [ ] Set quote-form runtime secrets (`RESEND_API_KEY`, `QUOTE_OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`)
- [ ] Set Turnstile build var (`PUBLIC_TURNSTILE_SITE_KEY`) + create the Turnstile widget
- [ ] Verify Resend domain (SPF + DKIM) on `mas-monograms.com`
- [ ] Test the quote form end-to-end on a preview deploy (owner + customer email land)
- [ ] (Recommended) Wire a Sanity webhook → Cloudflare deploy hook for content-triggered rebuilds
- [ ] Point `mas-monograms.com` DNS at the Worker; confirm `_redirects` from old Squarespace URLs
- [ ] Final Lighthouse / accessibility pass
