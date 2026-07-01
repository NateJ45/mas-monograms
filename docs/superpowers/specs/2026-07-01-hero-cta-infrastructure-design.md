# Hero & CTA Infrastructure Correction (Plan 3, Phase A)

> Design spec. Status: approved by Nate, 2026-07-01. First phase of "Plan 3" — the page-by-page
> redesign applying the Thread Ledger system (`docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`)
> across every route. Plan 3 was decomposed into phases rather than one mega-spec: this phase
> fixes shared hero/CTA infrastructure first; later phases redesign individual pages on top of it.

## Why this phase exists

A scoping survey of all 13 routes found that `Home` (`src/pages/index.astro`) and every shop
category page (`src/pages/[slug].astro`) hand-roll a duplicated inline hero block instead of using
the already-built `Hero.astro` + `HeroBackground.astro` components. That duplication carries a real
WCAG contrast bug: the inline hero's scrim gradient uses `from-accent/90 via-accent/40` — `accent`
resolves to Mustard Light (`#f0e6d2`, a *light* color) via the `@theme inline` override in
`globals.css` — as a darkening overlay meant to keep light cream hero text legible over a photo.
A light color used as a darkening scrim does the opposite of its job. `HeroBackground.astro` (which
nothing currently uses) already does this correctly with `bg-accent-dark` (`#1a1512`, genuinely
dark). Migrating onto the shared components fixes the bug as a side effect, not as a separate
design problem.

The shared components can't be adopted as-is, though: `Hero.astro` depends on `CtaLink.astro`, and
`CtaLink.astro` is unconverted leftover from the starter template this project began from — its
comments reference a different project's palette ("Bronze CTA pill," "Charcoal Dark," `#7A5D4C`),
and it maps internal links to routes that don't exist on this site (`/process`, `/services`,
`/faq`, `/contact`, `/journal`). Its "primary" variant renders `bg-primary-dark` (Pine Teal Dark),
not Rust CTA — wiring it up unfixed would introduce a *new* wrong-color button bug on top of fixing
the scrim. `Hero.astro` also carries an unused `scriptAccent` prop that renders headline text in a
`font-script` class, directly conflicting with CLAUDE.md's explicit "no script font" rule, plus a
`rotatingWords` word-cycling effect that reads as generic landing-page flourish rather than the
already-decided "tactile & craft-themed, used purposefully" motion direction.

## Scope

### 1. `CtaLink.astro` — rebuild in place

- **Route map**: replace the stale `TYPE_TO_PATH` (and the `journalEntry`/`page` slug-handling
  branches, which reference document types that don't exist in this project's schema) with the
  real 13 routes:
  ```ts
  const TYPE_TO_PATH: Record<string, string> = {
    homePage: '/',
    howItWorksPage: '/how-it-works',
    pricingPage: '/pricing',
    aboutPage: '/about',
    requestAQuotePage: '/request-a-quote',
    shopIndexPage: '/shop-by-item',
    styleGalleryPage: '/style-gallery',
    fontGuidePage: '/font-lettering-guide',
    threadChartPage: '/thread-color-chart',
    clearancePage: '/clearance',
    thankYouPage: '/thank-you',
  };
  ```
  `itemCategory` internal links resolve via its `slug` field directly (`/${slug}`), same pattern
  the removed `journalEntry`/`page` branches used — just pointed at the type that's actually real
  here.
- **Colors**: primary variant becomes `bg-[var(--color-rust-cta,#b8492a)] text-white
  hover:bg-[var(--color-rust-cta-hover,#9c3c20)]` (matching the pattern already used in
  `CtaBanner.astro`, `404.astro`, `clearance.astro`, `request-a-quote.astro`, and now
  `index.astro`/`[slug].astro` after the 2026-07-01 bug-fix commit). Secondary variant becomes
  `border border-primary text-link hover:bg-accent` for the light-surface case (unchanged — this
  one was already using real tokens correctly) and `border-white/70 text-white hover:bg-white/10`
  for `onDark` (also already correct). Only the primary variant's colors are wrong; leave the rest
  of the file's structure (the `onDark` toggle, the 44×44 tap target, the fallback href/label props)
  untouched.
- **Fallback href**: change `fallbackHref` default from `/contact` (doesn't exist) to
  `/request-a-quote` (the site's actual universal conversion fallback).

### 2. `Hero.astro` — remove forbidden/off-brand flourishes

- Delete the `scriptAccent` prop, the `splitScriptAccent` import/call, and the three-piece
  before/accent/after headline rendering branch. Headline always renders as plain text (or via the
  `rotatingWords` branch, which is also being removed — see next point) — no `font-script` class
  anywhere in this file afterward.
- Delete the `rotatingWords` prop, its regex-based first-word splitting, the rotating-word inline
  `<script>`, and the `data-rotating-word`/`data-rotating-words` markup branch.
- Net result: `Hero.astro`'s props shrink to `eyebrow`, `headline` (plain string, always rendered
  as-is), `headlineItalicSuffix` (new, see below), `subhead`, `backgroundImage`, `backgroundImages`,
  `primaryCta`, `secondaryCta`, `headingId`, `size`. The `_word_`-to-`<em>` subhead emphasis parsing
  stays (it's plain markdown emphasis, not a font/flourish concern).
- Add a new optional `headlineItalicSuffix?: string` prop: when present, render
  `<em class="italic">{headlineItalicSuffix}</em>` immediately after the headline text, exactly
  matching `index.astro`'s current `heroItalicWord` behavior (a real, live-editable Sanity field —
  `homePage.heroItalicWord`, schema at `studio/schemaTypes/homePage.ts:59` — not dead content, so it
  needs a real home in `Hero.astro` rather than being dropped). This is the only prop being *added*
  to the trimmed-down component; it's a straight port of existing behavior, not new functionality.
- Update the file's header comment to drop the stale "Cormorant Garamond" and "Contact, FAQ,
  Process" references (leftover from the starter template, inaccurate for this project).

### 3. Migrate `index.astro`'s hero to `<Hero />`

Replace the current inline `<section>` (lines ~30-79, the hand-rolled image hero with the
`.text-cream` page-scoped `<style>` override) with:

```astro
<Hero
  eyebrow={page?.heroEyebrow}
  headline={page?.heroHeadline ?? 'Custom Embroidery'}
  headlineItalicSuffix={page?.heroItalicWord}
  subhead={page?.heroSubhead}
  backgroundImage={page?.heroImage}
  primaryCta={{ label: page?.heroPrimaryCtaLabel, linkType: 'internal', internalLink: { _type: 'requestAQuotePage' } }}
  secondaryCta={{ label: page?.heroSecondaryCtaLabel, linkType: 'internal', internalLink: { _type: 'howItWorksPage' } }}
  headingId="hero-heading"
  size="tall"
/>
```

The exact prop wiring for `primaryCta`/`secondaryCta` needs to match whatever
`page.heroPrimaryCtaHref`/`heroSecondaryCtaHref` actually resolve to today (currently hardcoded
fallbacks to `/request-a-quote` and `/how-it-works` in the existing inline markup) — the
implementation task will confirm the exact Sanity field shape against `src/lib/queries.ts` and
preserve today's fallback behavior exactly, just routed through `CtaLink` instead of a raw `<a>`.
Delete the page-scoped `.text-cream`/`.text-cream\/80` `<style>` block entirely — no longer needed
once the hero uses `Hero.astro`'s token-based `text-bg`.

### 4. Migrate `[slug].astro`'s hero to `<Hero />`

Same pattern: replace the inline hero section (lines ~50-77) with `<Hero
backgroundImages={category.heroImages} eyebrow={category.eyebrow} headline={category.name}
subhead={category.description} primaryCta={{...}} headingId="category-heading" size="short" />`,
using `category.heroImages` (the array Plan 2 populated) directly as `backgroundImages` — this
also means category pages with 2+ hero images now get the cross-fading slideshow treatment for
free, which they don't have today. Delete the matching `.text-cream` page-scoped `<style>` block
here too.

## What this phase does NOT do

- No site-wide sweep of remaining legacy Tailwind tokens (`bg-primary`, `bg-tertiary`, `bg-muted`,
  etc.) outside the two hero sections being migrated — those get cleaned up page-by-page as later
  phases redesign each page's full layout, not duplicated here.
- No redesign of hero *content* or copy — same eyebrow/headline/subhead/CTA data, same visual
  hierarchy, just correctly wired through the shared, token-correct components.
- No changes to `[slug].astro`'s "additional hero images" grid or masonry gallery sections below the
  hero — those are later-phase content/layout concerns, not infrastructure.
- No new motion beyond what `Hero.astro`/`HeroBackground.astro` already implement (slideshow,
  scroll cue, entry stagger) — this phase applies existing motion consistently, it doesn't add any.

## Testing

- `CtaLink.astro`'s route map and color logic have no existing unit tests (it's an `.astro`
  component, not a pure function) — verification is visual: build the site, inspect computed
  styles on rendered CTAs (background-color, resolved href) across a sample of pages that use each
  `internalLink._type`, same technique already used in this session to verify the `bg-blush` fix.
- Full `npm test` run to confirm no regressions to the existing 93 unit tests (none of which
  currently touch these files, but this is a repo convention check before every commit).
- `npm run build:full` to confirm both migrated pages render without errors and the hero images
  (including the slideshow path on category pages with 2+ hero images) display correctly.
- Manual/scripted contrast check: confirm the scrim actually darkens (not lightens) over both a
  light-toned and dark-toned sample hero photo, since this is the concrete bug this phase exists to
  fix.
