# Product

Strategic context for design work on the MAS Monograms site. Derived from the repo's own docs and copy (`docs/01-content-architecture.md`, `docs/02-design-system.md`, `docs/03-pricing.md`, the 2026-07-01 redesign audit) and the vault note on 2026-10-03. Sections tagged "Proposed" below are drafts written from repo evidence on Nathan's delegation, not confirmed by Nathan or Mary Ann. Treat them as working assumptions and replace them with what Mary Ann actually sees when you can. Visual decisions live in `DESIGN.md`.

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

A hand-stitched heirloom shop on the South Carolina coast ("Heirloom Coast"), wearing the "Direction C, The Sampler" treatment: warm linen paper, deep ink, a heritage indigo that drenches whole bands, claret kept for the one action that matters, and a gold script flourish that nods at monogram craft. The guiding line is "expensive through restraint": space and editing do the work, not effects. Voice (from the seed copy): warm, plain and specific, written as Mary Ann ("we stitch everything by hand, locally"), with a signed maker's name as a trust signal. House style: no em-dashes in copy (commas, colons or periods instead).

## Anti-references

Recorded decisions only:

- **Template tells.** Scroll-triggered reveals and grid-stagger entrances were removed on 2026-07-03 because no premium reference site animates content in on scroll; floating or Ken-Burns collage motion was retired for the same reason.
- **All-sans flatness.** The 2026-07-01 audit's finding; hence a light optical-sized serif for display.
- **Dead space and blank tiles.** Empty image rectangles and a full-viewport empty hero band read as broken.
- **Near-black slabs and small low-contrast grey text.** The `#1A1512` band was retired; secondary text uses real AA-checked tokens, never opacity dilution.
- **Brass photo frames and caption bars.** Retired; photography sits frameless.
- **The dead systems.** The original cream/sage/blush look and "Thread Ledger" (Parchment, Pine Teal, Rust; Bricolage Grotesque and Work Sans) are history and must not return.
- **A dark mode.** A considered decision: there is no `.dark` CSS and no toggle.

**Reference sites and "must not look like" pairs (Proposed 2026-10-03, drafted by Claude on Nathan's delegation from repo evidence; edit if wrong.)**

- **Reference sites, for the monogram-and-craft side:** Mark & Graham (the audit cites its monogram hero as a proven pattern; `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`) and the heritage and luxury embroidery brands researched for the logo work: Leontine Linens, Matouk, Weezie and Courtland & Co. Borrow from them restraint, one muted ink, rationed script and place-name microtext (`docs/logo-concepts/README.md`). Mark & Graham is a pattern reference for the hero, not a look to copy.
- **Must not look like, from the same research:** the mass-market monogram shops (Marleylilly, United Monograms, Initial Outfitters, South of Hampton), whose marks and storefronts read as catalogue retail (`docs/logo-concepts/README.md`). MAS is a quote-first, one-woman studio, so no cart-style "add to bag" cues.
- **Must not look like another Nixon Creative Studio client site:** no such pair is recorded anywhere in the repo or the vault note, so none is asserted. Working assumption: MAS keeps its own Sampler identity (linen, indigo, claret, gold script) and does not borrow another client's palette or type. The only look it must never return to is its own: cream/sage/blush and Thread Ledger (see above).

## Design Principles

1. **Expensive through restraint.** Space, editing and one committed accent do the work; effects do not.
2. **The craft is the proof.** Real photography of real work leads (70+ gallery items exist); the monogram is shown as stitched, not described.
3. **One action.** "Request a Quote" is the single conversion and the only place claret appears.
4. **Price before payment, said plainly.** Starting prices and the no-charge-until-approved promise are stated directly.
5. **Survives Mary Ann's content.** Every layout takes any photo, headline length and section order.
6. **Sanity first.** Copy and settings live in the Studio, not in code.

## Accessibility & Inclusion

WCAG AA is the floor and a perfect Lighthouse accessibility score on every route is a CI gate. Contrast pairs are measured and asserted in `src/lib/theme-tokens.test.ts` (Ink on Linen 11.65:1, Indigo on Linen 8.16:1, gold script on indigo only at 44px and up). Playwright runs smoke, axe and reflow suites on chromium and WebKit iPhone. Every interactive element has a visible focus ring, tap targets are at least 44px, validation uses a token error set rather than a bare red, and `prefers-reduced-motion` is honoured throughout (a global reset with transitions of 0s, which WebKit needs). Detail: `docs/TESTING.md`.
