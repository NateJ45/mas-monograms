# 06: Sanity Content Model

> **Status: overview only. The source of truth is the code**, not this file. The live schema lives in
> `studio/schemaTypes/` and the queries that consume it in `src/lib/queries.ts`. This doc is a plain-
> language map of what exists so you don't have to open twenty files to get the shape — but when the two
> disagree, the code wins. (The original build-time spec, with a different planned model, is preserved in
> the git history.)

Two principles the model follows:
1. **Structure over freeform** where content repeats (steps, FAQ items, pricing tiers), so Mary Ann fills
   fields instead of formatting a blob and the front end renders consistently.
2. **Singletons** for one-of-a-kind pages, **collections** for repeatable content, so the Studio stays
   tidy. Singletons are enforced (not duplicable/deletable) in `studio/sanity.config.ts`.

---

## Singletons

**`siteSettings`** — global identity used in the header/footer and JSON-LD: title, tagline, email, phone,
address, service area, opening hours, nav items, footer columns, social links, Google Business URL, SEO
defaults, `businessType` (drives the LocalBusiness schema.org type), price range, and turnaround times.

**Page singletons** — one per page, each holding all the words + images for that page:
`homePage`, `howItWorksPage`, `pricingPage`, `aboutPage`, `requestAQuotePage`, `shopIndexPage`,
`styleGalleryPage`, `fontGuidePage`, `threadChartPage`, `clearancePage`, `thankYouPage`, `notFoundPage`.

Common shape across pages: an SEO group (collapsed in the Studio), a hero (eyebrow/headline/subhead), the
page's own sections, and a bottom CTA banner. `requestAQuotePage` is the outlier — it stores every form
label, help line, placeholder, section heading, and the referral-source options.

---

## Collections

| Type | Drives | Notes |
|---|---|---|
| `itemCategory` | the `/[slug]` shop pages + the Shop-by-Item grid | name, slug, description, hero images, card image, trust-strip lines, starting price, order, featured |
| `font` | the Font & Lettering Guide + the quote form's font dropdown | name, `previewImage` (a photo of the stitched lettering — NOT a web font), `styleTag`, `bestFor`, `popular` |
| `threadColor` | the Thread Color Chart | name, hex (approximate), DMC number, swatch image, color family |
| `galleryItem` | the Style Gallery (and featured items on Home/About) | image, related category, related font, tags, featured, order |
| `pricingTier` | the Pricing page + "Business at a glance" | quantity/complexity label, price per piece, note, highlighted, order |
| `clearanceItem` | the Clearance page | name, description, images, original + sale price, `stripePaymentLink`, quantity, sold, order |
| `faqItem` | the How It Works + Pricing FAQs | question, answer (Portable Text), category, `showOnHowItWorks` / `showOnPricing` flags |
| `legalPage` | `/legal/[slug]` (Privacy, Terms, Accessibility) | title, slug, body (Portable Text), last-updated |

**Types that were removed** (do not reintroduce without real content): `testimonial`, `popularCombination`,
and the old `stats` strip. There is also no `service` or `journal*` type — those were leftovers from the
starter template and are gone.

---

## Studio-only helper singletons ("Start Here" handbook)

Not rendered on the public site — they drive the onboarding handbook Mary Ann sees in the Studio:
- `studioGuide` — "How your website works" (site map + step-by-step how-tos + tip cards + optional video link).
- `studioNotes` — the editable business notes behind "Your business at a glance".
- `studioPlaybook` — "Grow your studio" (Google Business, reviews, social, local marketing, keeping the site fresh).

Seeded by `scripts/seed-studio-guides.mjs` (idempotent). See `docs/08` and the studio components in
`studio/components/`.

---

## Who edits what

Mary Ann edits all of the above in the Studio without touching code. The thing that requires a developer is
**changing the shape of a type** (adding/removing/renaming a field), because existing documents and the
front-end queries both depend on the current shape. Two rules learned the hard way:
- After any schema change, run `npm run typegen` to regenerate `src/lib/sanity.types.ts`.
- Removing a field from a schema does **not** delete its data — the Studio will flag the leftover value as
  an "unknown field." Unset the value from affected documents too (see `scripts/fix-orphan-data.mjs`).
