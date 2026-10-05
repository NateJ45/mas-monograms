# 06: Sanity Content Model

> **Status: overview only. The source of truth is the code**, not this file. The live schema lives in
> `src/sanity/schemaTypes/` and the queries that consume it in `src/lib/queries.ts`. This doc is a plain-
> language map of what exists so you don't have to open twenty files to get the shape — but when the two
> disagree, the code wins. (The original build-time spec, with a different planned model, is preserved in
> the git history.)

Two principles the model follows:

1. **Structure over freeform** where content repeats (steps, FAQ items, pricing tiers), so Mary Ann fills
   fields instead of formatting a blob and the front end renders consistently.
2. **Singletons** for one-of-a-kind pages, **collections** for repeatable content, so the Studio stays
   tidy. Singletons are enforced (not duplicable/deletable) in `the repo-root sanity.config.ts`.

---

## Singletons

**`siteSettings`** — global identity used in the header/footer and JSON-LD: title, tagline, email, phone,
address, service area, opening hours, nav items, footer columns, social links, Google Business URL, SEO
defaults, `businessType` (drives the LocalBusiness schema.org type), price range, and turnaround times.

**Page singletons** — one per page, each holding all the words + images for that page:
`homePage`, `howItWorksPage`, `pricingPage`, `aboutPage`, `requestAQuotePage`, `shopIndexPage`,
`styleGalleryPage`, `fontGuidePage`, `threadChartPage`, `clearancePage`, `thankYouPage`, `notFoundPage`.

**`atelierSettings`** (added 2026-10-04, Direction D "The Atelier") — every word of the live monogram preview:
section `eyebrow`/`headline`/`subhead`; control labels (`initialsLabel`, `initialsHint`, `styleLabel`,
`threadLabel`, `fabricLabel`); `styles[]` (`key` is one of `classic|script|block|circle|single` and is fixed by
the code, `label`, `blurb`); `fabrics[]` (`key`, `label`, `color` hex, `note`); `sampleMonograms[]` (made-up
initials only, 1 to 3 letters); `replayLabel`, `ctaLabel`, `disclaimer` (the "preview, Mary Ann confirms the
proof" line); `heroTryLabel`, `heroPlaceholder`. Desk: Website pages > "Monogram Preview (live stitching)".
Read with `getAtelierSettings()`. Seeded by `scripts/seed-atelier.mjs` (dry run by default, `--apply` to write;
`createIfNotExists` so a re-run never overwrites Mary Ann's edits). It is registered in the `SINGLETON_TYPES`
sets in both `src/sanity/structure.ts` and the repo-root `sanity.config.ts`, so the Studio cannot duplicate or delete it.

**`homePage` additions (2026-10-04, all optional):** `marqueeEyebrow` (trust group), `categoriesNote`,
`makerQuote` / `makerSignature` / `makerFacts[]` (about group), studio wall `wallEyebrow` / `wallHeadline` /
`wallSubhead` / `wallCtaLabel` (new "Studio wall" group), closing banner `finalEyebrow` / `finalHeadline` /
`finalSubhead` / `finalCtaLabel` / `finalCtaHref` (new "Closing thread banner" group). Existing fields are
untouched. `makerFacts` must hold only true statements.

**`requestAQuotePage.noScriptMessage` (2026-10-04, optional, Submit group):** the note shown at the top of the
quote form ONLY to visitors whose browser has JavaScript off (a `<noscript>` block; the bot check and the send
both need JavaScript). `siteSettings.email` (as a `mailto:` link) and `siteSettings.phone` (as a `tel:` link)
follow it. Seeded by `scripts/seed-hoopfit.mjs`. Code fallback: "This form needs JavaScript to send."

**Label fields that replaced hard-coded words (2026-10-04, all optional, seeded by
`scripts/seed-pending-fields.mjs`):**

| Where              | Field(s)                                                                                                                                                               | Used by                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings`     | `menuContactLabel` (Navigation)                                                                                                                                        | the phone menu's contact eyebrow ("At the bench")                                                                                                                                                                                  |
| `pricingPage`      | `tierPricePrefix` (Pricing tiers)                                                                                                                                      | the small word above each price tag ("from")                                                                                                                                                                                       |
| `fontGuidePage`    | `popularLabel`, `tryItLabel`                                                                                                                                           | the popular-font badge; the "try it" link (blank label hides the links)                                                                                                                                                            |
| `thankYouPage`     | `responseTimeLabel`, `nextStepsLabel`                                                                                                                                  | the label inside the response-time box; the heading over the numbered steps                                                                                                                                                        |
| `styleGalleryPage` | `filterToggleLabel`, `resultsAnnouncement` (`{filter}`, `{count}`, `{total}`), `requestLabel`; "Photo viewer" group: `lightboxLabel`, `lightbox{Close,Prev,Next}Label` | the phone filter button, the screen-reader status, the per-photo link, the lightbox (also on `/[slug]`)                                                                                                                            |
| `styleGalleryPage` | (2026-10-05) `introCtaLabel`; `fontCaption` (`{font}`); `filterGroupName`, `filterFallbackHeading`, `moreTagsLabel` (`{count}`), `lessTagsLabel`                       | the intro button ("Start your quote"); the font line under each photo and in the viewer (also on `/[slug]`); the filter block's screen-reader name, the heading used when no filter groups are set, the "+ N more" / "Less" toggle |
| `clearancePage`    | `quantityLeftLabel` (`{count}`)                                                                                                                                        | "{count} left" on an item; blank hides it                                                                                                                                                                                          |
| `threadChartPage`  | `filterLabel`                                                                                                                                                          | the colour search box label                                                                                                                                                                                                        |
| `atelierSettings`  | `pauseLabel`, `playLabel` (Buttons & notice)                                                                                                                           | the home hero's Pause/Play button and the Marquee's (WCAG 2.2.2)                                                                                                                                                                   |
| `notFoundPage`     | (existing) `seoTitle`, `seoDescription`                                                                                                                                | now actually read by `getNotFoundPage` and `404.astro`                                                                                                                                                                             |

**Query notes:** `getAllThreadColors()` now returns `slug` as a plain string (it was the `{current}` object; no
caller used it). `getGalleryItemsForWall(limit)` returns featured items first with `hotspot`/`crop`. Every
gallery photo and category card photo has had a hotspot since 2026-10-04 (`scripts/set-hotspots.mjs`); the
category queries and `getAllGalleryItems`/`getFeaturedGalleryItems` project it through `IMG_HOOP` (the plain
`IMG` projection still drops it), so a hoop crops its square around the hotspot. Category hero photos borrow
the hotspot of the gallery item that uses the same picture; the few with no gallery twin fall back to the
focal point in code.

Common shape across pages: an SEO group (collapsed in the Studio), a hero (eyebrow/headline/subhead), the
page's own sections, and a bottom CTA banner. `requestAQuotePage` is the outlier — it stores every form
label, help line, placeholder, section heading, and the referral-source options.

---

## Collections

| Type            | Drives                                                      | Notes                                                                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemCategory`  | the `/[slug]` shop pages + the Shop-by-Item grid            | name, slug, description, hero images, card image, trust-strip lines, starting price, order, featured; optional `galleryHeading`, `requestSimilarLabel`, `crossSellHeading`, and `bannerEyebrow`/`bannerHeadline`/`bannerSubhead` (blank banner = the Shop by Item page's banner) |
| `font`          | the Font & Lettering Guide + the quote form's font dropdown | name, `previewImage` (a photo of the stitched lettering — NOT a web font), `styleTag`, `bestFor`, `popular`; optional `atelierStyle` (one of the 5 preview style keys: the card links to `/?style=<key>#atelier`, which preselects it)                                           |
| `threadColor`   | the Thread Color Chart                                      | name, hex (approximate), DMC number, swatch image, color family                                                                                                                                                                                                                  |
| `galleryItem`   | the Style Gallery (and featured items on Home/About)        | image, related category, related font, tags, featured, order; optional `hoopFit` (`good` default / `poor`: "Show it in a round hoop?", see below)                                                                                                                                |
| `pricingTier`   | the Pricing page + "Business at a glance"                   | quantity/complexity label, price per piece, note, highlighted, optional `highlightLabel` (badge on a highlighted tag), order                                                                                                                                                     |
| `clearanceItem` | the Clearance page                                          | name, description, images, original + sale price, `stripePaymentLink`, quantity, sold, order                                                                                                                                                                                     |
| `faqItem`       | the How It Works + Pricing FAQs                             | question, answer (Portable Text), category, `showOnHowItWorks` / `showOnPricing` flags                                                                                                                                                                                           |
| `legalPage`     | `/legal/[slug]` (Privacy, Terms, Accessibility)             | title, slug, body (Portable Text), last-updated, optional `lastUpdatedLabel`                                                                                                                                                                                                     |

**`galleryItem.hoopFit` (2026-10-04).** Some photos cannot make a good circular crop (two items side by side, a
small design in a tall photo, a close-up that fills the circle). `poor` keeps a photo out of every round hoop
(`HoopFrame`) while it still shows in the square gallery views and the lightbox; unset reads as `good`. The
`IMG_HOOP` projection in `src/lib/queries.ts` copies the flag (and the gallery photo's hotspot, when the category
photo has none of its own) onto any `itemCategory.heroImages[]` / `cardImage` that uses the same picture, and
`src/lib/hoop.ts` does the picking: a category page's hoop cluster swaps a poor hero photo for a good photo from
the same category's gallery (compact hotspots first), a category card falls back to the first good hero photo,
and `getFeaturedGalleryItems` (the `/about` "recent work" hoops) leaves poor ones out. Flagged on 2026-10-04 by
`scripts/seed-hoopfit.mjs` (setIfMissing): `galleryItem-20260316-165705`, `-monogram-39`, `-design-25`,
`-design-34`, `-design-29`, `-greeting-card-03`, `-monogram-37`, `-wreath-sash-05`, `-wreath-sash-06`.

**Types that were removed** (do not reintroduce without real content): `testimonial`, `popularCombination`,
and the old `stats` strip. There is also no `service` or `journal*` type — those were leftovers from the
starter template and are gone.

---

## Studio-only helper singletons ("Start Here" handbook)

Not rendered on the public site — they drive the onboarding handbook Mary Ann sees in the Studio:

- `studioGuide` — "How your website works" (site map + step-by-step how-tos + tip cards + optional video link).
- `studioNotes` — the editable business notes behind "Your business at a glance".
- `studioPlaybook` — "Grow your studio" (Google Business, reviews, social, local marketing, keeping the site fresh).

Seeded by `scripts/seed-studio-guides.mjs`. Since 2026-10-04 its default mode (dry run, `--apply` to write)
only ADDS the sections listed in `NEW_SECTIONS` (by fixed `_key`) to the live `studioGuide`, so Mary Ann's edits
survive; `--replace-all --apply` is the old full createOrReplace and overwrites her edits. The
"Monogram Preview (live stitching)" map row and how-to were added this way on 2026-10-04. See `docs/08` and
the studio components in `src/sanity/components/`.

---

## Who edits what

Mary Ann edits all of the above in the Studio without touching code. The thing that requires a developer is
**changing the shape of a type** (adding/removing/renaming a field), because existing documents and the
front-end queries both depend on the current shape. Two rules learned the hard way:

- After any schema change, run `npm run typegen` to regenerate `src/lib/sanity.types.ts`.
- Removing a field from a schema does **not** delete its data — the Studio will flag the leftover value as
  an "unknown field." Unset the value from affected documents too (see `scripts/fix-orphan-data.mjs`).
