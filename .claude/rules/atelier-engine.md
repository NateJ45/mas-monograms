---
paths:
  - 'src/lib/atelier/**'
  - 'src/components/atelier/**'
  - 'src/components/quote/Quote*.astro'
  - 'src/components/thread/**'
  - 'src/components/home/HomeHero*.astro'
---

# The Monogram Atelier (live embroidery engine)

Loads when you touch the engine, its stage components or a script that drives it. Brief:
`docs/superpowers/specs/2026-10-04-atelier-direction.md`. The engine is the site's one
standout feature: visitors type initials and watch them stitched onto a woven fabric in real
thread colours. It exists because Mary Ann's product photos are weak, so the site makes its own.

## Architecture (`src/lib/atelier/`)

Pipeline for one design (header of `engine.ts` is the source of truth):

```
layout.ts     lettering -> label map (1..n = one element each); needs a DOM canvas, MAIN thread, sliced
field.ts      coverage, distance transform, tensor stitch-direction field, padded relief, sewing order
columns.ts    satin COLUMN direction from the medial axis (thin, prune spurs, cut bent tails, trust test)
stitches.ts   satin rows (straight edge-to-edge rays on the top layer), tatami split, fuzz, running ring
geometry.ts   field + stitches glued together; typed arrays only
raster.ts     each stitch shaded as a lit cylinder of thread into L (light) / S (sheen) / A (coverage) buffers
color.ts      thread palette applied to the buffers (colorize); LINEAR-light shading, sRGB hex in and out
fabric.ts     procedural woven shade map (linen, canvas, cotton, terry), tinted by the fabric hex
compose       fabric x ambient shadow x contact shadow (cached "base"), then thread, then needle / glint
```

- **Worker split.** `compute.ts` runs `geometry.ts` and `fabric.ts` in a dedicated module worker
  (`atelier.worker.ts`, one per engine, created on first use). A newer design supersedes an older one
  by TERMINATING the busy worker; the superseded call resolves null. If a worker cannot start or crashes
  (`workerBroken`), the same pure code runs on the main thread in short slices (`slicer`, `yieldTask`,
  which prefers `scheduler.yield`, else a `MessageChannel`, never `setTimeout`).
- **Main-thread budget.** Everything left on the main thread is cut into slices of about 8 to 10ms
  (layout between elements, rasterise 64 stitches per slice when finishing, colour in row bands). In the
  animation loop the rasteriser stops after a 6ms frame budget. No single task should block input.
- **Satin columns (2026-10-04).** The top satin layer is laid like a digitiser's columns. `columns.ts`
  thins each element to its medial axis (Zhang and Suen), prunes serif and bracket spurs (all spurs of a
  round together), cuts the bent tail thinning runs into a serif corner (`trimEnds`: last sharp corner
  within 2.2 stroke radii of the end), blanks a zone of half a stroke radius round every junction, and
  then TRUSTS an axis cell only when it is a true cross-section (coherent tangent, the square chord about
  twice the edge distance, the chord along it longer). Tangents are measured twice, the second time
  without untrusted cells in the window, so a stem is not tilted by the bend at its end. Straight runs are
  snapped to one direction and collinear runs (a leg cut by a crossbar) merged (`settleRuns`); runs shorter
  than 0.6 radii stop steering. Then the columns are LAID, not flooded (`sweepColumns`, second pass
  2026-10-04): each straight column is fitted (`fitColumn`: centre line, span, half-width as a linear
  function along it, so a wedge leg is one parallelogram) and sweeps square rays from its centre line,
  capped at 1.25 half-widths, over its axis span (core) and on past each end for 3 stroke radii
  (extension, so the junction zones that broke its axis are bridged); a long gap inside a merged column (a
  thin bar cut by the stem it crosses) counts as extension, not core. Curved columns cast one ray per axis
  cell. A cell goes to a core before an extension, then to the column whose centre line it is nearest
  relative to its half-width (the mitre); an extension of a clearly heavier stroke (1.3x) competes with a
  lighter one's core on that score, so heavy strokes run through. Pointed tips (`findTips`: an axis stub
  that narrows to a point at a free end and runs into a junction, the apex of an A, the corners of an M)
  and columns lying mostly inside another column's extension are dropped, so the strokes run on to the
  point and mitre there. A last loose pass lets every column's rays run on to the element edge (brackets,
  flared corners); anything still unclaimed is flooded from its neighbours. The field is blurred only 1
  cell (`geometry.ts`), and keeps the unblended directions as `field.raw` (`sampleCell`).
  `fillRegions({ rays: true })` lays each row as one straight thread, starting in its column's own
  (raw) direction; it carries on through the mitre blend (coherence under 0.9, at most 2.5 rows) and
  stops where the other column's direction is clear, at the edge, or where it would cross a row more than
  0.3 rad off, then TUCKS 0.7 rows on under the other column so no fabric shows. Those ends are flagged
  in `Stitches.cap` (bit 0 start, bit 1 end; `orderStitches` swaps them on a flip) and `raster.ts` skips
  the needle-hole shading on them, so a mitre is no longer a dark line. Gap rows may start on a mitre in
  their raw direction (the point of a V-shaped mitre), gaps are seeded at 0.68 rows, and a bridging pass
  probes 0.75 rows off every row to fill seams between two families of parallel rows. Debug:
  `columnField(..., { why })` fills a reason code per axis cell (6 = dropped tip or covered column). The
  underlay still uses the old streamlines (`rays` off).
- **Pure vs DOM.** `color`, `noise`, `field`, `columns`, `stitches`, `geometry`, `raster`, `fabric` are pure (typed
  arrays) and unit-tested without a DOM (`src/lib/atelier/atelier.test.ts`, run by `npm run test:unit`).
  `layout.ts`, `fonts.ts`, `compute.ts` and `engine.ts` are browser-only.
- **Determinism.** Randomness is seeded from the design key (`noise.ts`), so replay, recolour and
  `toBlob` reproduce the same stitches. Do not use `Math.random` in the pipeline.
- **Fonts are lazy.** `fonts.ts` loads each face once through `FontFace` + `document.fonts.add`,
  from `@fontsource/great-vibes`, `@fontsource/playfair-display` (700, 700 italic) and
  `@fontsource/cinzel` (700, 900) woff2 files imported with `?url`. Nothing is global CSS, so pages that
  never show the Atelier never download them, and the hero text paint never waits on them. Style to face:
  classic = Playfair, script and single = Great Vibes, block = Cinzel 900, circle = Cinzel 700 (`STYLE_FACE`
  in `layout.ts`). This is rendering logic, not copy: labels and blurbs come from Sanity.

## API

```ts
createAtelier(canvas, { reducedMotion?, quality?: 'hero' | 'studio', onProgress? }) => {
  setDesign(partial, { animate? }): Promise<void>;  // latest call wins at every stage
  replay(); toBlob(type?); pause(); resume(); destroy();
  getDesign(): Design;                               // extra, beyond the spec contract
}
Design = { text (1-3 chars, uppercased and filtered inside), style, thread hex, fabric hex, fabricTexture? }
```

- `setDesign` normalises: bad hex falls back to the previous value, unknown style or texture is ignored.
- **Colour-only change** (thread or fabric, same text and style) recolours in place: no relayout, no
  restitch, instant. A colour change made while a design is still being prepared is folded into that run.
  New text or style stitches (about 2.5 to 3.6s, longer with more letters) and ends with a glint sweep.
- `animate` defaults to true for a new piece or new lettering. `prefers-reduced-motion` (or
  `reducedMotion: true`) skips animation and shows the finished piece.
- `quality: 'hero'` is cheaper (backing store capped at 640x640 px area, dpr 1.5, coarser thread);
  `'studio'` caps at 1600x1200, dpr 2. Tune in `CAPS` in `engine.ts`.
- `pause()` / `resume()` stop and restart the rAF loop; stages call them from an IntersectionObserver.

## Components

- `AtelierStage.astro`: the canvas. Renders a fabric-coloured block with the initials as plain text first
  (so layout and LCP never wait on the engine), then fades the canvas in over it after the first frame.
  Props: `text style thread fabric fabricTexture quality label aspect id autoplay lazy class`. Keep the
  canvas `aria-label` (the text alternative) in step with the design.
- `AtelierStageScript.astro`: shared client wiring, de-duplicated by Astro. Imports the engine when a
  stage comes within 300px of the viewport, or on idle after load (4s timeout) if the stage is rendered;
  starts stitching within 120px; pauses off-screen. A stage that is `display:none` is never imported
  until it shows. **`lazy` (prop, `data-lazy="true"`) drops the idle path** so the engine only loads on
  approach. `QuotePreview` passes `lazy` (its stage is hidden until initials arrive; a hidden stage was
  already skipped on idle, and `lazy` also keeps a revealed but off-screen preview from loading on idle).
  `tests/atelier-consumers.spec.ts` proves the engine and worker are never fetched on `/request-a-quote`
  without initials. Element contract: `el.__atelier`, `atelier:ready`, `atelier:progress`.
- `HeroAtelierStage.astro`: same markup, but NO `AtelierStageScript`. `HomeHeroScript` starts the engine
  after the first interaction or about 2.6s after load and fonts, so the stitching never competes with
  the headline (the LCP). It cycles the sample monograms ONCE, then rests; it holds while hovered,
  focused, off-screen or in a hidden tab; typing takes over; reduced motion shows one finished piece.
  WCAG 2.2.2: a Pause/Play button (`[data-hero-pause]`, labels `atelierSettings.pauseLabel`/`playLabel`)
  shows only while the cycle runs; Pause holds the cycle and calls `atelier.pause()`, Play resumes.
- `AtelierStudio.astro` + `AtelierStudioScript.astro` + `atelierStudioData.ts`: the full section on `/`
  (all controls, spool rack, status line `aria-live`, "Request this monogram" link). Initials re-stitch
  after a 250ms debounce (Enter at once); thread and fabric recolour in place. Listens for
  `atelier:use-initials` (the hero hands its typed initials over). Reads `?style=<key>` (or the
  `#atelier?style=<key>` hash form) on load and preselects that style if it is one of the rendered radios;
  the font guide's "try it" links use `/?style=<key>#atelier` (`font.atelierStyle`).
- Consumers that drive a stage from outside: `QuotePrefillScript` (the quote preview),
  `ThreadChartScript` (the spool rack on `/thread-color-chart`). A script may also just write the stage's
  `data-*` attributes before the engine has drawn; they are read on first sight and checked again on the
  first frame (`reconcile`). Once `el.__atelier` exists, write data-* AND call `setDesign` with the
  WHOLE design (not just the change): the engine applies the latest call itself, so no `dataset.ready`
  guard or `atelier:progress` reconcile is needed in the consumer (both removed 2026-10-04; proven by
  `tests/atelier-consumers.spec.ts` and `tests/features.spec.ts`, 5 repeats, all green).
- Hand-off URL: `/request-a-quote?initials=..&style=..&thread=..&fabric=..` (contract in
  `.claude/rules/site-routes.md`). The preview is labelled as a preview; Mary Ann confirms lettering in her proof.

## Performance (measured by the perf work, 2026-10-04)

- Moving geometry and fabric into the worker removed the hero engine's long tasks: Lighthouse mobile
  performance 58 to 65 and total blocking time from about 300 to 550ms to about 0 on the home page.
- LCP is still about 6.6s on mobile and is font/CSS bound, not engine bound (the hero text is the LCP);
  a perf pass on fonts and CSS is pending. Do not "fix" it by loading the engine earlier.
- Rules that keep it that way: hero text and layout paint without waiting for fonts or canvas; the engine
  is code-split; no new render-blocking resources; the canvas pauses off-screen; colour changes never
  re-rasterise. Re-measure with `web-perf` / Lighthouse before and after any engine change.

## Tuning knobs

`CAPS` (backing-store size, dpr), `stitchMs` and `glintMs` in `animate()`, the slicer budgets, the stitch
rasteriser batch (24 per frame, 64 per finishing slice), fabric `pitch` (min 2.2px), stitch spacing bands
in `stitches.ts` (guarded by the "stitch spacing stays inside each quality band" unit test), the column
options in `columnField` (prune 1.6, trim 2.2, zone 0.5, minRun 0.6, straightRun 0.985, minCoh 0.85,
maxSection 1.3, ext 3) and in `sweepColumns` (ray cap 1.25 half-widths, heavy 1.3, long gap 2.5
half-widths, covered 60%, tip `sharp` 0.35), the ray settings in `fillRegions` (seam 0.15 rad, cross
0.3 rad, mitre coherence 0.9, blend 2.5 rows, tuck 0.7 rows, gap 0.68 rows, bridge probe 0.75 / clear
0.55 rows), the column field blur (1 cell in `geometry.ts`), and the
hero hold time between samples (`HOLD_MS` 2600 in `HomeHeroScript`).

## Gotchas

- **Never create an engine at module load or on idle for a hidden stage**; `AtelierStageScript` already
  guards `display:none` stages. A second `createAtelier` per stage means a second worker.
- **Do not call `setDesign` in a tight loop expecting every frame to render**: the latest wins and
  superseded work is cancelled (and may terminate the worker), by design.
- **Colour is applied after rasterising.** If you change the shading, change `raster.ts` or `color.ts`
  (and the palette tests), not the compose step, or recolouring will drift from the stitched look.
- **Mitres are visible on purpose.** Block and classic letters are stems, bowls and legs of straight
  satin that butt at crisp mitre lines (since the tuck and the `cap` flags, a faint line, not a dark
  one). What is still not perfect is listed in `docs/PENDING.md` (bracketed feet, the outside of tight
  curves, the odd row-family seam). Judge changes on the fixed test sheet: A M N K S R B F W V X Z and
  MAS KAR BFK AMW JRM, block and classic, on linen (`#efe6d6`/`#8c3a2e`) and navy (`#1c3550`/`#d9b15f`),
  plus script, circle and single, with zoomed crops; count rows shorter than 45% of the local stroke
  width as a rough patchiness number (1072 before the sweep, about 200 after, most of them bridging rows).
  The main-thread FALLBACK runs `columnField` as one step (about 20 to 30ms for a heavy letter in Node,
  geometry 80 to 115ms in total but sliced), so a broken worker can show one task near 50ms; the worker
  path has none (long-task probe on `/` after the sweep: none; Lighthouse home LCP 2.6 to 3.4s on the gzip
  server, TBT 0).
- **Working tree churn:** `engine.ts`, `field.ts` and `stitches.ts` were still being tuned when this file
  was written; the contracts above are stable, the constants are not.
- **Dev servers:** Astro 7 backgrounds `astro dev` when it detects an agent and allows one server per
  project root. Use `ASTRO_DEV_BACKGROUND=1 node node_modules/astro/bin/astro.mjs dev --port <n> --ignore-lock`
  for your own, and give each server its own port. Several dev servers can still clash in
  `node_modules/.vite` (the dependency cache); if a server dies on startup or serves stale chunks, stop the
  others first. Judge the engine in a real browser with the console read, never by curl (gotcha 13).
- **Lenis is gone (2026-10-04, commit f51830f: script, dependency and the hero cue hook) and must not
  return.** The site uses native scroll only; the scroll-tied ThreadLine and the reveals are written for it.
