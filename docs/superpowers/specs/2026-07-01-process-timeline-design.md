# Interactive Process Timeline (Plan 3, Phase B3)

> Design spec. Status: approved under delegated authority ("carry out best judgement... no need to
> wait for me to confirm," 2026-07-01). Third new-component sub-phase of Plan 3 Phase B, following
> B1 (hoop-ring frames, shipped) and B2 (stats strip, shipped).

## Decisions made without a check-in, and why

- **`ProcessStep.astro` + `ProcessStepIllustration.astro` are dead code, not "already built and
  ready to reuse" as the earlier scoping survey implied.** Verified via `grep -rl "ProcessStep"
  src/pages/` — zero matches, same unreachable-component pattern already found and fixed twice this
  session (`Hero.astro`/`CtaLink.astro` in Phase A, `SectionRenderer.astro`'s stale prop pass in
  Phase A's follow-up fix). `ProcessStep.astro` itself is well-built and uses the CORRECT
  CSS-driven connector-thread animation (a bare `<div class="step-connector">` relying on
  `globals.css`'s `.step-connector::after` pseudo-element + `BaseLayout.astro`'s
  `IntersectionObserver` toggling `.is-visible` — this is genuinely working, tested machinery, not
  broken). This phase wires it up rather than building something new.
- **`ProcessStepIllustration.astro`'s 4 existing icons don't belong to this business.** They depict
  a notebook+coffee cup ("discovery consultation"), a moodboard, a shopping bag with a hangtag, and
  a room with a sofa/lamp/keys — reads like leftover content from an interior-design or home-goods
  starter demo, not embroidery. Rather than hide this slot or ship visibly wrong iconography, this
  phase replaces all 4 SVGs with new, embroidery-appropriate line icons, matching the existing file's
  exact visual language (48×48 viewBox, `stroke-width: 1.5`, rounded caps/joins, single
  `var(--color-tertiary)` stroke, no fill except one accent dot) so the swap is a content correction,
  not a new visual system:
  - Step 1 (Browse) → a simple folded garment/shirt outline — directly ties to "browsing items to
    order."
  - Step 2 (Request) → a simple form/document with a few text lines and a small pencil mark —
    "submit a request."
  - Step 3 (Quote) → a price tag shape with a small punch-hole — "get your custom price."
  - Step 4 (Stitch) → two concentric circles (an embroidery hoop) crossed by a simple needle-and-
    thread line — deliberately reuses the exact hoop-ring motif from Phase B1's photo frames, tying
    the icon set back to the site's established visual signature rather than inventing an unrelated
    fourth shape.
- **Also fixing `how-it-works.astro`'s broken connector line while touching this exact system.**
  That page's process-step markup hand-rolls its own inline connector
  (`<div class="step-connector ..."><div class="absolute inset-0 bg-primary origin-top"
  style="transform: scaleY(0)"></div></div>`) instead of the bare `<div class="step-connector">`
  `ProcessStep.astro` correctly uses. `globals.css`'s animation targets the `::after` pseudo-element,
  which this inline child `<div>` is not — so the "thread draws downward" animation currently never
  fires on `/how-it-works`; the line sits permanently at `scaleY(0)` (invisible). Since this phase is
  already verifying and relying on the connector-thread system for Home, leaving a second, adjacent,
  silently-broken copy of the same visual motif would be an inconsistency worth correcting while
  already in this code, not a separate unrelated change.

## Scope

### 1. Wire `ProcessStep.astro` into `index.astro`, replacing the static numbered-circle grid

Current Home process section (a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` of plain numbered
circles) is replaced with a vertical `<ol>` of `<ProcessStep step={step} variant="preview"
isLast={i === steps.length - 1} />` calls — mirroring `how-it-works.astro`'s existing `<ol
class="space-y-section-md">` structure (proven, already-working list/spacing pattern), but using
`ProcessStep.astro` instead of that page's own broken inline connector markup.

### 2. Replace `ProcessStepIllustration.astro`'s 4 SVGs

Same file, same component API (`stepNumber` 1-4, `class` override), same viewBox/stroke conventions
— only the `<path>`/`<rect>`/`<circle>` content inside each conditional block changes.

### 3. Fix `how-it-works.astro`'s connector to use the working pattern

Replace its inline `<div class="step-connector hidden md:block ..."><div class="absolute inset-0
bg-primary origin-top" style="transform: scaleY(0)"></div></div>` with a bare `<div
class="step-connector hidden md:block w-px flex-1 min-h-[3rem]" aria-hidden="true"></div>` (same
classes minus the ones that only made sense for the old broken inline-div approach — `bg-border-soft`
`relative overflow-hidden mt-2` become unnecessary once the `::after` pseudo-element handles both the
resting-state line color and the fill animation).

## What this phase does NOT do

- Does not touch `ProcessStep.astro`'s "full" variant behavior (Process page use-case) — no such
  page exists in this project's route table, that code path is simply unused, not a bug to fix.
- Does not change `how-it-works.astro`'s step content/copy, only its connector markup.
- Does not add real hand-drawn/photographed process illustrations — these are simple geometric line
  icons matching the existing file's established, deliberately-plain visual language, not a request
  for bespoke illustration work.

## Testing

- Visual: build, load Home and `/how-it-works` via local preview server. Confirm Home's process
  section now shows large soft numerals, a connector thread between steps that visibly draws
  downward as you scroll, and 4 correct embroidery-themed icons (not the old coffee cup/moodboard/
  shopping bag/sofa). Confirm `/how-it-works`'s connector line now also visibly animates (previously
  static/invisible).
- `npm test` (93 existing tests, unaffected).
- `npm run build:full` — no errors, both pages prerender.
- `prefers-reduced-motion` check: confirm the connector line still renders as a static filled line
  (not stuck at scaleY(0)) under reduced motion, per `globals.css`'s existing
  `@media (prefers-reduced-motion: reduce) { .step-connector::after { transform: scaleY(1) !important; ... } }` rule.
