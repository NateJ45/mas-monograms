# Category Page Redesign (Plan 3, Phase C)

> Design spec. Status: approved under delegated authority ("carry out best judgement... no need to
> wait for me to confirm," then "do all after compacting," 2026-07-01). Addresses the honest gap
> flagged at the end of Phase B: the 7 photographable category pages (`src/pages/[slug].astro`)
> only received B1's hoop-ring frames and a masonry-column fix — no equivalent "deeper redesign"
> pass like Home got.

## Decisions made without a check-in, and why

- **No new Sanity schema fields, no fabricated content.** Unlike Home (which had unused schema
  fields and unwired components to surface), `itemCategory`'s schema is fully utilized already —
  every field defined is already queried and rendered. Adding genuinely new per-category content
  (FAQ, pricing hints, "best for" suggestions) would require either new schema fields Mary Ann has
  to fill in for 8 categories, or fabricating claims about what's "popular"/"recommended" per item —
  both out of bounds given this session's established content-integrity rule (real, sourced content
  only). This phase instead finds real value using data that ALREADY exists, surfaced differently.
- **Real, verified problem to solve: some category pages are genuinely thin.** Queried the live
  dataset directly: `bring-your-own-item` has 0 related `galleryItem` documents (its Gallery section
  never renders at all — that page is just Hero → Trust bar → CTA banner today), and `hats-caps` has
  only 2. This isn't a hypothetical concern; it's confirmed live.
- **Fix: a real, reusable "Explore Other Items" cross-sell section.** Every category page already
  fetches `getAllItemCategories()`'s sibling data through `getSiteSettings`/nav context, but not for
  this purpose — this phase fetches the full category list per page (same query already used
  elsewhere, e.g. `index.astro`'s category grid) and renders 3 OTHER categories (excluding the
  current one) using the exact same hoop-ring-framed card component pattern established in Phase B1.
  This fills out thin pages with genuinely useful navigation (helping visitors who came for one item
  discover others Mary Ann makes) using zero fabricated content — every category shown is real, and
  the card design already exists and is proven.
- **Visual rhythm fix, not new content: background band alternation.** Today's page is Hero → Trust
  (Pine Teal band) → Gallery (plain) → CTA (dark) — visually flat where Home has alternating
  parchment/mustard bands establishing rhythm. Adding the Cross-sell section as a `bg-tertiary` band
  between Gallery and CTA gives the page the same alternating rhythm Home has, at zero contract with
  Home's own alternation (Home ends its own sequence on `bg-tertiary` for Gallery Preview, so a
  fresh `bg-tertiary` band on a DIFFERENT page doesn't create the "two adjacent same-color bands"
  problem the B4 review caught — that was specifically about two sections on the SAME page).

## Scope

### 1. New shared component: `src/components/CategoryCard.astro`

Extracts Home's category-grid card markup (hoop-ring frame, image, name label) into a standalone,
reusable component — DRYing up what's currently duplicated inline in `index.astro`'s Category Grid
section, and giving the new Cross-sell section on `[slug].astro` the exact same visual treatment
without copy-pasting markup a second time.

```astro
---
import SanityImage from '@/components/SanityImage.astro';

interface Props {
  name: string;
  slug: string;
  cardImage?: { asset?: { _ref?: string; _id?: string }; alt?: string; hotspot?: any; crop?: any } | null;
}
const { name, slug, cardImage } = Astro.props as Props;
---
<a
  href={`/${slug}`}
  class="group block rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-lg transition-shadow"
>
  {cardImage?.asset ? (
    <div class="aspect-square overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
      <SanityImage
        source={cardImage}
        width={400}
        height={400}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  ) : (
    <div class="aspect-square bg-tertiary" />
  )}
  <div class="p-s text-center">
    <p class="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
      {name}
    </p>
  </div>
</a>
```

`index.astro`'s Category Grid section is refactored to use `<CategoryCard>` instead of its inline
markup (identical visual output, confirmed by using the exact same class strings already live) —
this is a pure extraction, not a redesign of Home's grid.

### 2. New section on `[slug].astro`: "Explore Other Items"

Fetches `getAllItemCategories()` (already used elsewhere in the codebase, same function), filters
out the current category, takes up to 3 others (prioritizing ones with the most related gallery
items, so the cross-sell links lean toward categories with more content to show — using real
`displayOrder`/count data, not arbitrary choice), renders each via `<CategoryCard>` in a
`bg-tertiary` band between the Gallery section and the `CtaBanner`.

### 3. Graceful empty-gallery state

For `bring-your-own-item` (0 gallery items) and any future category with none, the current code
simply omits the Gallery section entirely (`{relatedGallery.length > 0 && (...)}`) — this stays
as-is (an honest "we don't have photos of literally anything you'd bring" is correct for BYO
specifically, better than forcing unrelated photos in). The Cross-sell section directly below fills
the resulting gap with real content instead of leaving a bare Hero→Trust→CTA page.

## What this phase does NOT do

- No new Sanity schema fields or content requiring Mary Ann's input.
- No per-category FAQ, pricing hints, or "recommended for" claims — no real data exists to source
  these honestly.
- No change to the Trust Items bar's visual treatment (flat Pine Teal band) — that's a separate,
  smaller polish question not tied to the "thin page" problem this phase actually solves.
- No changes to `index.astro`'s Category Grid *content/order* — only its markup is extracted into
  the new shared component, with byte-identical rendered output.

## Testing

- Visual: build, load a category page with a full gallery (`/tote-bags`), one with a thin gallery
  (`/hats-caps`), and the zero-gallery one (`/bring-your-own-item`) via local preview. Confirm the
  Cross-sell section renders on all three, shows real other-category cards with the hoop-ring frame,
  excludes the current category, and that `/bring-your-own-item` no longer feels like a bare
  3-section page.
- Confirm `index.astro`'s Category Grid renders identically before/after the `CategoryCard`
  extraction (byte-for-byte class comparison).
- `npm test` (93 existing tests, unaffected).
- `npm run build:full` — no errors, all 21 routes prerender, including all 8 category routes.
