# Product

Strategic context for design work on the MAS Monograms site. Derived from the repo's own docs and copy (`docs/01-content-architecture.md`, `docs/02-design-system.md`, `docs/03-pricing.md`, the 2026-07-01 redesign audit, the 2026-10-04 Atelier brief) and the vault note on 2026-10-03; updated to Direction D on 2026-10-04. Sections tagged "Proposed" below are drafts written from repo evidence on Nathan's delegation, not confirmed by Nathan or Mary Ann. Treat them as working assumptions and replace them with what Mary Ann actually sees when you can. Visual decisions live in `DESIGN.md`.

## Register

brand

## Users

People who want something personalised and are deciding whether to hand it to Mary Ann Stone's studio in St. Matthews, SC, as the site's own pages address them:

- **A gift buyer or someone upgrading their own things** who wants initials or a name on a towel, tote, hat, shirt, jacket, baby item or home gift (the eight item categories, "Shop by Item"). They browse the style gallery, the font and lettering guide and the thread colour chart to picture the result, then ask for a quote.
- **Someone with their own item to stitch** ("Bring Your Own Item", assessed free) or a team or group order.
- **A bargain shopper** on Clearance (Stripe Payment Links, no cart).

There is no cart and no checkout: revenue comes through the quote form and custom invoices.

**Typical customer (Proposed 2026-10-03, drafted by Claude on Nathan's delegation from repo evidence; edit if wrong.)**

- **Who:** most likely a woman buying a personalised gift or upgrading her own things. Evidence: the copy leads with "the gift people actually use", baby and kids items, home gifts and ornaments, and the 2026-07-01 audit names a "younger gift-buyer" as the audience a design-forward direction would win (`docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`). Age is not measured anywhere; working assumption is a broad adult range, roughly 25 to 65, with no age-specific design choices.
- **Local versus national:** local first, with nationwide reach by shipping. Evidence: the studio is home-based in St. Matthews, SC, local pickup is "always welcome", and shipping is "available nationwide" with the cost put in the quote (`docs/01-content-architecture.md` FAQ, `docs/03-pricing.md`). No order geography is recorded, so the split is unknown. Working assumption: design for a first-time visitor who has never met Mary Ann and needs the "one person, every order" trust signals.
- **Phone versus desktop:** treat phone as the primary device. This is a decision from evidence, not data: the old Squarespace site had no analytics, so nothing was dropped at cutover and there is no device split to cite (vault note, decision of 2026-10-03). Support for the assumption: the CI gate runs a WebKit iPhone 14 profile alongside chromium, reflow is asserted at 320px, and tap targets are at least 44px (`docs/TESTING.md`). Cloudflare Web Analytics is wired but optional (`PUBLIC_CF_ANALYTICS_TOKEN`, `docs/08-deployment-and-status.md`); turn it on to replace this assumption with a number.
- **Repeat versus first-time:** not recorded. Working assumption: mostly first-time, referral-driven visitors, with repeat orders by email thread rather than through the site.

## Product Purpose

The public site and self-editing home of an embroidery and monogramming studio, rebuilt off Squarespace and live at mas-monograms.com. The scoreboard set in the 2026-07-01 audit has two goals: **convert visitors into quote requests**, and **show the craft like a portfolio worth trusting**. The one conversion is "Request a Quote" (a form that posts to the site's own Worker, with Turnstile, R2 and Resend); nothing is charged until the customer approves the quote ("price before payment"). Pricing is shown as "from $X" starting prices by complexity and stitch count. Mary Ann edits everything herself in the embedded Sanity Studio at `/studio`, so every design must survive her content: any photo, any headline length, sections reordered.

## Brand Personality

A hand-stitched heirloom shop on the South Carolina coast ("Heirloom Coast"), wearing "Direction D, The Atelier" (2026-10-04): warm linen and paper alternating with deep Midnight and indigo bands, claret kept for the one action that matters, and a thread-gold gradient for the golden thread and the italic swash words. The guiding idea is that this is a craft you can watch happen: the site makes its own product pictures with a live embroidery engine (the Monogram Atelier) because Mary Ann's photos are modest, and hoops, spools, tags and running stitches carry the rest. Nathan's brief was that the earlier look was generic and boring, so ambition is welcome here; persuasion still comes from craft, clarity and delight, never invented proof. Voice (from the seed copy): warm, plain and specific, written as Mary Ann ("we stitch everything by hand, locally"), with a signed maker's name as a trust signal. Mary Ann is not actively running the business day to day, which is why the design had free rein. House style: no em-dashes in copy (commas, colons or periods instead).

## Anti-references

Recorded decisions only:

- **Generic and boring.** The reason for Direction D (Nathan, 2026-10-04). The site needs its own standout feature, as other Nixon Creative Studio sites have one; for MAS it is the live embroidery.
- **Scroll hijacking and smooth-scroll libraries.** Reveals are allowed again (Direction C removed them in 2026-07-03), but gated: nothing is hidden without JS, reduced motion shows everything, and native scroll only. Lenis was removed on 2026-10-04.
- **Weak photos shown naked.** Product photos are reframed in hoops, swatch cards and tags under one warm grade, in tight crops; never a full-bleed photo hero.
- **All-sans flatness.** The 2026-07-01 audit's finding; hence a light optical-sized serif for display, pushed bigger and more dramatic in Direction D.
- **Dead space and blank tiles.** Empty image rectangles and a full-viewport empty hero band read as broken; a category with no photo hangs as an empty linen hoop with a half-sewn ornament instead.
- **Small low-contrast grey text.** Secondary text uses real AA-checked tokens, never opacity dilution; gold is for dark grounds only.
- **Invented proof.** No made-up reviews, years in business, client names, prices, order counts or awards (the testimonials and stats strip were removed earlier for the same reason).
- **The dead systems.** The original cream/sage/blush look and "Thread Ledger" (Parchment, Pine Teal, Rust; Bricolage Grotesque and Work Sans) are history and must not return.
- **A dark mode.** A considered decision: there is no `.dark` CSS and no toggle. Dark sections (Midnight, Indigo) are part of the design and are fine.

**Reference sites and "must not look like" pairs (Proposed 2026-10-03, drafted by Claude on Nathan's delegation from repo evidence; edit if wrong.)**

- **Reference sites, for the monogram-and-craft side:** Mark & Graham (the audit cites its monogram hero as a proven pattern; `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`) and the heritage and luxury embroidery brands researched for the logo work: Leontine Linens, Matouk, Weezie and Courtland & Co. Borrow from them one muted ink, rationed script and place-name microtext (`docs/logo-concepts/README.md`). Mark & Graham is a pattern reference for the monogram-first hero, not a look to copy; Direction D goes further by letting the visitor stitch their own.
- **Must not look like, from the same research:** the mass-market monogram shops (Marleylilly, United Monograms, Initial Outfitters, South of Hampton), whose marks and storefronts read as catalogue retail (`docs/logo-concepts/README.md`). MAS is a quote-first, one-woman studio, so no cart-style "add to bag" cues.
- **Must not look like another Nixon Creative Studio client site:** no such pair is recorded anywhere in the repo or the vault note, so none is asserted. Working assumption: MAS keeps its own Heirloom Coast identity (linen, Midnight and indigo, claret, thread gold) and does not borrow another client's palette, type or signature feature (Reid's concept-room reveal, FBCM's praise-and-proclaim motifs, Stone Steps' 3D map). The only look it must never return to is its own: cream/sage/blush and Thread Ledger (see above).

## Design Principles

1. **A craft you can watch.** The standout feature is the Monogram Atelier: visitors type initials and see them stitched in real thread colours on real fabrics, then send that exact design to Mary Ann as a quote request (initials, style, thread, fabric and item carry through the link). It is labelled a preview; Mary Ann confirms lettering in her proof.
2. **The craft is the proof.** The monogram is shown stitched, not described, and the real photography of real work (70+ gallery items exist) is reframed so modest photos still look like a set. Persuasion from craft, clarity and delight, not made-up claims.
3. **One action.** "Request a Quote" is the single conversion and the primary button; claret is kept for it on light grounds.
4. **Price before payment, said plainly.** Starting prices and the no-charge-until-approved promise are stated directly (prices as honest, scannable hang tags).
5. **Survives Mary Ann's content.** Every layout takes any photo, headline length and section order; a missing photo or setting degrades to a sensible empty state or a short neutral fallback.
6. **Sanity first.** Copy and settings live in the Studio, not in code, including every label in the Atelier (`atelierSettings`).
7. **Ambition without cost to access or speed.** The headline paints without waiting for fonts or the canvas, the engine is lazy and runs in a worker, and the accessibility gate stays perfect.

## Accessibility & Inclusion

WCAG AA is the floor and a perfect Lighthouse accessibility score on every route is a CI gate. Contrast pairs are measured and asserted in `src/lib/theme-tokens.test.ts` (Ink on Linen 11.65:1, Indigo on Linen 8.16:1, gold script on indigo only at 44px and up). Playwright runs smoke, axe and reflow suites on chromium and WebKit iPhone. Every interactive element has a visible focus ring, tap targets are at least 44px, validation uses a token error set rather than a bare red, and `prefers-reduced-motion` is honoured throughout (a global reset with transitions of 0s, which WebKit needs). Direction D specifics: the embroidery canvas has a text alternative that tracks the design and its controls are real labelled form controls operable by keyboard; under reduced motion the engine shows the finished piece, the golden thread is fully drawn with no needle, and reveals show everything; the lightbox is a native dialog with a focus loop. A pause control for the looping marquee exists (WCAG 2.2.2); its labels are an open Sanity item in `docs/PENDING.md`. Detail: `docs/TESTING.md`.
