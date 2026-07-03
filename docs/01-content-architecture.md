# 01: Content Architecture

> **Status: Last reviewed 2026-07-03.** The site is built, content-seeded, and live at
> https://mas-monograms.nathanjnixon86.workers.dev. This doc maps every page to its purpose,
> sections, and Sanity source; it started as the migration spec (with verbatim Squarespace source
> copy) and has since been corrected to match the as-built site after two design passes and a content
> cleanup. Copy quoted below is the original seed copy and may since have been edited in Sanity —
> Sanity is the source of truth for live strings. For deploy + status see
> `docs/08-deployment-and-status.md`; for the component/route map see `docs/07`.

Every page, what it is for, its sections, and the copy that seeded it. Copy was reproduced close
to verbatim from the Squarespace site so it did not have to be rewritten, with one change: all
em-dashes have been converted to commas, colons, or periods to match the house style. Italics in the
headings (`*like this*`) mark the words the live site styles in the script/accent treatment (the
Petemoss "script kicker").

---

## Design system (current)

The live look is **Heirloom Coast** with the **Direction C / The Sampler** treatment (applied
2026-07-03). Full rationale lives in `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`;
the short version relevant to this content map:

- **Palette:** Linen `#F4EEE3` (page bg), Paper `#FBF8F1` (cards), Sage `#E4E2D3` (alternating
  bands), Heirloom Ink `#26312E` (text), Heritage Indigo `#28486B` (primary/links, and the "drench"
  surface used on the home hero + bottom CTA band), Claret `#8C3A2E` (CTA buttons + running-stitch
  borders), Brass `#835A24` (small text) / `#B98A3E` (decorative), Gold `#D9B15F` (Petemoss script
  accent, on dark backgrounds only).
- **Type:** Fraunces Variable (light-weight display/headings), Mulish Variable (body/UI), Petemoss
  (script — used only in the logo and as the single "script kicker" eyebrow per page). The italic
  words marked `*like this*` in the headings below are the script/accent treatment.
- This superseded earlier systems. Ignore any older references to Thread Ledger, Pine Teal, Rust,
  Mustard, Bricolage Grotesque, or Work Sans — none of those are in the live code.

---

## Navigation

The nav is data-driven from `siteSettings.navItems` (a mix of `navLink` and `navGroup` dropdown
folders), so Mary Ann can reorder or rename it without code. The live top nav, in order:

`Home` · `About` · **Shop by Item** (folder) · **Inspiration** (folder) · `How It Works` · `Pricing` · `Clearance` · `Request a Quote` (button)

**Shop by Item** (folder) contains: Tote Bags & Pouches, Towels & Linens, Hats & Caps, Shirts & Tops, Jackets & Sweatshirts, Baby & Kids, Home & Gifts, Bring Your Own Item.

**Inspiration** (folder) contains: Style Gallery, Font & Lettering Guide, Thread Color Chart.

Notes:
- There is no "Seasonal" nav item (that page was never built) and no persistent cart icon. Clearance
  ships with Stripe Payment Links, not a real cart, so "Clearance" links straight to the clearance
  page.
- The folders are a UI grouping only. The actual page URLs are flat (e.g. `/tote-bags`, not
  `/shop-by-item/tote-bags`), kept flat to preserve SEO. The folder is just a dropdown.
- `Request a Quote` is the single conversion destination, rendered as the distinct Claret CTA button
  (`siteSettings.quoteCtaLabel`) and present in the nav on every page.

---

## Route + redirect map

Astro routing: explicit page files win over the dynamic `[slug]` route, so the category pages can
live at the root as a dynamic route while the standalone pages stay as their own files. **Constraint
to remember:** never create a category whose slug collides with a standalone route name (e.g. do not
name a category "pricing").

| Path | Page | Source in Astro | Notes |
|---|---|---|---|
| `/` | Homepage | `pages/index.astro` | Singleton (`homePage`) |
| `/about` | About / Contact | `pages/about.astro` | Canonical (`aboutPage`). Redirect `/aboutcontact` → here |
| `/how-it-works` | How It Works | `pages/how-it-works.astro` | `howItWorksPage` |
| `/pricing` | Pricing | `pages/pricing.astro` | `pricingPage` |
| `/request-a-quote` | Request a Quote | `pages/request-a-quote.astro` | Posts to the `/api/quote` Worker route |
| `/thank-you` | Thank You | `pages/thank-you.astro` | Not in nav. Quote redirects here (`thankYouPage`) |
| `/shop-by-item` | Shop index | `pages/shop-by-item.astro` | Lists the item categories (`shopIndexPage`) |
| `/shop` | Shop alias | redirect → `/shop-by-item` | |
| `/tote-bags` | Category | `pages/[slug].astro` | from Sanity `itemCategory` |
| `/towels-linens` | Category | `pages/[slug].astro` | |
| `/hats-caps` | Category | `pages/[slug].astro` | |
| `/shirts-tops` | Category | `pages/[slug].astro` | |
| `/jackets-sweatshirts` | Category | `pages/[slug].astro` | |
| `/baby-kids` | Category | `pages/[slug].astro` | |
| `/home-gifts` | Category | `pages/[slug].astro` | |
| `/bring-your-own-item` | Category (special) | `pages/[slug].astro` | "free assessment" instead of "from $" |
| `/style-gallery` | Style Gallery | `pages/style-gallery.astro` | `styleGalleryPage` + `galleryItem` docs |
| `/font-lettering-guide` | Font & Lettering Guide | `pages/font-lettering-guide.astro` | `fontGuidePage` + `font` docs |
| `/thread-color-chart` | Thread Color Chart | `pages/thread-color-chart.astro` | `threadChartPage` + `threadColor` docs |
| `/clearance` | Clearance | `pages/clearance.astro` | `clearancePage` + `clearanceItem` docs (Stripe Payment Links) |
| `/legal/[slug]` | Legal / policy pages | `pages/legal/[slug].astro` | from Sanity `legalPage` docs |
| `/404` | Not found | `pages/404.astro` | `notFoundPage` |

There is no `/seasonal` page. The `[slug].astro` catch-all serves the item-category pages at the
root; explicit page files win over it, so never create a category whose slug collides with a
standalone route (e.g. do not name a category "pricing").

Put these in a Cloudflare Pages `_redirects` file:

```
/aboutcontact   /about   301
/shop           /shop-by-item   301
/cart           /clearance   301
```

---

## Homepage  (`/`)

The funnel in one page: orient, build trust, route to the quote. All copy comes from the `homePage`
singleton. Current section order (top to bottom):

**1. Hero** (indigo "drench" surface — Direction C / The Sampler)
- Eyebrow: `Handmade in St. Matthews, SC`
- Heading: `Custom monogramming, *made just for you.*`
- Subhead: `From classic 3-letter monograms to full appliqué designs, we stitch everything by hand, locally. Towels, totes, hats, sweatshirts, baby gifts, and more.`
- Buttons: `Request a Free Quote` (→ `/request-a-quote`) · `Browse by Item` (→ `/shop`)
- Background: since no dedicated hero images are authored on `homePage`, the hero reuses the real
  featured `galleryItem` photos as its background (same image-hero + scrim treatment the category
  pages use).

**2. Trust strip** (`trustItems`) — short reassuring lines on the light/sage band directly below the
indigo hero: e.g. `No payment to request a quote` · `Reply within 1 business day` · `Local,
home-based studio`.

**3. Category grid**
- Label: `Choose a category to get started`
- Exactly **8** cards — the 8 item categories, each rendered from its `itemCategory` `cardImage`
  (real photo thumbnails, not emoji). There are no Seasonal or Clearance cards in this grid. A "View
  all items" link points to `/shop-by-item`. The starting hero/description copy for each category
  (still useful as a reference for the category pages) is:

| Category | Description | Hint |
|---|---|---|
| Tote Bags & Pouches | The gift people actually use. Canvas, jute, nylon, monogrammed with your initials or name. | from $16 |
| Towels & Linens | Bath towels, hand towels, tea towels, napkins. The easiest upgrade to your guest bath or kitchen. | from $16 |
| Hats & Caps | Baseball caps, beanies, sun hats, monogrammed or custom text, centered or side-stitched. | from $16 |
| Shirts & Tops | Polos, t-shirts, button-downs. Chest, cuff, or pocket placement, perfect for teams or gifts. | from $16 |
| Jackets & Sweatshirts | Bordered sash, appliqué, or bold collegiate lettering. | from $18 |
| Baby & Kids | Soft thread, sweet fonts, and something they'll keep forever. Onesies, blankets, burp cloths. | from $16 |
| Home & Gifts | Ornaments, pillows, blankets, door hangers, wreath sashes. If it's fabric, we can monogram it. | from $16 |
| Bring Your Own Item | Have something you love? Bring it in. We'll assess it free, most fabric items work beautifully. | free assessment |

**4. Meet the maker** (About / maker blurb — `aboutEyebrow`/`aboutHeadline`/`aboutBody`/`aboutPhoto`)
- Label: `Meet the maker`
- Heading: `Hi, I'm *Mary Ann.*`
- Body: `I'm a home-based embroidery artist in St. Matthews, SC. What started as a creative hobby three years ago has grown into something I truly love sharing. Every order comes directly to me, no team, no warehouse. When you reach out, you're talking to the person who will actually stitch your item.`
- Link: `More about MAS Monograms` (→ `/about`)

**5. Process preview** (`processSteps`, the 3–4 step pattern, reused on key pages)
- Label: `How it works`
- 1 `Browse`: `Pick your item & get inspired`
- 2 `Request`: `Submit a free quote form`
- 3 `Quote`: `Get your custom price in 1 day`
- 4 `Stitch`: `Approve & we get to work`
- CTA: `See how it works` (→ `/how-it-works`)

**6. Gallery preview** (`galleryEyebrow`/`galleryHeadline`/`gallerySubhead`)
- A masonry grid of up to 9 featured `galleryItem` photos.
- Body voice: `Browse real work from our studio, and tell us your vibe. We'll pick the perfect font and thread for you.`
- Button: `View full style gallery` (→ `/style-gallery`)

**7. Final CTA banner** (indigo drench, matching the hero — Direction C bookends)
- Heading: `Ready to make something *personal?*`
- Body: `Requesting a quote is free and takes about 2 minutes. We'll reply within 1 business day with your custom price.`
- Button: `Request a Free Quote`

**Removed 2026-07-03:** the homepage no longer has a "Most popular combinations" section (the
`popularCombination` type was removed and the interactive "preview your combination" picker never
landed — embroidery fonts can't be rendered live; the Font Guide + Thread Color Chart pages cover
browsing for real), a "Reviews"/testimonials section (Mary Ann has no genuine reviews yet and none
are invented; the `testimonial` type was removed), or a stat-counter strip.

---

## How It Works  (`/how-it-works`)

**1. Hero**
- Eyebrow: `No cart. No checkout. No guessing.`
- Heading: `Here's *exactly* how ordering works.`
- Body: `Custom monogramming means every order is unique, so we use a simple quote process instead of a standard checkout. It takes about 2 minutes to request, and we handle everything from there.`

**2. The four steps** (label `The process`, heading `Four simple steps`)

- **Step one: Browse & get inspired:** `Start by exploring our item categories. Each page shows real photos of finished work, popular font and thread combinations, and pricing ranges so you know what to expect before you ever fill out a form.`
  - Browse totes, towels, hats, apparel, baby items, home gifts, and more
  - See curated font + thread pairings, no design experience needed
  - Have your own item? That works too, bring it in or ship it to us
- **Step two: Fill out the quote form:** `Our quote form walks you through everything we need to give you an accurate price: item type, letters, font style, thread color, placement, quantity, and your timeline. It takes about 2 minutes. No payment required at this stage.`
  - Tell us your letters, name, or text, up to you
  - Not sure on font or thread? Just say "recommend for me," we love that
  - Have a photo or reference? Upload it right in the form
- **Step three: Receive your custom quote:** `We'll review your request and send a custom invoice to your email within 1 business day. The price is based on your specific item, stitch count, and any complexity. No surprises, what you see is what you pay.`
  - Response within 1 business day, usually same day
  - Your invoice will show a clear itemized price before any payment
  - Have questions? Just reply, we're happy to adjust anything
- **Step four: Approve & we get to stitching:** `Once you approve the quote and complete payment, we get to work. We'll keep you updated along the way and reach out if we have any questions before we stitch. When it's done, we'll arrange pickup or shipping, whatever works best for you.`
  - Turnaround time shared upfront, rush options available
  - We'll contact you before stitching if anything needs clarifying
  - Local pickup in St. Matthews, SC, or we can arrange shipping

There is no stats strip on this page (the `★ 5.0 from dozens of happy customers` / years-of-experience
counters were removed with the rest of the invented social proof).

**3. FAQ** (label `Common questions`, heading `Good questions. Here are the answers.`). The FAQ is
driven by shared `faqItem` documents flagged `showOnHowItWorks`, so the same answers can be reused on
Pricing. Seed copy:

1. **Do I have to pay anything to request a quote?** No, submitting a quote request is completely free. You'll only pay after you review and approve your custom invoice.
2. **What if I'm not sure what font or thread color to choose?** Just say "recommend for me" on any choice in the form, that's genuinely one of our favorite things to do. Tell us your vibe (classic, bold, soft, festive) and we'll suggest the perfect combination.
3. **Can I bring my own item to be monogrammed?** Yes. "Bring Your Own Item" is a first-class option. Most fabric items work well. Select that option on the quote form and describe what you have, we'll let you know if it's a good candidate before you commit to anything.
4. **How long does it take from quote to finished item?** We respond to quote requests within 1 business day (usually the same day). Once approved and paid, most orders are completed within 3 to 7 business days. Rush turnaround is available, just flag it in your request and we'll let you know if it's possible.
5. **What if I want to make changes after I submit the form?** No problem. Just reply to the quote email before approving, we can adjust the design, font, thread, or anything else. Changes after stitching has begun may not be possible, but we'll always check in with you first if anything looks unclear.
6. **Do you ship, or is this pickup only?** We're based in St. Matthews, South Carolina, and local pickup is always welcome. Shipping is available, just mention it in your quote request and we'll include the shipping cost in your invoice.

**4. CTA banner:** `Ready to get *started?*` / `It's free to request a quote and takes about 2 minutes. We'll take it from there.` / buttons `Request a Free Quote` · `Browse Items First`

---

## Pricing  (`/pricing`)

The numbers are authoritative in `docs/03-pricing.md` (transcribed from Mary Ann's scan). The page
itself presents them as ranges with a "no surprises" trust statement. Section pattern: hero → the
four pricing tiers as cards → what affects price (stitch count, letter count, complexity, color
changes) → a "no surprises / price before payment" reassurance block → CTA banner. Pull the exact
tier copy and the one-time fees from `docs/03`.

---

## Item category pages  (one template, currently 8 categories)

Driven by the `itemCategory` type in Sanity and served by `pages/[slug].astro` at the site root.
The count is data-driven (add or retire categories in Sanity). Same template for all:

1. **Hero** (short, image-backed from the category's `heroImages`) with the eyebrow, name, and
   description, plus a single `Request a Quote` CTA.
2. **Trust strip** — the category's `trustItems` on an indigo band below the hero.
3. **Gallery** of finished work for this category (the `galleryItem` docs whose `relatedCategory`
   matches), followed by a "Request something like this" bridge that pre-fills the item type on the
   quote form (`/request-a-quote?item=<slug>`).
4. **Explore Other Items** cross-sell — up to three other categories, ranked by how many gallery
   photos are tagged to them.
5. **CTA banner** to the quote form.

There is no longer a "What to Expect" two-column section or a per-category "Pricing range callout" —
those were dropped in the redesign. The starting description copy for each category is the homepage
card table above. Bring Your Own Item still uses `free assessment` in place of a "from $" price.

---

## Shop index  (`/shop-by-item`)

A simple landing page (`shopIndexPage`) listing every `itemCategory` as a card — each with its
photo, name, one-line description, CTA label, and `startingPrice` — under a compact hero and an
optional `gridIntro`, ending in a CTA banner. Exists so the "Browse by Item" / "Shop" nav has a real
destination. (`/shop` redirects here.)

---

## Style Gallery  (`/style-gallery`)

Label `Style Gallery`, heading `Not sure where to *start?*` (matches the homepage teaser voice). A
filterable grid of finished-work photos, ideally tagged by item type / font / thread so visitors can
filter. Each item is a `galleryItem` in Sanity. The point of the page is inspiration that funnels
into the quote form ("tell us your vibe and we'll pick the combination"). End with a CTA banner.

---

## Font & Lettering Guide  (`/font-lettering-guide`)

The full font catalog, driven by the `font` type in Sanity. Because these are embroidery fonts, not
web fonts, every font is shown as an **uploaded image preview**, not CSS-rendered text. Group them
into named line fonts, monogram styles, and decorative/appliqué fonts. Full breakdown, available
sizes, and asset mapping in `docs/04-fonts-and-lettering.md`. This page and the quote form's font
dropdown read from the same `font` documents, so the list stays in sync.

---

## Thread Color Chart  (`/thread-color-chart`)

A swatch grid driven by the `threadColor` type. Each swatch shows the color (an approximate hex for
display, or an uploaded swatch image for accuracy) and its name, grouped by color family. Include the
standing caveat that on-screen colors are approximate and Mary Ann will confirm the exact thread.
End with a CTA to the quote form.

---

## Request a Quote  (`/request-a-quote`)

The conversion page and the single most important build. Full field list, validation, and the
Cloudflare + Resend backend are in `docs/05-quote-form-and-backend.md`. Page copy keeps the
reassurance front and center: free, about 2 minutes, reply within 1 business day, no payment now.

---

## About  (`/about`)

Driven by the `aboutPage` singleton. This is Mary Ann's story page, **not** a contact hub: there is
no on-page "Get in touch" split, no second contact form, and no info-blocks section. Contact details
(email `owner@example.com`, phone `(000) 000-0000`, location, hours, socials) live in the footer /
`siteSettings`, and the only conversion path is the quote form. Current sections:

**1. Hero** (`heroEyebrow` as the script kicker, `heroHeadline`, optional `heroSubhead`/`heroImage`) —
seed copy: eyebrow `St. Matthews, SC · Home-based · Handcrafted`; heading `The person behind every *stitch.*`; body `MAS Monograms is a one-woman home embroidery studio. Every order gets personal attention, because that's the whole point.`

**2. Story** (`storyHeadline` + `storyContent` portable text, optional `makerPhoto`, `makerAttribution`
signature line, and an optional `studioNote` callout). Seed copy:
- `MAS Monograms started the way most good things do, as a creative outlet that quietly turned into something bigger. I've been doing embroidery for the last three years, and what started as a challenge has become one of my favorite things. There's something deeply satisfying about taking a blank item and turning it into something personal and lasting.`
- `I run this business out of my home in St. Matthews, SC. That means every order comes directly to me, there's no team, no warehouse, and no assembly line. When you reach out, you're talking to the person who will actually stitch your item.`
- `I work with blankets, towels, clothing, totes, hats, baby items, home goods, even socks and shoe laces. Beyond embroidery, I also do card making and basic sewing, and I'm always exploring new crafts.`
- Attribution / signature: `Mary Ann Stone · Founder, MAS Monograms`

**3. Recent work strip** (`recentWorkHeadline`, defaults to "Recent work from the studio") — up to
three featured `galleryItem` photos, reused to fill the imagery gap on this otherwise text-heavy page.

**4. Values** (`valuesHeadline` + `values[]`, three to four short `label` + `body` cards) —
seed copy (heading `What makes MAS Monograms different`):
- **One person, every order**: You deal directly with Mary Ann, no customer service queues, no middlemen. Your message goes straight to the person stitching your item.
- **Personal guidance included**: Not sure what font or thread to pick? Just say so. Helping customers figure out what they actually want is one of the best parts of the job.
- **Local & accessible**: Based in St. Matthews, SC. Local pickup is always available, and the pricing reflects a home studio, not a commercial retailer.
- **Price before payment, always**: Every order starts with a free custom quote. You approve the price before anything is stitched or charged. No surprises.
- **Bring what you have**: You don't have to buy from us. If you have an item you love and want monogrammed, bring it in. Most fabric items work just fine.

**5. CTA banner** to the quote form.

Removed since the original spec: the "skill tags" row, the stats block (which also fixed the old
"Mason, Ohio" location bug — location is now St. Matthews, SC everywhere), the "Get in touch" two-way
split, the second/general contact form, and the testimonials section (no genuine reviews yet).

---

## Thank You  (`/thank-you`, not in nav)

Where the quote form redirects on success. Should confirm receipt, reset expectations (reply within
1 business day), and offer somewhere to go next (browse the gallery, read How It Works). Keep it warm
and specific so the visitor knows the submission actually worked.

---

## Clearance  (`/clearance`)

The only "buy now" page. Pre-made stock, fixed prices, no quote. Each item is a `clearanceItem` in
Sanity with a name, photo, price, and a **Stripe Payment Link**. The "Add to cart / check out" copy
from Squarespace becomes a "Buy now" button that opens the Stripe-hosted checkout. No cart state to
manage. See `docs/03` for the commerce note.

---

## Legal / policy pages  (`/legal/[slug]`)

Policy pages (e.g. privacy policy, terms) driven by the `legalPage` collection — each doc has a
title, slug, `lastUpdated` date, and portable-text body. Served by `pages/legal/[slug].astro` and
linked from the footer legal row. Add or edit a policy entirely in Sanity, no code needed.

---

## 404  (`/404`)

On-brand not-found page (`notFoundPage`): a short apologetic line in the house voice, and links back
to the homepage, the shop, and the quote form.

---

## Footer (every page)

Data-driven from `siteSettings` (`footerColumns`, `socialLinks`, contact fields, `footerCredit`).

- Brand block: `MAS *Monograms*` + tagline, plus location (`St. Matthews, SC`) and hours line.
- Social: driven by `siteSettings.socialLinks`, currently empty — real Facebook/Instagram URLs are
  pending from Mary Ann. (No Pinterest is set.)
- Column **Shop by Item**: the 8 categories
- Column **Inspiration**: Style Gallery, Font & Lettering Guide, Thread Color Chart
- Column **Info**: How It Works, Pricing, About, Clearance
- Column **Get Started**: Request a Quote, How the process works, See finished work
- Closing CTA: `Ready to make something *personal?*` → `Request a Free Quote`
- Legal row: copyright line + policy links (`legalPage` docs) + the build credit, now
  **`Site Designed by Nixon Creative Studio`** (→ nixoncreativestudio.com), not "Nate's Creations".

---

## Voice and microcopy

Warm, direct, confident. The job of the copy is to lower anxiety about an unfamiliar quote process.
Anchor phrases that should stay consistent across the site:
- "No payment required to request a quote" / "It's free and takes about 2 minutes"
- "We respond within 1 business day" (often "usually same day")
- "Tell us your vibe and we'll pick the perfect combination"
- "Recommend for me" as the friendly fallback on every choice
- "No surprises on price" / "Price before payment, always"
- "Bring what you have" for the bring-your-own option

House style for any new copy: no em-dashes (use commas, colons, or restructure), no corporate filler,
prose over bullet lists unless the content is genuinely a list. Match the existing reassuring tone.
