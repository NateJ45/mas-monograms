---
name: MAS Monograms
description: Heirloom Coast, "Direction D: The Atelier": Midnight and Linen sections alternating, huge Fraunces with italic swash words, a thread-gold gradient, and a live embroidery engine as the standout feature.
colors:
  linen: "#F4EEE3"
  paper: "#FBF8F1"
  sage-band: "#E4E2D3"
  border-soft: "#D8CFBC"
  border-interactive: "#847A63"
  heirloom-ink: "#26312E"
  ink-dark: "#1A1512"
  heritage-indigo: "#28486B"
  indigo-deep: "#1C3550"
  midnight: "#0F1B2D"
  midnight-raised: "#172A42"
  claret: "#8C3A2E"
  claret-deep: "#722C22"
  brass-text: "#835A24"
  brass-decorative: "#B98A3E"
  gold: "#D9B15F"
  gold-light: "#F0D58A"
  gold-deep: "#A9772A"
  on-dark-muted: "#C8C0B0"
  border-on-dark: "#8A96A8"
  kraft: "#E2CFA9"
  blush: "#F1DFD7"
  sage: "#DDE2D0"
  taupe-secondary: "#5A5148"
  taupe-tertiary: "#67614F"
  error-text: "#B91C1C"
  error-surface: "#F9E8E6"
  error-border: "#E0B4AC"
  white: "#FFFFFF"
  wood-edge: "#F0D6AD"
  wood-light: "#D4A873"
  wood: "#B98450"
  wood-dark: "#8A5A2F"
  wood-mount: "#C79A63"
typography:
  display:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(3.25rem, 1.4rem + 7vw, 9.5rem)"
    fontWeight: 340
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  display-sm:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(2.6rem, 1.5rem + 4.4vw, 6.25rem)"
    fontWeight: 360
    letterSpacing: "-0.028em"
  h1:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 440
  h2:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 440
  h3:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 440
  heading-small:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)"
    fontWeight: 560
  h5:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(1.125rem, 1.5vw, 1.25rem)"
    fontWeight: 560
  swash:
    fontFamily: "Fraunces Swash, Fraunces Variable, serif"
    fontStyle: italic
    fontWeight: 330
  lead-sm:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "1.125rem"
  reading:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.7
  body:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "1rem"
  compact:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "0.9375rem"
  small:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "0.875rem"
  meta:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "0.8125rem"
  label:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.24em"
  script-kicker:
    fontFamily: "Petemoss, cursive"
    fontSize: "2.75rem"
rounded:
  base: "0.25rem"
  button: "2px"
  soft: "6px"
  mount: "10px"
  pill: "999px"
spacing:
  xs: "clamp(0.25rem, 0.5vw, 0.5rem)"
  s: "clamp(0.5rem, 1vw, 1rem)"
  m: "clamp(1rem, 2vw, 1.5rem)"
  l: "clamp(2rem, 4vw, 3rem)"
  section-md: "clamp(3rem, 6vw, 5rem)"
  section-lg: "clamp(4rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.claret}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.claret-deep}"
  button-on-dark:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.heirloom-ink}"
  surface-midnight:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.linen}"
  surface-indigo:
    backgroundColor: "{colors.heritage-indigo}"
    textColor: "{colors.linen}"
---

# Design System: MAS Monograms

Tokens live in `src/styles/globals.css` (`@theme` and `:root`); there is no `tokens.css` or Tailwind config. The CSS wins if this file and the code disagree. Strategy is in `PRODUCT.md`. Fuller rationale, the motif catalog with props and contrast math: `docs/02-design-system.md`, `.claude/rules/design-system.md` and the brief `docs/superpowers/specs/2026-10-04-atelier-direction.md`. The embroidery engine is documented in `.claude/rules/atelier-engine.md`.

## 1. Overview

**Creative North Star: the atelier.** A craft you can watch happen. The site makes its own product photography: a live embroidery engine stitches a visitor's initials, thread by thread, onto woven fabric in real thread colours, and everything else (hoops, spools, tags, running stitches, a gold thread sewn down the page as you scroll) supports that one idea. Direction D (2026-10-04) replaced Direction C's "The Sampler"; its "expensive through restraint" rule no longer governs visual ambition, but Sanity-first, no fabrication and the perfect accessibility gate still bind.

- **Heirloom Coast stays.** Linen, Paper, Heritage Indigo, Claret and Brass are unchanged (the logo was redrawn on 2026-10-04, see Components). Direction D adds a deeper **Midnight** beneath Indigo and a **thread-gold gradient**.
- **Dark and light sections alternate** (Midnight, Indigo, Linen, Paper, Sage); never two flat light sections in a row. This is rhythm, not a dark mode: there is no `.dark` CSS, no toggle and no theme bootstrap script. Do not add one.
- **Generated textures, no image files.** A linen weave, paper grain and a Midnight twill are CSS/SVG; the fabric on the engine's canvas is procedural too.
- **Photos are reframed, not hero.** Mary Ann's photos are modest, so they sit in embroidery hoops, on swatch cards and hang tags, under one shared warm grade, in tight crops. The home hero has no photo; it has the live stitching.
- **Motion is purposeful** and gated: scroll reveals (`data-reveal`) are opt-in and never hide content without JS, the golden thread draws with scroll, and reduced motion shows everything finished.
- Reference sites and anti-references (proposed, unconfirmed) are in `PRODUCT.md`; this file records only what the code does.

## 2. Colors

- **Ground (light).** Linen `#F4EEE3` page, Paper `#FBF8F1` cards and raised surfaces, Sage band `#E4E2D3`, soft border `#D8CFBC` for decorative hairlines, interactive border `#847A63` for form fields.
- **Ground (dark).** Midnight `#0F1B2D` is the drench surface (hero, dark sections, mobile menu, footer, the browser theme-color; Linen on it is 14.97:1); Midnight Raised `#172A42` lifts a panel off it. Heritage Indigo `#28486B` is also a full-width band, a primary and the focus ring on light; Indigo Deep `#1C3550` on hover.
- **Ink.** Heirloom Ink `#26312E` for text and headings on light (11.65:1 on Linen). Secondary taupe `#5A5148` (6.72:1), captions `#67614F` (5.35:1). On dark grounds secondary text is On-dark muted `#C8C0B0`. Never dim text with opacity utilities; use tokens.
- **Claret** `#8C3A2E` (hover `#722C22`): the button fill on light grounds only (white label 7.61:1), and the swash colour on light. Never text on dark; on Midnight and Indigo the same `.btn-primary` flips to Paper with an Ink label.
- **Brass.** Text `#835A24` (5.27:1 on Linen) for pricing figures and small meta on light; on dark grounds `--color-brass-text` re-points to gold. Decorative `#B98A3E` (about 2.7:1) is hairlines and ring strokes only, never text.
- **Thread gold** (dark grounds only): Gold `#D9B15F` for eyebrows and stitches, Gold Light `#F0D58A` for swash words, links and the focus ring, and as the button fill on dark. Gold Deep `#A9772A` is decorative only (a gradient stop, thread strokes). `--thread-gold` is the gradient (gold-deep, gold, gold-light, gold, gold-deep) used for the golden thread and glyph-clipped swash text.
- **Fabric grounds** for swatch cards, hang tags and the engine's cloth: Kraft `#E2CFA9`, Blush `#F1DFD7`, Sage `#DDE2D0` (and Linen, Paper). Ink reads on all of them; Claret passes on Kraft (4.98:1); brass-text does not (3.98:1), so use Ink there.
- **Errors** use a token set (`#B91C1C` text, `#F9E8E6` wash, `#E0B4AC` border), not the shadcn red. A form field's edge on a dark ground is `#8A96A8`.
- Near-black `#1A1512` survives only as the base of the photo scrim in `HeroBackground`.
- **White** `#FFFFFF` is `--color-white-pure`: the label on a Claret button or chip and white form fields. Write the token, never `#fff`.
- **Wood** (props only, never text or a control edge): `--color-wood-edge` `#F0D6AD`, `-wood-light` `#D4A873`, `-wood` `#B98450`, `-wood-dark` `#8A5A2F`, `-wood-mount` `#C79A63`, combined as the `--wood-shelf` and `--wood-mount` gradients for the thread-rack shelf and the stitched-stage mounts. Other material shading (the studio wall, brass knobs, hoop and shelf shadows, fabric sheen) stays local to its component and is listed with a reason in `.impeccable/config.json`.
- **Ground contexts.** `.surface-midnight`, `.surface-indigo` and `.on-dark` re-point the semantic tokens (`--foreground`, `--link`, `--ring`, secondary text, brass text, stitch colour, button tokens), so existing utilities turn light-on-dark with no per-component work; `.on-light` and `.surface-linen/-paper/-sage` restore the light set.

## 3. Typography

- **Fraunces Variable** (display and headings). Roman from the opsz build; italic from the full build (wght, opsz, SOFT, WONK) so the `.swash` word can run SOFT 100 and WONK 1. Never synthesise an oblique. Display sizes are light: `.display` weight 340 at `--text-display` clamp(3.25rem, 1.4rem + 7vw, 9.5rem), `.display-sm` 360 at clamp(2.6rem, 1.5rem + 4.4vw, 6.25rem), base headings 440, h4 to h6 560. Hierarchy comes from size and the optical axis, not boldness.
- **Italic delivery (2026-10-04).** Two small subsets cut from the full italic by `scripts/subset-fraunces-italic.py` paint every italic: **Fraunces Swash** (`--font-swash`, SOFT 100 and WONK 1 pinned, wght 300 to 360, 46 KB) for `.swash` and every other SOFT 100 italic (marquee words, pull quotes, process numerals), and a plain italic (SOFT 0, WONK 1, 56 KB) declared as Fraunces Variable italic. The 150 KB full italic is only a per-character fallback outside their range (no route fetches it). Use `var(--font-swash)` for any new swash-voiced italic.
- **`.swash`**: the one italic word or phrase that carries a headline. Claret on light grounds; the thread-gold gradient on dark ones (glyph-clipped, with `color` kept at gold-light so contrast tools measure a real colour).
- **Mulish Variable** (body and UI). `.lede` for opening paragraphs; `.eyebrow` for tracked caps (12px, weight 700, 0.24em, led by a short running stitch; brass on light, gold on dark).
- **Petemoss** (script): monogram artifacts and ONE script kicker per page via `ScriptKicker.astro` (at least 2.75rem). Never for prose, buttons, nav or small text.
- **Lettering fonts for the engine** (Great Vibes, Playfair Display, Cinzel from `@fontsource`) are NOT site typography: they are fetched lazily by the canvas renderer only. Embroidery font choices in the Font Guide are still content (each `font` document carries a photo of the lettering).
- **Scale.** `--text-h1` clamp(2.5rem, 6vw, 5rem), h2 clamp(2rem, 4vw, 3rem), h3 clamp(1.5rem, 2.5vw, 2rem), h4 clamp(1.25rem, 2vw, 1.5rem), h5 clamp(1.125rem, 1.5vw, 1.25rem), h6 1rem.
- **Text steps below the headings** (fixed, in `@theme`; component CSS writes `var(--text-*)`, never a literal): `--text-label` 0.75rem (tracked-caps labels, eyebrows, tag and card flags; the floor for functional text), `--text-meta` 0.8125rem (hints, form help), `--text-small` 0.875rem (secondary UI, notes), `--text-compact` 0.9375rem (card and panel body), `--text-body` 1rem, `--text-reading` 1.0625rem (long-form paragraphs), `--text-lead-sm` 1.125rem. Larger component sizes (hang-tag prices, numerals, pull quotes, ornament glyphs) are local to their artwork. Reading measure: about 70 characters (`52ch` to `56ch` in Mulish, whose `0` is wide). Form labels are sentence case, not tracked caps.

## 4. Elevation and surface

Surfaces separate by tone and by texture rather than shadow: Midnight twill, Linen weave, Paper grain. Cards are pinked-edge swatch cards and kraft hang tags with stitched borders and a slight tilt; photos sit in wooden embroidery hoops with a brass clasp and a soft inner shadow. The engine's thread has its own physical lighting (contact and ambient shadow on the cloth, a glint sweep on finish). No glow and no coloured shadows on UI. Radii: base `0.25rem`, buttons 2px, `--radius-soft` 6px (cubbies, swatch wells, the arch base), `--radius-mount` 10px (mounts, the quote card, panels), `--radius-pill` 999px (pills, arches, round chips, the scrolled header).

**Full-width bands use a surface class, not a `bg-*` utility.** `<main>` is `relative isolate`; the golden ThreadLine sits in it at z-index -1; a top-level surface (a direct child of `<main>`) paints its ground on `::before` at -2, so the thread runs over the cloth and under every word, card and photo. Never put `data-reveal`, a transform, opacity or a filter on a top-level surface itself.

## 5. Components and motifs

- **The Monogram Atelier** (`components/atelier/`, engine in `src/lib/atelier/`): a canvas stage on a pinked fabric swatch with real form controls (initials, style, fabric, a spool rack of real thread colours), Replay, a text alternative, a "this is a preview" disclaimer and a hand-off link to the quote form. A compact version lives in the home hero (cycles sample monograms, accepts typing).
- **The golden thread** (`ThreadLine`): one continuous gold thread sewn down the page as you scroll, a needle at its tip, ending at the final CTA (`data-thread-end`). Desktop: a plied S-curve path with a legibility mask that dims it behind lines of text; mobile: a running stitch in the left gutter; no JS or reduced motion: fully drawn, no needle.
- **Hoops, swatch cards, hang tags, spools, running stitches, needle, marquee** (`components/motifs/`): props and use in `docs/02-design-system.md`. Use them consistently; do not sprinkle.
- **Spools read as real turned wood and wound thread** (redrawn 2026-10-04): lathe-turned flanges with a lit chamfered face, a carved ring, grain and the spindle hole; fine wraps that curve round the cylinder; a soft sheen and occlusion under each flange, shaded from the thread's own colour so white and black both read; a loose tail on the shelf. Crisp vector, recolourable from one hex, never a photo.
- **Buttons (`.btn`, `CtaLink.astro`).** One recipe: 48px minimum height, 2px radius, tracked uppercase Mulish label, a fill sweep on hover and focus-visible. `.btn-primary` is Claret on light grounds and Paper (Ink label) on Midnight and Indigo; `.btn-secondary` is the outline. "Request a Quote" is the one primary action; keep it sparing.
- **A stitch follows the shape it is sewn into.** Every inner running stitch (buttons, the header pill, cards, frames) is concentric with its container: inner radius = outer radius minus the inset. A pill button gets a pill stitch, a square one a square stitch; never a square stitch inside a rounded edge. On `.btn`, round the button with `--btn-radius` so the stitch can follow.
- **Header and footer (2026-10-04).** Header: no top rail. A centred editorial row: the menu split either side of the Hoop Seal, the quote button at the right, a running-stitch hem that breaks under the seal; transparent over a Midnight hero, Linen on pages that open light. Past 24px of scroll it detaches into an inset, rounded paper-glass pill with a stitched inner edge, and the seal gives way to the wordmark (the Reid Design pattern); the reserved height never changes. The morph is compositor-only: the row keeps one layout in both states and its pieces glide with translate and scale, while the pill itself is a clip-path on the header ground plus two rect layers (shadow, stitch); no layout property is transitioned and nothing reports layout shift. The pill is real frosted glass (Paper at 78% over a 16px blur, solid Paper where blur is unsupported or reduced transparency is asked for); nav text on it holds AA over any ground, even black. Nothing that encloses the glass may be a backdrop root (no view-transition-name, filter, opacity, mask, clip-path or blend mode on `<header>`), or the blur sees nothing. Phones: seal + wordmark and a menu button, also a pill on scroll; the phone menu is a full-screen Midnight panel with the contact details under "At the bench"; the panel is its own scroll box carrying the twill itself (attached `local`), fits a 360 by 640 screen without scrolling, and scrolls only when a group is expanded. Footer: compact; a pinked top edge and a gold hem ending in a thread tail and needle, the seal beside the wordmark with the tagline and one contact cluster, the link columns side by side, one bottom row. BackToTop is a 48px Midnight button with a gold thread ring that winds with scroll.
- **Logo (`Logo.astro`, 2026-10-04), blue and gold.** `<Logo mark />` is the Hoop Seal (a script S in a gold satin stitch sewn over and under a roman M and A, in a pair of embroidery hoops with their clasp): Indigo hoops and Midnight letters on light grounds, gold hoops and Linen letters on dark ones; the primary brand mark. `<Logo />` is the Signature Thread wordmark (MAS roman caps, Monograms in the soft italic, one gold thread from a running stitch through a loop into the underline): the horizontal lockup. `<Logo seal />` adds ring lettering. `variant="adaptive"` (default) paints through the `--logo-*` context tokens. Claret is never in the logo; it stays the button colour. Drawing: `src/lib/brand/brandSvg.js`; favicons, `public/brand/*.svg` and OG cards come from the same code.
- **Home sections** (`components/home/`): hero (Midnight, live stitching), marquee (Indigo), the Atelier studio (Linen), hoop wall of categories (Midnight), maker band with Mary Ann in an arched portrait (Indigo), stitched process path (Paper), studio wall of swatch cards (Midnight), thread-tied final CTA (Indigo).
- **Lightbox** (`gallery/Lightbox.astro`): native `<dialog>` with focus loop, arrow keys, swipe and a live counter.
- **Forms.** Paper or linen field (Midnight-ground variant uses the dark edge token), interactive-weight border, full focus ring at a 2px offset, errors via the token set linked with `aria-describedby`; radios and checkboxes are the hand-drawn `.choice-input` with a 44px hit area. The quote form keeps its fields, ids and Worker unchanged and gains numbered sections and the Atelier preview.
- **Process steps, FAQ accordion (stitched dividers, italic numerals), CTA banner (Midnight, stitched frame), mobile nav.**

## 6. Do's and Don'ts

Motion: one house easing, `--ease-thread` = `cubic-bezier(0.22, 1, 0.36, 1)`, for hovers, reveals and the thread. No scroll hijacking and no smooth-scroll library (Lenis was removed 2026-10-04). `prefers-reduced-motion` is honoured throughout (transitions of 0s, everything shown finished).

**Do**

- Pull every colour, size and space from the tokens; never hardcode.
- Alternate Midnight and Linen sections; build full-width bands with `.surface-*` classes.
- Put the Claret button on light grounds only and let `.btn-primary` flip to Paper on dark.
- Keep gold (and Gold Light) on dark grounds only; Gold Deep and brass-decorative are never text.
- Keep the Petemoss kicker to one per page and at least 2.75rem.
- Show photos in hoops or on swatch cards under the shared warm grade, with focal points set per image.
- Give the canvas a text alternative, real labelled controls and a reduced-motion path.
- Measure any new colour pair with `src/lib/contrast.ts` and add it to `theme-tokens.test.ts`.

**Don't**

- Don't add a dark mode, a theme toggle or `.dark` CSS (dark sections are fine).
- Don't use brass decorative, Gold Deep or Claret as text on a dark surface, or gold as text on a light one.
- Don't paint a full-width band with a plain `bg-*` utility (it hides the thread).
- Don't bold Fraunces to 700 for hierarchy or synthesise an oblique.
- Don't make a full-bleed photo hero, or invent reviews, years, clients, prices or awards.
- Don't bring back Thread Ledger, the cream/sage/blush look, or Direction C's flat frameless collage.
- Don't write an em-dash in copy.
