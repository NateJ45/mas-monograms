# Remaining Pages: Hoop-Ring Frames + Token Consolidation (Plan 3, Phase D)

> Design spec. Status: approved under delegated authority ("do all after compacting," 2026-07-01).
> Covers the 9 routes Plan 3 hasn't touched yet: Pricing, About, Request a Quote, Style Gallery, Font
> Guide, Thread Color Chart, Clearance, Thank You, 404.

## Decisions made without a check-in, and why

- **Scoped conservatively: consistency polish, not new content or layout restructuring.** Unlike
  Home (new components) or category pages (a real "thin page" problem to solve), a survey of these
  9 pages found no unused schema fields to surface, no dead-but-correct components to wire up, and
  no confirmed "genuinely broken" page. The honest opportunity here is narrower: apply two
  already-established, already-proven patterns (hoop-ring photo frames, token-name consolidation)
  wherever they genuinely apply, and stop there — inventing new sections/content for these 9 pages
  without any concrete brainstorm behind them would be scope creep, not delegated authority.
- **Hoop-ring frames: 3 clear candidates, not forced onto everything with a photo.** Style Gallery's
  masonry grid, Font Guide's font-preview grid, and Clearance's product grid are genuine photo GRIDS
  (multiple repeated cards), the same shape as Home's category grid / gallery preview and category
  pages' galleries — direct, mechanical application of the established `p-1 bg-secondary rounded-xl`
  + `rounded-[calc(var(--radius-xl)-0.25rem)]` pattern. Three other spots are deliberately EXCLUDED:
  - About/Request-a-Quote/Thank-You's single editorial portrait photos — same reasoning already
    established in Phase B1's spec for Home's About/Maker photo (a one-off large photo in a split
    layout doesn't benefit from a "repeated grid rhythm" treatment the way a grid of many photos
    does).
  - Thread Color Chart's 48px circular swatches — the hoop-ring pattern's square `rounded-xl` outer
    frame doesn't map cleanly onto a `rounded-full` circle; forcing it would look wrong, not better.
- **Token consolidation: verified as a truly zero-risk, purely cosmetic-naming change.** Confirmed
  directly in `globals.css`: `--color-tertiary`, `--muted` (feeding `bg-muted`), and
  `--color-bg-soft` (feeding `bg-bg-soft`) are ALL exactly `#f0e6d2` (Mustard Light) in every normal
  screen context — three different class names for the identical color. (The one `@media print`
  override of `--muted: white` only applies to print stylesheets, irrelevant here.) Since renaming
  any of these three classes to `bg-tertiary` produces the exact same rendered color, this is safe
  to apply uniformly across every occurrence found — including ones in "functional" contexts (a
  disabled button's background, a hover state) that might otherwise warrant more caution, since the
  color itself never changes, only which of three synonymous class names refers to it.
- **`bg-bg-soft` is a real, intentional token, not a typo** — confirmed via direct schema check
  (`--color-bg-soft: #f0e6d2` exists in the static `@theme` block, described as "Mustard-tinted soft
  alternating surface"). Still consolidated to `bg-tertiary` for the same reason as `bg-muted` — one
  canonical name reduces confusion for anyone reading this codebase later, per the same rationale
  Phase B1 already established.

## Scope

### 1. Hoop-ring frames — 3 files

- **`src/pages/style-gallery.astro`**: masonry grid item wrapper changes from
  `class="gallery-item break-inside-avoid rounded-xl overflow-hidden border border-border bg-background"`
  to `class="gallery-item break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary"` with a new
  inner `<div class="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">` wrapping the
  `SanityImage` — same exact pattern as Home's gallery preview and category pages' galleries. The
  `gallery-item` class (used by the client-side filter script) and `id="gallery-grid"` on the parent
  stay untouched — this only changes the visual frame, not the filtering behavior.
- **`src/pages/font-lettering-guide.astro`**: font card wrapper changes from
  `class="group rounded-xl border border-border bg-background overflow-hidden hover:shadow-sm transition-shadow"`
  to `class="group rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-sm transition-shadow"`,
  with the existing `aspect-square bg-tertiary overflow-hidden` inner image wrapper gaining the
  `rounded-[calc(var(--radius-xl)-0.25rem)]` radius (replacing its implicit square corners so it
  nests correctly inside the new outer frame). The "Aa" placeholder fallback (`aspect-square
  bg-tertiary flex items-center justify-center`, used when a font has no specimen photo) keeps its
  own distinct treatment — no frame around a placeholder that isn't a real photo.
- **`src/pages/clearance.astro`**: product image wrapper changes from `class="aspect-[4/3] overflow-hidden relative"`
  to include the same `p-1 bg-secondary` + inner radius treatment. The sold-out overlay badge
  (`absolute inset-0 bg-background/50 flex items-center justify-center`, containing the "Sold Out"
  pill) needs to move to sit on the INNER wrapper (the actual image area) rather than the new outer
  frame, so the dimming overlay covers the photo, not the mustard frame itself. The "No photo"
  fallback (`aspect-[4/3] bg-tertiary flex items-center justify-center`) keeps its own distinct
  treatment, same reasoning as Font Guide's "Aa" fallback.

### 2. Token consolidation — `bg-muted`/`bg-bg-soft` → `bg-tertiary`, 8 files

Every occurrence of `bg-muted` or `bg-bg-soft` becomes `bg-tertiary`: `pricing.astro` (×2, Add-ons +
FAQ section wrappers), `about.astro` (×2, Values section + testimonial figure background),
`font-lettering-guide.astro` (×1, customFontNote callout — plus whatever new occurrences the
hoop-ring change above doesn't touch), `thread-color-chart.astro` (×1 `bg-muted` matchingNote
callout, ×1 `bg-bg-soft` customColorNote callout), `clearance.astro` (×3: paymentNote box, pickupNote
box, disabled Sold-Out button background), `404.astro` (×1, secondary CTA hover state). Zero visual
change in every case — confirmed same underlying hex.

## What this phase does NOT do

- No new sections, no new schema fields, no new content on any of these 9 pages.
- No hoop-ring treatment on single editorial portrait photos (About, Request a Quote, Thank You) or
  Thread Color Chart's circular swatches — deliberately excluded, not an oversight.
- No changes to Request a Quote's form logic, validation script, or Turnstile integration — that
  page's only touch here would be a token consolidation if any `bg-muted` existed there, and the
  survey found none.
- No changes to Style Gallery's client-side filter script logic — only the visual frame around each
  grid item changes.

## Testing

- Visual: build, load Style Gallery, Font Guide, and Clearance via local preview, confirm hoop-ring
  frames render on their photo grids (and NOT on Font Guide's "Aa"/Clearance's "No photo" fallback
  tiles), confirm Clearance's sold-out overlay still correctly dims the photo (not the frame).
- Confirm zero visual difference on the 8 files getting only the token rename (build before/after,
  spot-check computed background-color on each touched element — should be identical `#f0e6d2`
  before and after).
- `npm test` (93 existing tests, unaffected).
- `npm run build:full` — no errors, all 21 routes prerender.
