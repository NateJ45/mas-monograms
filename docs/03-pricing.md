# 03: Pricing

> **Status: original spec.** These numbers are seeded as the four `pricingTier` docs (rendered
> "from $X" by complexity). Preserved as the authoritative source; current state in
> `docs/08-deployment-and-status.md`.

Authoritative pricing, transcribed from Mary Ann's scan (`assets/pricing-scan.png`). These are the
real numbers. The Pricing page and the per-category callouts should present them as starting prices
and ranges, with the standing message that the exact price depends on the item, stitch count, and
complexity, and is confirmed in the quote.

In Sanity these become `pricingTier` documents so Mary Ann can adjust a number without a code change.

---

## How pricing works (the framing)

Pricing is based on **complexity and stitch count**. Larger designs, more colors, more letters, and
digitized custom artwork all push the price up. Nothing is charged until the customer approves a
quote. The brand promise is "no surprises, price before payment."

Source intro line (good About/Pricing voice): "We all like something to be unique and personal.
That's what MAS Monograms wants to provide for you. We offer monograms for blankets, towels,
clothing, even socks, shoe laces, and pet items."

---

## The four pricing tiers

### Basic Monogram: from $16
Monogram or text starts at $16.00. Six letters or fewer is the basic cost. Seven letters or more
adds a small charge. Typically a single-color monogram or name. This is the "from $16" anchor used
across most category pages.

### Premium Monogram: from $18
Premium features (bordered/sash styles, two-sided designs, multiple colors) start at $18.00 and go up
with stitch count and color changes. The larger the monogram, the higher the price. This is the
"from $18" anchor used for Jackets & Sweatshirts.

### Custom Appliqué: from about $45
A one-time **setup charge of $30.00**, plus a separate stitching fee based on stitch count. The
examples Mary Ann references (a "Merry" design on a red sweatshirt; a cupcake in the Fishtail font)
land around $45.00 total.

### Custom Embroidery: from $16, plus a one-time $30 digitization fee
Custom embroidery starts at $16.00 for roughly a 5,000-stitch design, plus a one-time **$30.00 setup
/ digitization fee**. Larger, more detailed pieces cost more: the extensive sweatshirt examples,
which involve digitization and a high stitch count, run between **$60 and $75**.

---

## Add-ons and modifiers to surface

- **Names of 7+ letters:** small additional charge on top of the base.
- **Jackets & sweatshirts:** start at $18 (premium tier).
- **Rush turnaround:** available, flagged in the quote form, priced case by case.
- **Shipping:** available nationwide, cost included in the quote (default is local pickup in
  St. Matthews, SC).

---

## Presenting it on the site

- Lead with starting prices ("from $16"), not exact prices, because every job differs.
- On each category page, show a pricing range callout sized to that category (e.g. towels skew basic;
  sweatshirts skew premium/appliqué).
- Always pair price with the reassurance: free to ask, no payment up front, itemized invoice before
  anything is charged.

---

## Commerce note: Clearance and quote payments

Two separate money paths, and only one of them touches the website.

**Quote payments: off-site, no code.** The quote flow ends with Mary Ann sending a custom invoice.
She can do that however she likes (Square, PayPal, Stripe Invoicing). The site never collects payment
for quoted work. The quote form's only job is to capture the request and email it to her.

**Clearance: Stripe Payment Links.** The live Squarespace site added a Clearance section with real
add-to-cart checkout for pre-made stock. Astro on Cloudflare has no native cart, and standing up a
full cart for a handful of clearance items is not worth it. Use **Stripe Payment Links**:
- Each `clearanceItem` in Sanity has a `stripePaymentLink` field (a URL Mary Ann creates in her
  Stripe dashboard, no code required).
- The "Buy now" button links straight to that Stripe-hosted checkout. Stripe handles payment, the
  receipt, and tax/shipping settings.
- Nothing sensitive lives in the repo, and there is no cart state to maintain.

If Clearance is often empty, hide the page and the nav item until there is stock, again as a flag in
Sanity.
