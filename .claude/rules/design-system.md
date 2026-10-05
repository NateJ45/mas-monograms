---
paths:
  - 'src/**/*.astro'
  - 'src/**/*.tsx'
  - 'src/styles/**'
  - 'src/lib/theme-tokens.test.ts'
  - 'src/lib/contrast.ts'
  - 'src/lib/scriptAccent.ts'
  - 'public/favicon.svg'
  - 'scripts/generate-favicons.mjs'
---

# Design system, typography, palette, component rules

Loads when you touch components, layouts, styles or the theme-token test. The
"No dark mode" and "Sanity-first" rules stay in the root CLAUDE.md.

## Design system note

The current visual identity is **Heirloom Coast** (rebranded 2026-07-01) wearing **Direction D,
"The Atelier"** (2026-10-04): Midnight and Linen sections alternating, generated linen weave and
paper grain, huge Fraunces display type with italic swash words, a thread-gold gradient, and the
embroidery motifs (golden ThreadLine, hoops, spools, swatch cards, hang tags, running stitches).
Brief: `docs/superpowers/specs/2026-10-04-atelier-direction.md`. Full catalog with props:
`docs/02-design-system.md`. Direction D supersedes Direction C's "expensive = restraint" motion
rule; it does NOT relax Sanity-first, no-fabrication or the perfect accessibility gate.

## Typography

**Serif display (light, optical-sized) + humanist-sans body + a script face for monogram
artifacts and ONE kicker per page.**

- **Fraunces Variable**: roman from the **opsz build** (`opsz.css`); italic from the **full build**
  (`full-italic.css`: wght, opsz, SOFT, WONK) so `.swash` can run SOFT 100 / WONK 1. Never synthesize
  oblique. Display sizes are light (`.display` 340, `.display-sm` 360, base headings 440, h4 to h6
  560). Hierarchy comes from size and the optical axis, not boldness.
- **`.swash`**: the one italic word or phrase that carries a headline. Claret on light grounds; the
  thread-gold gradient on dark ones (glyph-clipped, with `color` kept at gold-light so contrast
  tools measure a real colour). SectionHeading `swash` prop, CtaBanner `swash` prop.
- **Mulish Variable**: body and UI. `.lede` for opening paragraphs, `.eyebrow` for tracked-caps
  labels (led by a short running stitch; brass on light, gold on dark).
- **Petemoss**: monogram artifacts and one script kicker per page (`ScriptKicker.astro`, 2.75rem
  floor). `.font-script` is the utility. Never for prose, buttons, nav or small text.
- **Logo** (`Logo.astro`, redrawn 2026-10-04, blue and gold): `<Logo mark />` the Hoop Seal (primary
  mark), `<Logo />` the Signature Thread wordmark (horizontal lockup, `cut="header"` below 40px,
  `"display"` above), `<Logo seal />` with ring lettering. `variant="adaptive"` (default) paints through
  the `--logo-*` tokens (`--logo-ring-a/b/c`, `--logo-letters`, `--logo-thread-a/b/c`, `--logo-word`,
  `--logo-swash`...), set light in `:root` and dark in the dark-context list, so one instance follows
  the header from overlay to pill. Every instance gets its own id prefix (`motifId`). The drawing lives
  in `src/lib/brand/brandSvg.js` (geometry `brandPaths.js`, generated; see `docs/logo-concepts/README.md`)
  and is shared by the favicon, `public/brand/*.svg` and OG scripts. Never put Claret in the logo.
- Embroidery fonts are NOT web fonts (each `font` document has a `previewImage`).
- **Italic is two subsets** (2026-10-04): `--font-swash` (Fraunces Swash: SOFT 100 / WONK 1 pinned,
  wght 300 to 360) for every swash-voiced italic, and the plain italic as Fraunces Variable italic. Both
  are cut by `scripts/subset-fraunces-italic.py` into `src/assets/fonts/`; keep the script's character
  list and the two `unicode-range`s in `globals.css` in step. Not preloaded on purpose (see BaseLayout).

## Tokens, not literals (2026-10-04 extract pass)

- Text below the headings: `var(--text-label | -meta | -small | -compact | -body | -reading | -lead-sm)`
  (0.75 to 1.125rem; 0.75rem is the floor for functional text). Radii: `var(--radius)` 0.25rem,
  `--radius-soft` 6px, `--radius-mount` 10px, `--radius-pill` 999px. White is `--color-white-pure`; prop
  wood is `--color-wood-*` / `--wood-shelf` / `--wood-mount`. Never write `#fff`, `#000` or a raw size.
- Larger component sizes (prices, numerals, ornament glyphs) and material shading (wood grain, brass,
  sheen, prop shadows) stay local, each listed with a reason in `.impeccable/config.json`. Add a new
  one there with `impeccable ignores add-value <rule> <value> --file <path> --reason "..."` (quote `*`
  in Git Bash or it glob-expands into the repo's file names). `impeccable detect --json src` should
  report 0.
- Reading measure: about 70 characters, `52ch` to `56ch` in Mulish (its `0`, which `ch` measures, is
  wide, so 65ch is ~88 characters). Form labels are sentence case.

## Color palette

Heirloom Coast tokens are unchanged (table in `docs/02-design-system.md`). Direction D adds:

| Token                                | Hex       | Use                                                            |
| ------------------------------------ | --------- | -------------------------------------------------------------- |
| `--color-midnight`                   | `#0F1B2D` | drench surface (dark sections, menu, footer, theme-color)      |
| `--color-midnight-raised`            | `#172A42` | a panel lifted off Midnight                                    |
| `--color-paper`                      | `#FBF8F1` | Paper as a named token                                         |
| `--color-on-dark-muted`              | `#C8C0B0` | secondary text on any dark ground                              |
| `--color-gold-light`                 | `#F0D58A` | swash/links/focus ring ON DARK ONLY; the button fill on dark   |
| `--color-gold`                       | `#D9B15F` | eyebrows, stitches on dark (same hex as `--color-gold-script`) |
| `--color-gold-deep`                  | `#A9772A` | DECORATIVE ONLY (gradient shadow stop, thread strokes)         |
| `--color-kraft` / `-blush` / `-sage` |           | light fabric grounds for SwatchCard and HangTag                |
| `--color-border-on-dark`             | `#8A96A8` | a form field's edge on a dark ground                           |

`--thread-gold` (in `:root`) is the gradient: gold-deep, gold, gold-light, gold, gold-deep.

**Ground contexts.** `.surface-midnight`, `.surface-indigo` and `.on-dark` re-point the semantic
tokens (`--foreground`, `--link`, `--ring`, `--color-text-secondary`, `--color-brass-text`,
`--stitch-color`, the button tokens...), so existing utilities turn light-on-dark with no
per-component work. `.on-light` (and `.surface-linen/-paper/-sage`) restore the light set, from
`--snap-*` snapshots taken in `:root`. Gold stays a dark-ground colour; Claret is never text on dark.

## Component authoring

- **Never put a `<script>` inside a JSX expression** (`{cond && (<script>...)}`).
  `prettier-plugin-astro` hands the script body to the JSX parser, where every `{` opens an
  expression, and `npm run format:check` fails on the file. Put the script in its own tiny
  component and render THAT (`HeroFillScript`, `MarqueeScript`, `ThreadLineScript` are the pattern).
- **Full-width bands use a surface class, not a `bg-*` utility.** The golden ThreadLine lives in
  `<main>` (`relative isolate`) at z-index -1; a top-level surface (a direct child of `<main>`, or
  `.thread-through`) paints its ground on `::before` at -2, so the thread runs over the cloth and
  under the content. A plain `bg-*` section hides the thread. Never put `data-reveal`, a transform,
  opacity or a filter ON a top-level surface (it becomes a stacking context and buries the thread);
  put them on the content inside. A negative z-index child inside a top-level surface lands below
  its ground. Nested surfaces are isolated and safe anywhere.
- **The Atelier classes are in `@layer components`** (`.btn`, `.eyebrow`, `.display`, `.swash`,
  surfaces, stitches), so any Tailwind utility on the same element wins.
- **Buttons:** `.btn .btn-primary` / `.btn .btn-secondary` (or `CtaLink`). They read the ground's
  context tokens: one pair of classes is Claret on Linen and Paper on Midnight. 48px tall. Hover AND
  focus-visible run the fill sweep; the focus ring is the ground's `--ring`.
- **Reveals:** `data-reveal` (rise), `data-reveal="fade"`, `data-reveal="stitch"`,
  `data-reveal-stagger="90"` on a parent, `style="--reveal-delay: 120ms"`. Nothing hides until
  `motifs/RevealScript.astro` has run and set `html.reveal-ready`; on-screen elements show without
  animating; reduced motion shows everything. End state `.is-visible` (tests' `settle()` forces it).
- **`max-w-xs` and friends are tiny here** (`--spacing-xs` collides); use `max-w-[18rem]`.
- **44px tap targets at 390px** (PORTS cards 82 and 83, PR #72). Stacked rows get real
  `min-h-[44px]`; a standalone small link gets `relative hit-44` (`globals.css`); never pad an
  underlined text link; never use `hit-44` on rows closer than 44px minus their height. The footer
  keeps `min-h-[44px]` rows and `h-11 w-11` social buttons; the Marquee button is 44px; BackToTop 48px.
  Re-run `scripts/measure-tap-targets.mjs` after touching the footer, the gallery filter or the form.

- **44px tap targets at 390px** (PORTS cards 82 and 83). Stacked rows get real
  `min-h-[44px]`; a standalone small link gets `relative hit-44` (`globals.css`);
  never pad an underlined text link; never use `hit-44` on rows closer than
  44px minus their height (give them real height or space them). `.form-input`
  carries `min-h-[44px]`. Radios and checkboxes use the hand-drawn `.choice-input`
  class plus `hit-44` in `request-a-quote.astro` (a native control has no `::after`;
  do not put `accent-primary` back). Re-run `scripts/measure-tap-targets.mjs`
  after touching the footer, the gallery filter or the quote form.

## Gotcha (design tokens)

<!-- prettier-ignore-start -->
4. **Palette ratios in CSS comments are not a gate.** `src/lib/theme-tokens.test.ts` parses the
   real hex out of `globals.css` and asserts the pairs under `npm run test:unit`. **Any token that
   becomes a focus ring or the visible edge of a control must be added there** with `AA_NON_TEXT`.
   Direction D added the dark-ground, button and fabric pairs, and a guard that no `--color-*` is
   declared as a raw hex twice: a dark context must override through `var()`, because the test
   keeps the LAST hex it reads for a name.
14. **The reduced-motion reset zeroes transitions, it does not shorten them
    (2026-09-30, starter PORTS.md card 61).** In `globals.css` the reset uses
    `transition-duration: 0s` plus `transition-delay: 0s`, never `0.01ms`:
    `transition-property` defaults to `all`, so 0.01ms gives every element a
    transition and WebKit never finishes one, stranding properties at their old
    values. Consequence: `transitionend` never fires under reduce. `animation-duration`
    stays 0.01ms so `animationend` still fires. `tests/reduced-motion.spec.ts` runs on
    chromium and webkit-iphone. The Marquee is `animation: none` under reduce (one still,
    wrapped copy); the ThreadLine is fully drawn with no needle and no scroll listener.
15. **Astro 7 `astro dev` backgrounds itself when it detects an agent** and allows ONE dev
    server per project root (a lock in `.astro/`). With several agents in one tree, run
    `ASTRO_DEV_BACKGROUND=1 node node_modules/astro/bin/astro.mjs dev --port <n> --ignore-lock`
    to get a foreground server of your own (2026-10-04).
16. **The header's reserved height is a contract** (2026-10-04). `--header-h` is 4.5rem below 75rem
    and 6.5rem from it, the same at rest and as the scrolled pill (the pill condenses INSIDE the
    sticky box). Overlay pages pull `<main>` up by it and their first section clears it with
    `.pt-header`. Change the row height and `--header-h` together, then run `tests/header.spec.ts`
    (it asserts the box height is equal in both states and the hero heading clears the header).
    `html` carries `scroll-padding-top: calc(var(--header-h) + 0.5rem)` so focus scrolling, anchors and
    `scrollIntoView` stop below the sticky header (WCAG 2.4.11). `measure-tap-targets.mjs` still prints
    "stolen-tap" warnings for elements that sit under the header at one of ITS scroll stops; hit-test
    them centred (`scrollIntoView({ block: 'center' })`) before believing one.
    **The morph is compositor-only** (2026-10-04): never transition a layout property on the header and
    never let the row's layout change between states. A FLIP (snap layout, animate back) still reports
    layout shift for the snap. Pieces move with `translate`/`scale` from offsets in container units
    (`.site-header` is `container-type: inline-size`); the pill is `.site-header__ground`'s `clip-path`.
    The brand's `::after` is its hit area and focus ring (the link itself is `pointer-events: none`).
    **Never make `<header>` a backdrop root** (2026-10-05). A `backdrop-filter` blurs the image of its
    nearest ANCESTOR backdrop root: the root, or any element with `filter`, `opacity` < 1, `mask`,
    `clip-path`, `backdrop-filter`, `mix-blend-mode`, a `will-change` of those, or a
    `view-transition-name`. `view-transition-name: site-header` on `<header>` kept the pill's glass
    blurring nothing for its whole life (bisected in Chromium: removing only that flipped stripe energy
    under the pill from 31.9 to 0.16; clip-path on the glass ITSELF is harmless). The router now pins
    the row (`site-header`, carrying the stitch as `__bar::before`), the glass (`site-header-glass`) and
    the shadow (`site-header-pill`) as siblings, old snapshots `display: none`. `tests/header.spec.ts`
    walks the glass's ancestors for every trigger and checks stripes behind the pill come out blurred.
    Playwright's Windows WebKit never paints `backdrop-filter` (not even on a bare page), so frosting can
    only be proven in Chromium on this PC; real Safari renders it via `-webkit-backdrop-filter`.
17. **A scroll box paints its own texture** (2026-10-04, phone menu). A `.surface-*` ground is a
    `::before` the size of the box's first screen; inside a scroll container it scrolls away and leaves a
    flat strip. Put `texture-*` on the scroll box with `background-attachment: local`, size it `100dvh`,
    give it `overscroll-behavior: contain`, and keep decorative absolute children from adding scroll
    height (`overflow: clip` on their wrapper, which also needs `shrink-0` in a column flex box).
<!-- prettier-ignore-end -->
