# "Build Your Own" Combination Preview Teaser (Plan 3, Phase B4)

> Design spec. Status: approved under delegated authority ("carry out best judgement... no need to
> wait for me to confirm," 2026-07-01). Fourth and final new-component sub-phase of Plan 3 Phase B,
> following B1 (hoop-ring frames), B2 (stats strip), B3 (process timeline) — all shipped.

## Decisions made without a check-in, and why

- **No existing component to reuse this time.** Unlike B1-B3 (which each found a pre-existing but
  unwired component from the starter template), a search for `*config*`/`*builder*`/`*preview*`/
  `*swatch*` under `src/components/` found nothing. This phase genuinely builds new UI, so the scope
  is kept deliberately small: a picker across 3 real data dimensions (item category, font, thread
  color) with a live-updating summary panel, no cart/pricing/persistence logic, no attempt to
  composite a real combined product photo (that would require actual photo compositing
  infrastructure this project doesn't have — the original brainstorm explicitly called this a
  "non-functional visual preview," and this spec holds to that boundary).
- **Uses only real, already-imported Sanity data — no fabricated options.** Item categories, font
  previews, and thread colors are the exact same real records already powering the Shop by Item grid,
  Font Guide, and Thread Color Chart pages. No new content is invented for this feature.
- **Font options limited to the 8 with real photographed previews.** 10 of 18 `font` documents have
  no `previewImage` (documented gap from Plan 2 — no specimen photo exists for those names).
  Filtering to `previewImage?.asset` truthy avoids showing a broken/placeholder image in an
  interactive picker context, where a missing preview would read as more obviously broken than in
  the Font Guide's grid (which already handles the gap with an "Aa" placeholder tile appropriate for
  a full catalog page, not a quick teaser widget).
- **Image URLs pre-built server-side, not fetched client-side.** The picker is a React island
  (`client:visible`, matching the existing `StatsCounter.tsx` pattern) — Astro components
  (`SanityImage.astro`) can't render inside React, so `index.astro` pre-builds each font's preview
  image URL via the same `urlFor(...).width(...).auto('format').url()` helper `SanityImage.astro`
  itself uses (`@/lib/sanity`), passing plain string URLs as props. The React component never talks
  to Sanity directly.

## Scope

### 1. New component: `src/components/ComboPreview.tsx`

A React island with local `useState` for 3 selections (category index, font index, thread index,
each defaulting to `0` so a combination is visible immediately without requiring a click first).

Props:
```ts
interface ComboPreviewProps {
  categories: { name: string; slug: string }[];       // up to 8, real itemCategory data
  fonts: { name: string; previewUrl: string; alt: string }[]; // up to 6, only ones with a real photo
  threadColors: { name: string; hex: string }[];       // up to 8, a representative spread
}
```

Layout: three rows of selectable pill/swatch buttons (Item, Font, Thread Color — labeled), each
showing the currently-selected item with a visible active state (border/ring in `--color-primary`).
Below the three rows, a summary panel shows: the selected font's preview photo (framed with the same
hoop-ring treatment as Phase B1, `p-1 bg-secondary` + inset radius, for visual consistency with the
rest of the site), a color swatch dot for the selected thread, and a text line: `"{category name} ·
{font name} · {thread name}"`. A CTA button below the panel: `"Get a Quote for This Combination"`
linking to `/request-a-quote` (plain link, no query-param pre-fill — out of scope, see below).

Accessibility: each picker row is a `<fieldset>`/`<legend>` group of `<button role="radio"
aria-checked>` elements (or native radio inputs styled as pills — implementation's choice, whichever
is simpler to get right), so selection state is announced correctly to screen readers. All buttons
meet the existing 44px minimum tap target convention.

### 2. Wrapper: `src/components/ComboPreviewSection.astro`

Thin Astro wrapper (mirrors `StatsRow.astro`'s role for `StatsCounter.tsx`): takes the same 3 props,
renders a `<section>` with an eyebrow/heading (hardcoded copy is fine here — this is a UI widget
label, not page content requiring Sanity editability, matching how `StatsRow.astro`'s own `aria-label`
"Studio stats" is hardcoded rather than Sanity-driven), then `<ComboPreview ... client:visible />`.

### 3. Wire into `index.astro`

Placed after the Category grid section, before the About/Maker section — a natural "you've seen the
categories, now play with a combination" beat.

`index.astro`'s frontmatter needs to fetch and shape the 3 data arrays:
- `categories` — already fetched (`getAllItemCategories()`) for the existing category grid; reuse
  the same `categories` variable, mapped to `{name, slug}`.
- `fonts` — new fetch via `getAllFonts()`, filtered to `f.previewImage?.asset` truthy, sliced to 6,
  mapped to `{name, previewUrl: urlFor(f.previewImage).width(240).auto('format').url(), alt: f.previewImage.alt ?? f.name}`.
- `threadColors` — new fetch via `getAllThreadColors()`, sliced to a representative spread (e.g. take
  every ~5th entry across the sorted-by-family list to get variety across families rather than 8
  colors from the same family), mapped to `{name, hex: c.hexColor}`.

## What this phase does NOT do

- No real composited "your item with your font and thread" photo — text + real font/color swatches
  only, as scoped from the start.
- No query-param pre-fill into the Request a Quote form (e.g. `/request-a-quote?category=...`) — the
  form doesn't currently read URL params, and wiring that up is a separate, larger change to a
  different page not in this phase's scope. The CTA is a plain link to `/request-a-quote`.
- No persistence of the user's selection (e.g. carrying it into the quote form via
  localStorage/sessionStorage) — same reasoning, explicitly out of scope for a "lightweight, non-
  functional" teaser.
- No changes to the Popular Combinations section (a different, already-existing, curated-by-Mary-Ann
  content block) — this is a distinct, adjacent feature, not a replacement.

## Testing

- Visual: build, load Home via local preview server, confirm the picker renders with a sensible
  default combination visible, clicking each row's buttons updates the summary panel (font photo,
  color swatch, text line) accordingly, the CTA links to `/request-a-quote`.
- Accessibility: confirm each picker row's buttons expose selection state via `aria-checked` (or
  equivalent), confirm keyboard operability (Tab between rows, Enter/Space to select).
- `npm test` (93 existing tests, unaffected — this phase's new logic is a React island without pure
  functions warranting new unit tests; visual/interaction testing covers it).
- `npm run build:full` — no errors, Home prerenders with the new section, font preview URLs resolve
  to real Sanity CDN URLs (not broken/404).
