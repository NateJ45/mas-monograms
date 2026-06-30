# 07: Component & Route Map

How the Squarespace sections become Astro components, and the proposed `src/` layout. The route table
itself lives in `docs/01`; this doc is about the build.

---

## Proposed `src/` layout

```
src/
  pages/
    index.astro                 homepage (singleton)
    about.astro
    how-it-works.astro
    pricing.astro
    request-a-quote.astro
    thank-you.astro
    shop-by-item.astro
    style-gallery.astro
    font-lettering-guide.astro
    thread-color-chart.astro
    seasonal.astro
    clearance.astro
    404.astro
    [category].astro            dynamic: builds /tote-bags, /towels-linens, ... from Sanity
  components/
    Nav.astro                   header + the two dropdown folders; mobile nav is the one JS island
    Footer.astro
    Seo.astro                   <title>, meta, OG tags, from page seo + siteSettings.defaultSeo
    Hero.astro                  eyebrow + heading (with the italic accent treatment) + body + CTAs
    ProcessStrip.astro          the 4-step row, from step[] data
    CategoryGrid.astro          the card grid, from itemCategory docs
    CategoryCard.astro
    GalleryGrid.astro           captioned, price-tagged image grid (category pages + style gallery)
    PopularCombos.astro         the 3 favorite-combination cards
    Testimonials.astro          review row, from testimonial docs
    Testimonial.astro
    PricingCallout.astro        the per-category range box
    PricingTiers.astro          the four-tier cards on /pricing
    FeatureCards.astro          the About "why come back" grid
    Stats.astro                 the stats strips
    Faq.astro                   accordion, from faqItem[]
    CtaBanner.astro             the recurring "ready to make something personal?" block
    FontCard.astro              preview image + name + sizes (font guide)
    ThreadSwatch.astro          swatch + name (thread chart)
    ClearanceCard.astro         image + price + Stripe "Buy now" button
    QuoteForm.astro             the six-group form (see docs/05); a JS island for nicer UX
    MakerBlurb.astro            the "Hi, I'm Mary Ann" block (home + about share the spirit)
  layouts/
    BaseLayout.astro            <html>, Seo, Nav, <slot/>, Footer, global styles
  lib/
    sanity.ts                   the Sanity client (project id, dataset, CDN, image URL builder)
    queries.ts                  GROQ queries, one per page + the collection fetches
  styles/
    tokens.css                  design tokens (provided in this seed)
    global.css                  resets, base element styles, font-face links
public/
  logo.svg                      the v3 wordmark
  favicon, og image, etc.
functions/
  api/
    quote.ts                    the Pages Function for the quote + contact forms (see docs/05)
```

---

## Squarespace section → Astro component

| Squarespace section | Becomes | Data source |
|---|---|---|
| Code Block hero (two-column with Image Block) | `Hero.astro` | page singleton or `itemCategory` |
| 4-step "How it works" strip | `ProcessStrip.astro` | `step[]` |
| Category card grid | `CategoryGrid.astro` + `CategoryCard.astro` | `itemCategory` docs |
| Gallery grid with captioned pricing | `GalleryGrid.astro` | `galleryImage[]` / `galleryItem` |
| "Most popular combinations" | `PopularCombos.astro` | `popularCombination` docs |
| Testimonial row | `Testimonials.astro` | `testimonial` docs |
| Pricing range callout | `PricingCallout.astro` | `itemCategory` fields |
| Pricing tier cards | `PricingTiers.astro` | `pricingTier` docs |
| About "why come back" cards | `FeatureCards.astro` | `featureCard[]` |
| Stats strip | `Stats.astro` | `stat[]` |
| FAQ | `Faq.astro` | `faqItem[]` |
| Native Form Block (quote) | `QuoteForm.astro` + `functions/api/quote.ts` | Sanity for dropdowns, Resend for send |
| Footer Code Block | `Footer.astro` | `siteSettings` + nav |
| CTA banner | `CtaBanner.astro` | `ctaBanner` |

The two Squarespace headaches both disappear here. The "CDN images can't load inside Code Blocks"
workaround (Image Block beside a Code Block) is gone, because Astro renders images and markup in the
same component. The "footer mobile gap" hack is gone, because the footer is a normal component.

---

## Data flow

Astro builds static pages at deploy time. Each page's frontmatter runs a GROQ query through
`lib/sanity.ts`, gets typed data, and passes it to components as props. No client-side data fetching
for content. Use Sanity's image URL builder for responsive images. Set up a deploy hook so publishing
in Sanity triggers a Cloudflare Pages rebuild, which keeps the static site fresh without manual
redeploys.

The only runtime (non-static) code is the Pages Function handling form posts. Everything else is
prebuilt HTML and CSS, which is why it will be fast and cheap to host.

---

## Component editing guidance

Components are code, but they are the layer you will tweak most. Keep them small and single-purpose,
comment the non-obvious parts (especially the accent-word heading treatment and the form's
progressive-enhancement logic), and test changes on a Cloudflare preview deploy before promoting to
production. Pull all colors, fonts, spacing, and radii from `tokens.css` rather than hardcoding
values, so a design tweak is one edit in one place.
