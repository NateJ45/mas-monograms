# 02: Design System

> **Status: current as of 2026-10-04.** The live system is **"Heirloom Coast"** (rebranded 2026-07-01)
> wearing **Direction D, "The Atelier"** (2026-10-04), which replaced Direction C, "The Sampler"
> (2026-07-03). Tokens live in `src/styles/globals.css` (Tailwind v4 `@theme` block; there is no
> `tokens.css`). Brief and hard rules: `docs/superpowers/specs/2026-10-04-atelier-direction.md`.
> Earlier rationale and contrast math: `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`.
>
> Dead systems, never current: the original cream/sage/blush, and "Thread Ledger"
> (Parchment/Pine-Teal/Rust, Bricolage Grotesque + Work Sans).

The feel: an embroidery atelier. Deep Midnight sections alternate with linen and paper that carry a
real weave; huge, light Fraunces type with one italic swash word per headline; a gold thread sewn
down the page as you scroll; photos stretched in wooden hoops; prices on hang tags; running stitches
for every rule. Persuasion comes from craft and clarity, never from invented proof.

---

## Color palette

### Heirloom Coast (unchanged)

| Token              | Hex       | Use                                                                  |
| ------------------ | --------- | -------------------------------------------------------------------- |
| Linen              | `#F4EEE3` | Default page background, `.surface-linen`                            |
| Paper              | `#FBF8F1` | Cards, `.surface-paper`, the primary button on a dark ground         |
| Sage Band          | `#E4E2D3` | `.surface-sage` alternating band                                     |
| Heirloom Ink       | `#26312E` | Default text and headings                                            |
| Heritage Indigo    | `#28486B` | Links, the focus ring on light, `.surface-indigo`                    |
| Indigo Deep        | `#1C3550` | Link hover                                                           |
| Claret (CTA)       | `#8C3A2E` | The primary button on light; `.swash` on light; nav stitch underline |
| Claret Deep        | `#722C22` | The primary button's hover/focus fill                                |
| Brass (text)       | `#835A24` | `.eyebrow` and small brass text on light (AA on Linen, Sage, Paper)  |
| Brass (decorative) | `#B98A3E` | Running stitches on light grounds ONLY (never text)                  |
| Gold (script)      | `#D9B15F` | Script kicker on dark                                                |
| Secondary Taupe    | `#5A5148` | Secondary text                                                       |
| Tertiary           | `#67614F` | Captions                                                             |

### Direction D additions

| Token                     | Hex       | Use                                                                         |
| ------------------------- | --------- | --------------------------------------------------------------------------- |
| `--color-midnight`        | `#0F1B2D` | The drench: dark sections, mobile menu, footer, BackToTop, theme-color      |
| `--color-midnight-raised` | `#172A42` | A panel on Midnight (`--card` in a dark context)                            |
| `--color-paper`           | `#FBF8F1` | Paper as a named token                                                      |
| `--color-on-dark-muted`   | `#C8C0B0` | Secondary text on any dark ground (9.57:1 Midnight, 5.21:1 Indigo)          |
| `--color-gold-light`      | `#F0D58A` | On dark only: links, the swash colour, the focus ring, the button fill      |
| `--color-gold`            | `#D9B15F` | On dark only: eyebrows, running stitches, the thread body                   |
| `--color-gold-deep`       | `#A9772A` | Decorative only: the gradient's shadow stop and thread strokes (never text) |
| `--color-kraft`           | `#E2CFA9` | HangTag card stock (Ink, Claret and Secondary text; not Brass)              |
| `--color-blush`           | `#F1DFD7` | SwatchCard blush cotton                                                     |
| `--color-sage`            | `#DDE2D0` | SwatchCard sage linen                                                       |
| `--color-border-on-dark`  | `#8A96A8` | A form field's edge on a dark ground (5.77:1)                               |
| `--thread-gold` (`:root`) | gradient  | gold-deep, gold, gold-light, gold, gold-deep                                |

Every pair above is asserted in `src/lib/theme-tokens.test.ts` (`npm run test:unit`).

### Ground contexts (how one component works on both)

`.surface-midnight`, `.surface-indigo` and `.on-dark` re-point the semantic tokens: `--foreground`
becomes Linen, `--link` and `--ring` gold-light, `--color-text-secondary/-tertiary/-muted-text` the
on-dark muted, `--color-brass-text` gold, `--color-rust-decorative` gold-light, `--stitch-color`
gold, and the `--btn-*` tokens flip the buttons to paper. `.on-light` and the light surfaces restore
the light set. So `text-foreground`, `text-link`, `text-[var(--color-text-secondary)]`, borders,
the focus ring, `SectionHeading`, `CtaLink`, `FaqAccordion` and the motifs all read correctly on
either ground with no extra props. There is still **no dark mode**: these are dark SECTIONS.

---

## Typography

| Role      | Family / class                    | Notes                                                                                                                                        |
| --------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Statement | `.display` / `.display-sm`        | Fraunces at `--text-display` (to 9.5rem) / `--text-display-sm` (to 6.25rem), weight 340/360, tight leading, negative tracking, balanced wrap |
| Headings  | Fraunces Variable                 | h1 to h3 at weight 440, h4 to h6 at 560; `text-h1`...`text-h6` fluid sizes                                                                   |
| Swash     | `.swash` (an `<em>`)              | Fraunces full italic at SOFT 100, WONK 1. Claret on light; thread-gold gradient on dark                                                      |
| Eyebrow   | `.eyebrow` (+ `.eyebrow--center`) | 0.75rem tracked caps led by a short running stitch; brass on light, gold on dark                                                             |
| Body / UI | Mulish Variable; `.lede`          | `.lede` is the large opening paragraph (secondary ink, 42ch)                                                                                 |
| Script    | Petemoss; `.font-script`          | Monogram artifacts and ONE `ScriptKicker` per page (2.75rem floor)                                                                           |

The roman Fraunces is the opsz build; the italic is the **full** build (adds SOFT and WONK, about
68KB, `font-display: swap`, downloaded only when a page sets italic).

**Embroidery fonts are different**: each `font` document carries a `previewImage`. See `docs/04`.

---

## Textures (generated, no image files)

- **Linen weave** `--tex-linen` (`.surface-linen`, `.surface-sage`, `.texture-linen`): a 1px warp
  and weft at 3px pitch, slub threads at prime pitches (11, 13, 17, 23px) so no grid repeats show,
  plus an isotropic grain. Seamless by construction.
- **Paper grain** `--tex-paper` (`.surface-paper`, `.texture-paper`).
- **Midnight twill** `--tex-midnight` (`.surface-midnight`, `.texture-midnight`): an indigo glow top
  left, a faint gold warmth bottom right, a light weave and grain.
- Sizes travel with the stacks: `--tex-linen-size`, `--tex-paper-size`, `--tex-midnight-size`.

`.surface-*` paint their ground on `::before` (see "Surfaces and the thread"); `.texture-*` paint
on the element itself (cards, panels).

---

## Surfaces and the golden thread

`<main>` is `relative isolate`. `ThreadLine` sits in it at z-index -1. A **top-level** surface
(a direct child of `<main>`, or anything with `.thread-through`) paints its ground at -2, so the
thread runs over the cloth and under every word, card and photo. Rules for page authors:

1. Full-width bands use `.surface-midnight | -indigo | -linen | -paper | -sage`, not a `bg-*`
   utility (a plain background hides the thread). Alternate dark and light; never two flat light
   sections in a row.
2. Never put `data-reveal`, a transform, opacity or a filter ON a top-level surface section; put
   them on the content inside.
3. Inside a top-level surface, avoid negative z-index children (they land below the ground).
4. Mark the element the thread should finish at with `data-thread-end` (CtaBanner does).
5. `BaseLayout thread={false}` turns it off for a page.

---

## Motion

Purposeful, slow-settling easing (`--ease-thread`, `cubic-bezier(0.22, 1, 0.36, 1)`), never scroll
hijacking, all vanilla CSS/TS.

- **Scroll reveals are back** (Direction C removed them), gated and opt-in: `data-reveal` (rise),
  `data-reveal="fade"`, `data-reveal="stitch"` (a left-to-right wipe), `data-reveal-stagger="90"` on
  a parent, `--reveal-delay` inline. Nothing is hidden until `motifs/RevealScript.astro` has run
  (`html.reveal-ready`); elements already on screen show without animating; no JS, a failed bundle,
  the preview shell and reduced motion all show everything. End state is `.is-visible`.
- **ThreadLine**: one rAF-throttled passive scroll listener; reveals with a rectangular clip-path
  and moves the needle with a transform (no per-frame layout reads). ResizeObserver rebuilds the
  path. Reduced motion: drawn in full, no needle, no listener. No JS: the server path, drawn in full.
  Legibility (desktop): after each build the script measures every line of text the thread passes
  behind (Range client rects, reveal translate undone) and writes two dim zones per line into an SVG
  luminance mask on the thread group (wide soft ring, tighter darker core, no blur filter), so the
  thread stays bright in the gaps and recedes behind copy.
- **Header**: past 24px of scroll the full-width row detaches into a floating glass pill (the
  Reid Design pattern) and the seal gives way to the wordmark; back at the top it returns. It
  never hides on scroll-down. Reduced motion: the same states with no transition.
- **Marquee**: CSS animation, pauses on hover/focus and via its button; still under reduced motion.
- Hover/focus: the button fill sweep, the stitched link sewing solid, card lifts.
- `prefers-reduced-motion` honoured everywhere (see gotcha 14 in `.claude/rules/design-system.md`).

---

## Component catalog

All strings come from Sanity through props; short neutral fallbacks only where noted.

### Layout and chrome

- **`BaseLayout.astro`** adds: `header?: 'solid' | 'overlay'` (default `'solid'`; overlay pages pull
  `<main>` up under a transparent header and give their first, dark section `.pt-header`),
  `thread?: boolean` (default `true`). Sets `html.js` before first paint; renders `ThreadLine` and
  `RevealScript`.
- **`Header.astro`** (2026-10-04 rework): `tone?: 'solid' | 'overlay'` (BaseLayout passes it). No top
  rail. From 75rem (1200px): the Site Settings menu split either side of the centred Hoop Seal
  (`<Logo mark />`, 5.1rem), the quote button at the right, a running-stitch hem with a gap under the
  seal. Below 75rem: seal + wordmark at the left, the menu button at the right. `[data-scrolled]`
  (past 24px) turns the row into an inset, rounded paper-glass pill (blur, hairline, a stitched inner
  edge, soft shadow); on desktop the seal shrinks and fades as the wordmark draws in. The sticky outer
  box reserves `--header-h` (4.5rem below 75rem, 6.5rem from it) in both states, so nothing shifts.
  Overlay at rest is a dark context; the pill is a light one. No JS: a solid Midnight row. Dropdowns
  are native `<details>` with the hover-intent / Escape / outside-click script; panels are paper cards
  with a stitched edge. CSS: "Site header" in `globals.css`. Test: `tests/header.spec.ts`.
- **`MobileNav.tsx`**: same props and behaviour plus `brandName`; a full-screen Midnight panel with
  the wordmark in its top bar, running-stitch dividers, the active page in the swash, the paper `.btn`
  CTA, and "At the bench" (phone and email from Site Settings; no hours) at the foot.
- **`Footer.astro`** (compact rework 2026-10-04): same props. A pinked top edge and a gold
  running-stitch hem ending in a thread tail and a small needle; the brand block (the Hoop Seal beside
  the wordmark, both `public/brand/*-dark.svg`, the tagline, one contact cluster); the Site Settings
  link columns side by side (a column of more than five links flows into two sub-columns; four on
  tablets); one bottom row (copyright, small print, `footerCredit`). Phones: a two-column link grid.
  The bottom row keeps clear of BackToTop. Heights on /pricing, before and after: 919 to 413px at
  1440, 864 to 566 at 1024, 1097 to 619 at 768, 1288 to 994 at 390, 1343 to 1154 at 320. All rows 44px.
- **`BackToTop.tsx`**: 48px Midnight button with a gold thread ring that winds with scroll progress.

### Typography and actions

- **`SectionHeading.astro`**: `eyebrow?`, `headline?`, `swash?` (word/phrase from the headline),
  `headlineItalicSuffix?`, `subhead?`, `headingId`, `level?: 'h1'|'h2'|'h3'`, `align?: 'left'|'center'`,
  `size?: 'md'|'lg'|'display'` (default `'md'`), `tone?: 'default'|'inverse'`, `scriptAccent?`, `class?`.
- **`CtaLink.astro`**: `cta`, `variant?: 'primary'|'secondary'`, `onDark?` (forces the dark
  treatment over a photo or non-surface dark), `arrow?`, `fallbackHref?`, `fallbackLabel?`, `class?`.
- **`CtaBanner.astro`**: `eyebrow?`, `headline?`, `swash?`, `subhead?`, `ctaLabel?`, `ctaHref?`,
  `secondaryLabel?`, `secondaryHref?`. The `subhead` fallback is a neutral line with no response-time
  promise (the page supplies any real claim from Sanity). Midnight band, stitched frame, `data-thread-end` on the
  buttons. Keep it a direct child of `<main>`.
- **Classes**: `.btn` + `.btn-primary` / `.btn-secondary` (+ `.btn__arrow`), `.link-stitch`,
  `.display`, `.display-sm`, `.swash`, `.swash-gold`, `.eyebrow`, `.lede`, `.stitch-x`,
  `.stitch-frame`, `.cross-corners`, `.hit-44`, `.pt-header`.
- **`FaqAccordion.tsx`**: same props; stitched dividers, italic index numerals, a cross-stitch toggle.

### Motifs (`src/components/motifs/`)

- **`ThreadLine.astro`** (+ `ThreadLineScript.astro`): no props; BaseLayout renders it.
- **`RevealScript.astro`**: no props; BaseLayout renders it once.
- **`HoopFrame.astro`**: `image` (Sanity image or null for an empty linen hoop), `alt?`,
  `size?: 'sm'|'md'|'lg'|'xl'|number` (200/300/420/560px; shrinks to fit), `focal?: {x,y}` (0..1, for
  photos without a Sanity hotspot), `tone?: boolean` (the shared warm grade, default on), `tilt?`,
  `caption?` (renders a `<figure>` with a stitched caption), `loading?`, `fetchpriority?`, `class?`,
  `style?`, any other attribute (data-_, aria-_) passes through to the wrapper. Default slot: content
  centred inside an EMPTY hoop's fabric (ignored when a photo is set). Tilt is the CSS variable
  `--hoop-tilt` (falls back to the prop's `--hoop-tilt-base`), so a parent can straighten it on hover.
- **`SwatchCard.astro`**: slots `media` (edge to edge) and default (padded body);
  `tone?: 'paper'|'linen'|'blush'|'sage'|'kraft'|'midnight'`, `stitched?` (default true),
  `pinked?` (default true), `tilt?`, `interactive?` (lift on hover/focus-within),
  `as?: 'div'|'article'|'li'|'figure'`, `bodyClass?`, `class?` (merged), `style?`, and any other
  attribute (data-_, aria-_, id) passes through to the wrapper. Tilt: `--swatch-tilt` overrides the
  prop's `--swatch-tilt-base`.
- **`HangTag.astro`**: `eyebrow?`, `title?`, `titleTag?: 'h2'|'h3'|'h4'|'p'`, `value?`, `note?`,
  `tone?: 'kraft'|'paper'|'midnight'`, `tilt?`, `string?` (twine loop, default true),
  `size?: 'sm'|'md'`, default slot for extra details, `class?` (merged), `style?`, and any other
  attribute (data-_, aria-_, id) passes through to the outer element. Tilt: `--tag-tilt` overrides
  the prop's `--tag-tilt-base`.
- **`Spool.astro`**: `color` (hex), `label?`, `sublabel?`, `size?: 'sm'|'md'|'lg'|number`
  (56/84/120px), `title?` (accessible name when there is no visible label; otherwise decorative),
  `tail?` (default true), `tilt?`, `class?`.
- **`RunningStitch.astro`**: `tone?: 'ground'|'gold'|'brass'|'claret'|'linen'|'ink'|'current'`
  (`ground` follows the surface), `orientation?: 'horizontal'|'vertical'`, `length?` (CSS length),
  `stitch?`, `gap?`, `weight?` (px), `ornament?: 'none'|'cross'|'knot'|'needle'`, `class?`.
- **`Marquee.astro`** (+ `MarqueeScript.astro`): `items: string[]`, `label?` (region name),
  `pauseLabel?`, `playLabel?` (fallbacks "Pause"/"Play"), `separator?: 'cross'|'needle'|'dot'`,
  `speed?` (seconds per loop, default 70), `direction?: 'forward'|'reverse'`, `size?: 'md'|'lg'`, `class?`.
- **`Needle.astro`**: `length?`, `angle?`, `thread?` (colour through the eye), `class?`.
- **`uid.ts`**: `motifId(prefix)`, deterministic SVG ids (render-parity stays stable).

---

## Accessibility quick checks

- Ink on Linen 11.65:1; Linen on Midnight 14.97:1; on-dark muted on Indigo 5.21:1 (the tightest
  dark pair); gold-light focus ring on Indigo 6.54:1.
- Gold, gold-light and gold-deep are dark-ground colours. Claret is never text on dark (2.27:1).
- Every interactive element shows a 2px ring in the ground's `--ring` (global `:focus-visible` rule
  in `@layer base`; component focus utilities still win).
- **Touch targets (PORTS cards 82 and 83).** Everything is at least 44 by 44px at phone width
  (`node scripts/measure-tap-targets.mjs`). Stacked rows take real `min-h-[44px]`; a standalone
  small link takes the invisible `relative hit-44` area; links inside a sentence are exempt.
- CI requires a **perfect Lighthouse accessibility score on all routes**; axe runs in Playwright.
