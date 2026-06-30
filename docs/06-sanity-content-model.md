# 06: Sanity Content Model

Every content type the site needs, in plain language. The files in `sanity/schemas/` implement the
first few as full working examples (`itemCategory`, `font`, `threadColor`, `testimonial`,
`siteSettings`); use those as the pattern and build the rest from this spec.

Two principles guiding the model:
1. **Structure over freeform** where content repeats (steps, FAQ items, feature cards), so Mary Ann
   fills in fields instead of formatting a blob, and the front end renders consistently.
2. **Singletons** for one-of-a-kind pages (homepage, about), **documents** for collections
   (categories, fonts), so the studio stays tidy.

---

## Reusable object types (not documents, embedded in others)

- **seo**: `metaTitle` (string), `metaDescription` (text), `ogImage` (image). Add to every page type.
- **ctaBanner**: `heading` (string), `body` (text), `buttonLabel` (string), `buttonHref` (string).
  Used at the bottom of most pages.
- **link**: `label` (string), `href` (string). For nav-ish lists.
- **galleryImage**: `image` (image, with alt), `caption` (string), `priceIndicator` (string, e.g.
  "from $16"). Used in category galleries.
- **step**: `number` (string), `label` (string), `heading` (string), `body` (text), `points` (array
  of strings). For the process strip and the How It Works steps.
- **faqItem**: `question` (string), `answer` (text).
- **stat**: `value` (string), `label` (string). For the stats strips.
- **featureCard**: `icon` (string, emoji ok), `title` (string), `body` (text). For the About "why
  come back" grid and similar.

---

## Document types (collections)

### itemCategory
The 8 shop pages, plus Seasonal (as a flagged variant). The workhorse type.
- `title` (string): e.g. "Tote Bags & Pouches"
- `slug` (slug, from title): must match the live URL (e.g. `tote-bags`)
- `emoji` (string): for the card grids
- `priceAnchor` (string): "from $16" or "free assessment"
- `cardDescription` (text): the one-liner used in the homepage / shop grids
- `heroHeading` (string), `heroBody` (text)
- `heroImage` (image, with alt)
- `gallery` (array of `galleryImage`)
- `whatToExpectLeft` (portable text), `whatToExpectRight` (portable text): the two-column section
- `pricingRangeLow` (string), `pricingRangeHigh` (string), `pricingNote` (text)
- `popularCombinations` (array of references to `popularCombination`, optional)
- `testimonials` (array of references to `testimonial`, optional): contextual reviews on the page
- `isSpecial` (boolean): true for Bring Your Own Item, which swaps the price anchor for "free
  assessment" and changes the CTA framing
- `seasonal` (boolean) and `activeFrom` / `activeUntil` (datetime, optional): for the Seasonal page
- `order` (number): sort order in grids
- `seo` (seo)

### font
Drives the Font & Lettering Guide and the quote form dropdowns. See `docs/04`.
- `name` (string)
- `kind` (string, list: `lineFont` | `monogramStyle` | `appliqueFont`): splits the guide sections
  and the two form dropdowns
- `previewImage` (image, with alt): required, because these are not web fonts
- `availableSizes` (array of strings): e.g. ["0.5\"", "1\"", "1.5\"", ...], mainly for line fonts
- `description` (text, optional)
- `order` (number)

### threadColor
Drives the Thread Color Chart and the thread dropdown.
- `name` (string)
- `hex` (string): approximate, for an on-screen swatch
- `swatchImage` (image, optional): for more accurate display than hex
- `family` (string, list: e.g. Neutrals, Blues, Greens, Reds/Pinks, Yellows/Golds, etc.): for
  grouping
- `order` (number)

### testimonial
- `quote` (text)
- `authorName` (string)
- `authorLocation` (string, optional)
- `rating` (number, default 5)
- `featured` (boolean): show on the homepage
- `relatedCategory` (reference to `itemCategory`, optional): for contextual placement on item pages

### galleryItem
Drives the Style Gallery.
- `image` (image, with alt)
- `caption` (string)
- `itemType` (reference to `itemCategory`, optional): for filtering
- `fontUsed` (reference to `font`, optional)
- `threadUsed` (reference to `threadColor`, optional)
- `order` (number)

### pricingTier
The four tiers from `docs/03`.
- `name` (string): Basic Monogram, Premium Monogram, Custom Appliqué, Custom Embroidery
- `startingPrice` (string): "from $16"
- `description` (text)
- `setupFee` (string, optional): "$30 one-time digitization fee"
- `notes` (text, optional)
- `order` (number)

### popularCombination
The "most popular combinations" cards.
- `label` (string): Classic / Gift-Ready / Bold
- `comboName` (string): "Navy on White"
- `detail` (string): "Block font · 3-letter monogram · Perfect for towels & linens"
- `priceFrom` (string): "from $16"
- `image` (image, optional)
- `font` (reference to `font`, optional), `threadColor` (reference to `threadColor`, optional)
- `order` (number)

### clearanceItem
The only commerce type. See `docs/03`.
- `name` (string)
- `image` (image, with alt)
- `price` (string): display price
- `stripePaymentLink` (url): the Stripe-hosted checkout link Mary Ann creates
- `inStock` (boolean): hide when sold out
- `order` (number)

---

## Singleton types (one document each)

### siteSettings
Global stuff used in the header, footer, and meta. (Full example in
`sanity/schemas/singletons/siteSettings.ts`.)
- `siteTitle` (string), `tagline` (text)
- `contactEmail` (string): also the quote-notification recipient
- `location` (string): "St. Matthews, SC"
- `hours` (string): "Mon to Fri · Replies within 1 business day"
- `socialFacebook`, `socialInstagram`, `socialPinterest` (url): real URLs pending
- `footerBlurb` (text)
- `defaultSeo` (seo)

### homepage
- `hero` (object: eyebrow, heading, body, primaryCta `link`, secondaryCta `link`, trustItems array of
  strings)
- `processSteps` (array of `step`)
- `categoryGridLabel` (string): the grid auto-pulls `itemCategory` docs
- `galleryTeaser` (object: label, heading, body, cta `link`)
- `popularCombinationsIntro` (object: label, heading, body): cards pull `popularCombination` docs
- `reviewsIntro` (object: label, heading): pulls featured `testimonial` docs
- `makerBlurb` (object: label, heading, body, image, cta `link`)
- `finalCta` (ctaBanner + trustItems)
- `seo` (seo)

### howItWorksPage
- `hero` (object: eyebrow, heading, body)
- `stepsLabel` (string), `stepsHeading` (string)
- `steps` (array of `step`)
- `stats` (array of `stat`)
- `faqLabel` (string), `faqHeading` (string), `faq` (array of `faqItem`)
- `cta` (ctaBanner)
- `seo` (seo)

### pricingPage
- `hero` (object: eyebrow, heading, body)
- `intro` (portable text)
- `tiersHeading` (string): cards pull `pricingTier` docs
- `whatAffectsPrice` (array of `featureCard` or strings)
- `reassurance` (object: heading, body): the "no surprises / price before payment" block
- `cta` (ctaBanner)
- `seo` (seo)

### aboutPage
- `hero` (object: eyebrow, heading, body)
- `maker` (object: label, heading, kicker, body portable text, pullQuote, photo, skillTags array)
- `stats` (array of `stat`)
- `whyHeading` (string), `whyIntro` (text), `whyCards` (array of `featureCard`)
- `contactHeading` (string), `contactIntro` (text)
- `forOrders` (object: title, body, points array, cta `link`)
- `forEverythingElse` (object: title, body, points array)
- `contactFormNote` (text): the "placing an order? use the quote form" nudge
- `infoBlocks` (array: heading + lines): location, response times, follow along
- `seo` (seo)

### styleGalleryPage / fontGuidePage / threadChartPage
Thin singletons, since the real content comes from the collections.
- `heading` (string), `intro` (portable text), `seo` (seo)
- (Thread chart adds a `caveat` string for the "colors are approximate" note.)

### thankYouPage
- `heading` (string), `body` (portable text), `nextLinks` (array of `link`), `seo` (seo)

### notFoundPage
- `heading` (string), `body` (text), `links` (array of `link`)

---

## A note on who edits what

Mary Ann (and Nathan) edit all of the above in the Sanity studio without touching code. The thing
that requires code is *changing the shape of a type* (adding/removing a field), because existing
documents and the front end both depend on the current shape. Treat schema changes as deliberate, and
keep field names stable once content exists.
