# MAS Monograms: Rebuild (Sanity + Astro + Cloudflare)

This repo is the migration seed for **mas-monograms.com**, moving off Squarespace 7.1 onto a
code-first stack. Everything here was extracted from the live Squarespace site and the client's
source materials. The goal: drop this into a Claude Code project, point Claude Code at the docs,
and build.

**Business in one line:** MAS Monograms is a one-woman, home-based embroidery studio in
St. Matthews, SC (owner: Mary Ann Stone). Pricing varies by item, thread, placement, and
complexity, so the site does not use a normal add-to-cart checkout. It captures detailed **quote
requests** and Mary Ann sends a custom invoice.

> Built by Nate's Creations (natecreations.com).

---

## The stack, and why

| Layer | Tool | Job |
|---|---|---|
| Content | **Sanity** (headless CMS) | Structured content Mary Ann/Nathan can edit without touching code: categories, fonts, thread colors, testimonials, gallery, pricing, page copy. |
| Site | **Astro** | Static-first rendering. Pulls from Sanity at build time, ships almost no JS. Islands only where we need interactivity (mobile nav, quote form). |
| Hosting | **Cloudflare Pages** | Static hosting on the edge, free tier, Git-connected deploys. |
| Forms / dynamic | **Cloudflare Pages Functions** (Workers under the hood) | Receives the quote form POST, validates it, emails Mary Ann, redirects to the thank-you page. |
| Transactional email | **Resend** | Sends the quote notification + customer confirmation. See note below. |
| Clearance payments | **Stripe Payment Links** | The one true "buy now" path on the site. See note below. |

### Two decisions worth reading before you build

**1. Email does NOT use the old free MailChannels trick.** That free Workers-to-MailChannels
integration was sunset on Aug 31, 2024. Cloudflare's own current docs point to **Resend** for
sending mail from Workers/Pages, and that is what this project assumes. Cloudflare also has a
native Email Sending product, but as of early–mid 2026 it is still in beta, so Resend is the safer
choice for a live business. Resend needs DNS records (SPF + DKIM) added to mas-monograms.com and an
API key stored as a Cloudflare secret (never in the repo). Full setup in
`docs/05-quote-form-and-backend.md`.

**2. The live site grew a small store since the original spec.** It now has a **Seasonal** page and
a **Clearance** section that uses real add-to-cart checkout for pre-made stock. The original plan
said "no cart, ever." That is no longer true, so the rebuild has to account for it. Since Astro on
Cloudflare has no native commerce, the recommended path is **Stripe Payment Links**: one link per
clearance item, modeled in Sanity, no cart code to maintain. The quote flow stays separate and does
not handle payment at all (Mary Ann invoices off-site). Details in `docs/03-pricing.md` and
`docs/01-content-architecture.md`.

---

## What's in this seed

```
mas-monograms-rebuild/
  README.md                     ← you are here
  docs/
    01-content-architecture.md  ← every page, every section, verbatim copy, the route + redirect map
    02-design-system.md         ← colors, type, logo, component styling (mirrors src/styles/tokens.css)
    03-pricing.md               ← the authoritative pricing, transcribed from the client's scan
    04-fonts-and-lettering.md   ← all font/monogram options, asset mapping, how they feed the form
    05-quote-form-and-backend.md← the quote form spec + the Cloudflare/Resend backend, step by step
    06-sanity-content-model.md  ← every Sanity schema type and field, in plain language
    07-component-and-route-map.md← Squarespace section → Astro component mapping; the full route table
  sanity/
    schemas/
      index.ts                  ← wires the schema types together; lists which are done vs to-build
      objects/                  ← reusable embedded shapes: seo, galleryImage (full examples)
      documents/                ← collection types: itemCategory, font, threadColor, testimonial (full examples)
      singletons/               ← site-wide / one-off docs: siteSettings (full example)
  src/
    styles/
      tokens.css                ← design tokens as CSS custom properties, heavily commented
  assets/                       ← the client's original source files, renamed sensibly
    pricing-scan.png            font-pillow.jpg          font-vine-heirloom.jpg
    fonts-from-pdf.pdf          font-master-circle.jpg   font-10-popular.jpg
```

This is reference + starter code, not the finished app. The Astro `pages/`, `components/`, and
`lib/` folders are intentionally left for Claude Code to generate, using the docs as the spec. The
Sanity schemas give Claude Code an unambiguous pattern to extend (two object types, four document
types, and one singleton built in full, with every remaining type specified in `docs/06`).

---

## Suggested build order

This mirrors the order things depend on each other, so you are never blocked.

1. **Scaffold the two projects.** `npm create astro@latest` for the site, `npm create sanity@latest`
   for the studio (a `/studio` folder in this repo is fine, or a sibling repo). Pin current stable
   versions; let Claude Code confirm the latest API surface from the live docs.
2. **Sanity schemas first.** Build out every type in `docs/06`. Without the content model, the Astro
   pages have nothing to render. Use the files in `sanity/schemas/` as the pattern.
3. **Design tokens + base layout.** Drop in `src/styles/tokens.css`, build `BaseLayout.astro`, the
   `Nav`, and the `Footer`. Wire the fonts (Google Fonts: Playfair Display, DM Sans, Great Vibes).
4. **Seed content.** Enter real content in Sanity: site settings, the 8 categories, fonts, thread
   colors. This is also where Mary Ann's pending items land (see below).
5. **The quote form + backend.** This is the conversion engine and the only hard technical piece.
   Build `QuoteForm.astro` and the Pages Function in `docs/05`. Test the email round-trip end to end.
6. **Pages, in this order:** How It Works → Pricing → one category page (then template the other
   seven) → Shop index → Style Gallery → Font & Lettering Guide → Thread Color Chart → About →
   Thank You → Seasonal → Clearance → 404 → Homepage last (it pulls from everything else).
7. **Redirects + DNS cutover.** Add the `_redirects` file (route table in `docs/07`), verify Resend
   DNS, then point mas-monograms.com at Cloudflare Pages.

---

## "Safe to edit yourself" vs "code, do not touch"

A division to keep in the project so future-you (and Mary Ann) know what is fair game.

**Safe to edit yourself (in Sanity, no code):**
- All page copy, headings, and CTA text
- Adding/removing/reordering categories, fonts, thread colors, testimonials, gallery images
- Pricing numbers and notes
- Site settings: contact email, social URLs, response-time copy, footer text
- Seasonal items and clearance items (including their Stripe links)

**Code, do not touch unless you mean to (in this repo):**
- `sanity/schemas/**`: changing a field shape can orphan existing content. Migrate deliberately.
- The Pages Function that handles the form: a typo here silently drops customer leads.
- `src/styles/tokens.css` color and font variables: these cascade everywhere. Change the token, not
  the 40 places it is used.
- `_redirects`: these protect SEO from the old Squarespace URLs.

The Astro components sit in between: editable, but they are code, so comment generously and test on a
preview deploy before promoting.

---

## Still needed from Mary Ann (carried over from the Squarespace build)

These are content gaps, not code. They block a real launch but not the build.

1. **Real customer testimonials** to replace the `[Customer Name]` placeholders.
2. **Real Facebook and Instagram URLs** (currently pointing at Squarespace's own demo accounts).
3. **Mary Ann's real contact email** for the footer and the quote-notification recipient.
4. **Category hero photos** and **Style Gallery photos** (uploaded into Sanity now, not the old CDN).
5. **Font preview crops** from `assets/fonts-from-pdf.pdf` exported as individual JPGs (Golden
   Valley, Fishtail, Curlz, Classic, CA Liberty), since the site cannot render those as live fonts.

## Content bugs to fix during migration (do not carry these forward)

Found on the live site while extracting copy:
- The About page stats block says **"Based in Mason, Ohio."** That is Nathan's city, not the
  business. It should read St. Matthews, SC, like everywhere else.
- Footer/social links resolve to `facebook.com/squarespace` and similar demo URLs.
- One internal link points to `/aboutcontact` while the canonical About page is `/about`.
- The Open Graph image still points at the old raster logo (`MasMonogramsText.png`), not the
  current v3 SVG wordmark.
