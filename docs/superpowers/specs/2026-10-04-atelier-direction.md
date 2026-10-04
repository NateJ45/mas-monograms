# Direction D: "The Atelier" (2026-10-04)

Nathan's brief (verbatim intent): the site "looks completely generic and boring". Rebuild it
fully as his best portfolio piece: beautiful, fancy, makes people want to buy Mary Ann's
embroidery. Mary Ann's product photos are weak, so work around them. Every recent Nixon
Creative Studio site has one standout feature (Reid: concept-room scroll reveal, FBCM:
praise-and-proclaim motifs, Stone Steps: interactive 3D map). MAS needs its own. Mary Ann is
not actively running the business, so there is free rein on design. This supersedes the
"expensive = restraint" rule of Direction C (2026-07-03) for visual ambition; it does NOT
supersede Sanity-first, accessibility, or no-fabrication rules.

## The idea

**The site makes its own product photography.** We stop depending on mediocre photos by
building a live embroidery engine: visitors type their initials and watch them stitched,
thread by thread, onto linen, in real thread colors, on real fabrics. Everything else on the
site (hoops, spools, tags, running stitches, a gold thread that sews itself down the page as
you scroll) supports that one idea: _this is a craft you can watch happen._

### Standout feature: the Monogram Atelier

A canvas-based procedural embroidery renderer:

- Input: initials (1 to 3 letters), a style (e.g. Classic Trio, Script, Block, Circle, Single),
  a thread color (real colors from the Sanity `threadColor` docs, hex in `hexColor`), a fabric
  (linen towel, navy canvas, white cotton, blush, etc.).
- Rendering: rasterise the lettering to a mask, then fill it with satin/fill stitches (parallel
  thread segments, each lit like a cylinder of silk: bright core, darker edges, per-stitch
  jitter), plus a puffy height-map shading, a soft contact shadow on the fabric, and a woven
  fabric texture generated procedurally. It must look like embroidery, not like a blurred font.
  Earlier attempt (2026-07-03) failed because it used flat font rendering; do not repeat that.
- Animation: stitches are laid down in sequence with a needle and trailing thread; it takes
  about 2.5 to 4 seconds, can be replayed, and ends with a glint sweep. `prefers-reduced-motion`
  gets the finished embroidery instantly.
- Used twice: a compact version in the home hero (cycles sample monograms, accepts typing) and
  the full studio section (all controls). Same engine, same module.
- Hand-off: "Request this monogram" goes to `/request-a-quote?initials=..&style=..&thread=..&fabric=..`
  and the quote form pre-fills (initials, style, thread, item hint) so the design carries
  into the order. The preview is labelled as a preview: Mary Ann confirms lettering in her proof.

### Photo strategy (product pictures are weak, so reframe them)

- **Hoop frames.** Photos are shown in embroidery hoops (circular crop, wooden ring with a
  brass screw clasp, soft inner shadow). A circle crop on the embroidered area hides clutter.
  Per-image focal point via Sanity hotspot or `object-position`.
- **One consistent grade.** A shared warm tone treatment (slight warmth, lifted shadows, soft
  vignette, paper grain overlay) so 69 photos from different phones look like one set.
- **Swatch cards / hang tags** for the gallery: pinked edges, a stitched border, a tag string.
- Tight crops, never full-bleed hero photos. The hero has NO photo; it has the live stitching.
- Illustrations carry the rest: SVG spools, needles, hoops, thread, scissors, all drawn in code.
- Mary Ann's headshot is good: show it in an arched frame with a stitched caption.

### Signature motifs (use consistently, don't sprinkle)

- **The golden thread:** one continuous gold thread (SVG path) that is sewn down the page as
  you scroll (stroke-dashoffset tied to scroll progress), with a needle at its tip. It
  passes behind content and ends at the final CTA. Desktop: full path. Mobile: a simplified
  vertical running stitch. Static (fully drawn, no needle) under reduced motion or no JS.
- **Running stitch** dividers and borders (dashed, round caps, gold on dark, claret/brass on light).
- **Spool rack** from the thread colors: SVG spools in the real hex colors. Click a spool to
  recolor the Atelier; on `/thread-color-chart` it is the whole page.
- **Hoops** for photos, **tags** for prices and labels, **cross-stitch corner marks**.
- Linen weave + paper grain textures everywhere, generated in CSS/SVG (no big image files).

### Visual language

- Evolve Heirloom Coast; do not abandon it (the logo and brand stay). Palette: add a deeper
  **Midnight** (#0f1b2d) beneath Heritage Indigo, a **thread-gold gradient**
  (#f0d58a, #d9b15f, #a9772a) for the thread and highlights, keep Linen/Paper/Claret/Brass.
  Contrast rules from `.claude/rules/design-system.md` still bind (gold only on dark; text
  tokens AA; the theme-token test must be extended, not weakened).
- Type: Fraunces (opsz, real italic) pushed bigger and more dramatic: huge display sizes with
  italic swashes on key words; Mulish body; Petemoss script for monogram artifacts and the
  one kicker per page. Tracked caps for small labels.
- Alternate Midnight sections with Linen sections for rhythm; never two flat white-ish
  sections in a row.
- Motion: purposeful, smooth, subtle easing; reveal on scroll via IntersectionObserver with a
  `.js` gate (content visible with no JS), disabled under `prefers-reduced-motion`. No scroll
  hijacking. No giant JS libraries; vanilla TS + CSS. A tiny dependency (e.g. fonts) is OK.
- No dark-mode toggle and no `.dark` class (standing rule). Dark SECTIONS are fine.

## Page-by-page intent

| Route                   | Intent                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `/`                     | Hero with live stitching, item-type marquee, full Atelier, hoop wall of categories, Mary Ann in an arch, stitched process path, swatch-card studio wall, thread-tied final CTA |
| `/shop-by-item`, `/[slug]` | Hoop wall index; category pages open with a big hoop + serif intro, swatch-card gallery, "start from this item" CTA that opens the Atelier / quote with item prefilled |
| `/style-gallery`        | Filterable swatch-card wall with lightbox (keyboard + focus trap)                                      |
| `/font-lettering-guide` | Specimen cards; where a font maps to an Atelier style, a "try it" button loads it in the Atelier      |
| `/thread-color-chart`   | The spool rack as the page; click a spool, see it stitched live                                         |
| `/pricing`              | Prices as hang tags on a line; honest, scannable                                                        |
| `/how-it-works`         | Stitched path with the 4 steps, FAQ in the new accordion                                                |
| `/about`                | Arched portrait, Mary Ann's words, her workshop details; no invented facts                              |
| `/request-a-quote`      | Same fields and Worker behaviour; reskinned; reads Atelier params, shows a small live preview          |
| `/clearance`            | Tag cards, Stripe links stay plain `<a>` (no cart)                                                      |
| `/thank-you`, `/404`    | Delight moments: thread being tied off; a loose thread/needle 404                                       |
| legal pages             | Calm, readable, same system                                                                             |

## Hard rules (do not break)

1. **Sanity-first.** Every visible string comes from Sanity. Code may hold rendering logic
   (which font backs which Atelier style), never copy. Labels/option names live in the new
   `atelierSettings` document (see content model below). Fallback strings in code are only for
   a missing document and must be short and neutral.
2. **No fabrication.** No invented reviews, years in business, client names, prices, order
   counts, awards, or claims. Use facts already in Sanity/the repo docs: home-based, St.
   Matthews SC, started as a hobby about three years ago, orders go straight to Mary Ann, no
   team, hand-stitched locally. Persuasion comes from craft, clarity and delight, not
   made-up proof.
3. **Accessibility gate stays PERFECT** (Lighthouse accessibility 100 on every route; axe in
   Playwright). The canvas gets a text alternative and the controls are real labelled form
   controls operable by keyboard. Respect reduced motion. Focus rings visible. 44px tap
   targets (PR #72 work must not regress). Reflow at 320px, no horizontal scroll.
4. **Performance:** hero text and layout must paint without waiting for fonts/canvas (LCP is
   text). Load Atelier lettering fonts lazily. No render-blocking additions. Lighthouse
   performance should stay in the green on mobile. The canvas pauses when off-screen.
5. **No dark-mode toggle, no Web3Forms, no cart/checkout, no secrets in the repo** (see CLAUDE.md).
6. **PORTABLE files** (first lines say `PORTABLE:`) are owned by the starter; do not edit them.
7. **Tailwind v4 gotchas** in the rules files (e.g. `max-w-xs` is tiny here) apply.
8. **Never rewrite files with PowerShell Get-Content/Set-Content** (mojibake). Use the editor
   tools. Helper scripts containing backslashes are written to a file, not passed in a heredoc.
9. Prose: no em-dashes in copy you write.
10. Do not run git commit/checkout/branch/stash or push. Nathan's main session owns git.
    Several agents work in this same working tree at once on DISJOINT files; touch only the
    files in your brief (create new files freely under your own folders). Format only your own
    files with the repo prettier. If you must touch a file outside your list, stop and say so.
11. Dev servers: use your own port (`npm run dev -- --port <yours>`), not 4321.

## Content model additions (Sanity)

New singleton `atelierSettings` (Studio desk: under the existing singletons, plain-language
labels for Mary Ann like the other pages):

- `eyebrow`, `headline`, `subhead` (section copy for the full studio)
- `initialsLabel`, `initialsHint`, `styleLabel`, `threadLabel`, `fabricLabel`
- `styles[]`: `{ key: 'classic'|'script'|'block'|'circle'|'single', label, blurb }`
- `fabrics[]`: `{ key, label, color (hex), note }` (linen, navy canvas, cotton, blush, sage, etc.)
- `sampleMonograms[]`: strings used by the hero cycle (e.g. initials only; no real people's names)
- `replayLabel`, `ctaLabel`, `disclaimer` (the "preview, Mary Ann confirms your proof" line)
- `heroTryLabel`, `heroPlaceholder`

`homePage` gets new optional fields for the new sections (marquee label, hoop-wall copy,
maker pull-quote, studio-wall copy, final CTA lines); existing fields keep working so the
live Studio never breaks. Seed through a script (`scripts/seed-atelier.mjs`): backup first,
dry run, write, verify read-only. Never run `seed-core.mjs` (see memory).

## Engine contract (other work codes against this)

```ts
// src/lib/atelier/engine.ts
export type StyleKey = 'classic' | 'script' | 'block' | 'circle' | 'single';
export interface Design {
  text: string; // 1 to 3 characters, uppercase handled inside
  style: StyleKey;
  thread: string; // hex, e.g. '#8c3a2e'
  fabric: string; // hex of the fabric ground
  fabricTexture?: 'linen' | 'canvas' | 'cotton' | 'terry';
}
export interface AtelierOptions {
  reducedMotion?: boolean;
  quality?: 'hero' | 'studio'; // hero = cheaper
  onProgress?: (p: number) => void;
}
export function createAtelier(
  canvas: HTMLCanvasElement,
  opts?: AtelierOptions,
): {
  setDesign(d: Partial<Design>, opts?: { animate?: boolean }): Promise<void>;
  replay(): Promise<void>;
  toBlob(type?: string): Promise<Blob>;
  pause(): void;
  resume(): void;
  destroy(): void;
};
```

Component wrapper: `src/components/atelier/AtelierStage.astro` (canvas, a11y text, no-JS
fallback) and `src/components/atelier/AtelierStudio.astro` (controls + stage + spool rack).
Both take all strings as props. Lettering fonts load lazily inside the engine.

## Definition of done

`npm run check:full` green, `npm test` (smoke/axe/reflow) green on chromium + webkit-iphone,
render parity baselines intentionally regenerated, `npm run format:check` clean, docs
(CLAUDE.md status, `.claude/rules/*`, `docs/02-design-system.md`, `docs/07`, `docs/PENDING.md`)
updated, DESIGN.md/PRODUCT.md if present, a vault decision-log line, PR with green `build`
and `test`, live site verified after merge.
