# MAS Monograms — Redesign Audit & Prioritized Recommendations

> Grounded audit (2026-07-01) commissioned by Nate. Two goals are the scoreboard for every item:
> **(1) convert visitors into quote-order customers, (2) showcase the craft like a portfolio worth
> trusting.** Phases 1–3 (inventory, competitive research, page-by-page audit) are summarized in the
> conversation; this doc is Phase 4 — the prioritized plan + brand directions — for sign-off BEFORE
> any implementation. Nothing here is built yet.

## The core reframe

The site's bones are good. The problems are concentrated, not systemic: the **home page**, the
**style-gallery filter**, and two cross-cutting issues (**small-text contrast** + **all-sans
flatness**). Category pages, the quote form, shop-by-item, how-it-works, pricing, and 404 are already
largely strong. Several complaints ("dead space", "dangling headline") are **live code bugs** with
clean fixes, not matters of taste. The real craft photography (70+ gallery items, category cards)
already exists and is good — it's just under-used at the marquee moments.

---

## Quick wins — high impact, low effort

| # | Fix | Why | Touches | Goal |
|---|-----|-----|---------|------|
| 1 | **Fix the dangling hero headline** — pass `heroItalicWord` through the text (no-image) hero branch so it stops ending on a comma | It's a live bug: "Custom monogramming," renders broken on the most-seen page | `Hero.astro`, `SectionHeading.astro` | trust |
| 2 | **Right-size the empty home hero** — stop rendering a full-viewport (100svh) empty band when no image; drop to a generous `short` band | The #1 "dead space" complaint; instant relief | `Hero.astro` / `index.astro` | first impression |
| 3 | **Fix invisible stat suffixes** — "+"/"%" render in Mustard at 1.98:1 (near-invisible); use Pine Teal | Live a11y bug on a trust element | `StatsCounter.tsx` | trust / a11y |
| 4 | **Kill empty image tiles** — Popular Combinations → typographic "recipe" cards (font + thread chip); give "Bring Your Own Item" a real tile; collapse About to one column when no portrait; **move Mary Ann's signature line out of the photo-only block so it always renders** | Blank rectangles read as broken; the signed maker name (a core trust signal) is currently invisible | `index.astro`, `about.astro` | both |
| 5 | **Sitewide small-text contrast** — add real `secondary`/`tertiary` text tokens (AA-verified) and replace every `foreground/50–70` opacity dim | Most-repeated defect: ~10 instances fail WCAG AA (DMC numbers 2.9:1, form help 3.0:1, card copy 3.75:1) | `globals.css`, `tokens.css` + usages | a11y |
| 6 | **Quote-form completion** — wire the Sanity fields the template references but the query never selects (turnaround callout, required-field note, trust items); surface turnaround next to Submit; add `aria-invalid`/`aria-describedby`, focus first error; darken error red | The form silently drops editor content and has no turnaround reassurance at the point of decision | `request-a-quote.astro`, schema, `queries.ts` | conversion / a11y |
| 7 | **Defuse the accent-trap** — `--color-accent` is remapped light by `@theme inline`; make it safe so it can't cause a third contrast regression | Prevents a recurring class of bug | `globals.css` | prevents regressions |
| 8 | **Empty-state CTAs** — Clearance empty state and Thank-You get onward actions instead of dead ends | Recover conversion momentum | `clearance.astro`, `thank-you.astro` | conversion |
| 9 | **Font-guide placeholder + reference contrast** — the "Aa" tile at 1.5:1 reads as broken; make it a legible "specimen coming soon"; bump DMC/`bestFor` contrast | Reference pages look finished | `font-lettering-guide.astro`, `thread-color-chart.astro` | a11y / trust |

**Content-only (Mary Ann can edit in Sanity, no code):** replace placeholder testimonial names
("Happy Customer") with real first-name/last-initial + town; publish a turnaround line; real email +
social links; import remaining font specimen photos. These are the user-editable half of the split.

---

## Bigger moves — real redesign, higher effort

| Move | Why | Touches | Goal | Effort |
|------|-----|---------|------|--------|
| **A. Rebuild "Try It Out" into a live monogram preview** — render the actual initials, in the chosen font, recolored to the chosen thread hex, on an item swatch, updating live → CTA carries item+font+thread into the quote form as pre-filled params | The single highest-leverage conversion change; beats every competitor (none do live preview well); today it never applies the chosen color or shows a monogram | `ComboPreview.tsx`, `request-a-quote.astro` (accept params), a small preview renderer | conversion | med |
| **B. Grouped filter taxonomy (Style Gallery)** — replace the 71-pill flat wall with ~4–6 Sanity-editable groups (Item · Theme/Occasion · Technique · Recipient), ordered by count, meta-tags removed, `applique/appliqué` merged, long tails behind "+ more" | Worst UX on the site; 43 of 71 pills filter to one photo | `styleGalleryPage` schema, `style-gallery.astro`, seed data | browse / conversion | med |
| **C. Monogram-variety home hero** — build the hero from the real gallery/category photos that already exist (a lineup/collage), so the empty parchment void becomes the strongest first impression | Solves the empty hero without new photography; mirrors Mark & Graham's proven monogram hero | `Hero.astro`, `index.astro` | first impression / craft | med |
| **D. Home process section** — switch the preview variant from a tall left-crammed list to a horizontal 4-across row | Fixes the worst desktop dead-space offender | `ProcessStep.astro`, `index.astro` | dead space | low–med |
| **E. Photo → quote bridges** — "Request something like this" deep-links from gallery/category photos; surface category starting price on shop cards | Turns inspiration into orders; competitors surface personalize/price on the card | multiple pages | conversion | med |
| **F. Adopt a brand direction** — type + color system (see below) | Resolves the all-sans flatness + the palette failures in one coherent system | `globals.css`, `tokens.css`, fontsource imports, optional `Logo.astro` | both | varies by direction |
| **G. About depth** — add a "recent work from the studio" strip from existing gallery photos; differentiate shop-by-item from category pages | Fills the most human page with real proof, no new photos | `about.astro`, `shop-by-item.astro` | trust | low–med |

---

## Brand directions (choose one)

All three independent explorations converged on **Fraunces** (a warm, high-contrast variable display
serif) for headings — strong evidence it's the right heading face and that the all-sans rule was the
problem. The real choice is **palette + posture**. Every palette below is WCAG-checked and fixes the
current contrast failures; all keep the needle-and-thread logo.

### A — Refined Thread Ledger  · effort: LOW
- **Type:** Fraunces headings + Work Sans body (unchanged) + Parisienne script for the monogram artifact only.
- **Color:** keep Parchment/Ink/Pine-Teal/Rust; demote Mustard to decorative-only; add two AA text tokens (`#574E43`, `#726858`).
- **Posture:** warm, homespun, quietly premium. Evolves what exists.
- **Best if:** you want the fastest ship and to keep the current identity, just fixed and given one spark.

### B — Heirloom Coast  · effort: HIGH
- **Type:** Fraunces headings + Mulish body + Petemoss/Cormorant engraved script for the monogram artifact.
- **Color:** a full rebrand — Linen `#F4EEE3`, Heirloom Ink `#26312E`, Heritage Indigo `#28486B`, Antique Brass `#835A24` (text) / `#B98A3E` (decorative), Madder Claret `#8C3A2E` CTA (white 7.6:1).
- **Posture:** editorial, coastal-Southern, heirloom-catalog. Frames mixed-quality photos as a curated collection via brass hairline rules.
- **Best if:** you want to look like fine monogrammed linens — the biggest upside, the biggest change.

### C — Stitch & Studio  · effort: MEDIUM
- **Type:** Fraunces headings + Work Sans body + Fraunces-at-display for the monogram artifact (reuses the heading face).
- **Color:** cooler, fresher — Shell `#faf7f2`, Ink `#22201d`, Clay Teal `#17564a`, Terracotta `#b8492a` CTA, Saffron `#e0a53c` (decorative-only, the fixed-role old Mustard), taupe/stone text tokens.
- **Posture:** contemporary maker-studio, editorial whitespace, lookbook rhythm. Reads current, shareable.
- **Best if:** you want to feel like a design-forward small brand a younger gift-buyer trusts.

**Recommendation:** **A (Refined Thread Ledger)** if the priority is shipping conversion/a11y fixes
fast with low risk; **C (Stitch & Studio)** if you want a genuine refresh that still reuses most of
the system. B is the boldest but is a full rebrand best done deliberately, not under time pressure.

---

## Recommended sequence

1. **Quick wins first** (items 1–9 + content) — they fix live bugs, a11y, and the worst dead space
   with low risk and no brand decision required. Ship in reviewable chunks.
2. **Brand direction** — once chosen, apply the type/color system (token-layer change, so it composes
   with the quick-win contrast tokens rather than fighting them).
3. **Bigger moves A–E, G** — Try-It-Out rebuild and the filter taxonomy are the two highest-leverage,
   sequence them first among these.

Implementation will go in reviewable chunks with a clear split between what Nate edits (content) and
what is code, non-obvious things commented, and no changes to the cart/product-data/forms behavior.
