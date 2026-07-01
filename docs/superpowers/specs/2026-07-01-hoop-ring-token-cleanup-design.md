# Hoop-Ring Photo Frames & Token Cleanup (Plan 3, Phase B1)

> Design spec. Status: approved by Nate (delegated — "carry out best judgement... no need to wait for
> me to confirm," 2026-07-01). First sub-phase of Plan 3 Phase B (Home + all 7 category pages),
> covering the foundation work identified during Phase B's brainstorm before it was interrupted by
> the urgent [[theme-inline-accent-trap]] fix. Later sub-phases (B2 stats/credibility strip, B3
> interactive process timeline, B4 configurator teaser) are separate, later specs.

## Decisions made without a check-in, and why

Nate delegated the remainder of Plan 3 with explicit authorization to proceed without confirmation.
Decisions below were made using the same judgment/caution standard applied earlier in this session
(verify actual computed values before trusting class names, given the `@theme inline` accent trap
already caused two live bugs), not by skipping verification.

- **Token cleanup scope kept conservative.** The original brainstorm considered introducing new,
  more legible Tailwind class names (e.g. `bg-ink`, `bg-parchment`) matching `tokens.css`'s
  human-readable names. Investigation found `tokens.css` is NOT wired into the Tailwind build at all
  (not imported anywhere — `globals.css`'s `@theme`/`@theme inline` blocks are the only functional
  theme source). Introducing new class names would mean touching the `@theme` block again — the
  exact file structure that caused both the hero-scrim bug and the site-wide heading-color bug this
  session. Given that risk, this phase's token cleanup is narrower and lower-risk: consolidate the
  one confirmed duplicate (`bg-muted` and `bg-tertiary` both resolve to the identical Mustard Light
  `#f0e6d2` via different variable chains — verified via `globals.css:24` vs the `@theme inline`
  `--muted`/`:root --muted` chain) onto a single canonical class (`bg-tertiary`, since that name is
  already used more often across the codebase). No new `@theme` entries, no renaming of already-correct
  tokens. This isn't the full "clean, legible names everywhere" vision from the original brainstorm,
  but it's what can be done safely without a human in the loop reviewing a core-file change.
- **Hoop-ring frame color verified, not assumed.** `--color-secondary: #d9a441` (Mustard Gold) is
  declared in the static `@theme` block and confirmed NOT remapped by the `@theme inline` block
  (only `--color-secondary-foreground` is touched there) — verified via direct grep of
  `globals.css` before use. Its own code comment already says "gallery frame accents ONLY,"
  confirming this is exactly the token this feature was always meant to use.

## What "hoop-ring frame" means, concretely

A `p-1 bg-secondary rounded-xl` wrapper around each photo-bearing card's existing inner
`overflow-hidden` container — the Mustard Gold shows as a ~4px even "ring" around the photo, evoking
an embroidery hoop, replacing the current plain `border border-border` (a 1px muted-gray line with
no color story). The inner photo container keeps its existing `rounded-xl overflow-hidden` (or
`rounded-full` for circular cases) — `border-radius: inherit` isn't needed since Tailwind's
`rounded-xl` on both wrapper and inner div at the same radius value already nests visually correctly.
Existing hover treatments (`hover:shadow-lg`, `group-hover:scale-105` on the image) are preserved
unchanged — the frame doesn't replace the hover feedback, just the resting-state border treatment.

**Applies to** (photo containers only, confirmed via the earlier codebase survey):
- `index.astro`: category grid cards (8 cards + "Bring Your Own" card, currently `rounded-xl
  overflow-hidden border border-border` at the outer `<a>` wrapper)
- `index.astro`: gallery preview masonry items (currently `break-inside-avoid rounded-xl
  overflow-hidden border border-border`)
- `index.astro`: Popular Combinations card images (currently `bg-background rounded-xl
  overflow-hidden border border-border` on the image sub-container — borderline case, included since
  it's a genuine product photo, not just a UI card)
- `[slug].astro`: category gallery masonry items (identical pattern to Home's gallery preview)

**Does NOT apply to** (not photos, or a special case with its own established pattern):
- About/maker photo on `index.astro` (`rounded-2xl overflow-hidden shadow-xl`, no `border`) — this
  is a single large editorial photo in a split layout, not a grid-of-many-photos context where a
  hoop-ring's repeated visual rhythm reads as a design system; changing its one-off shadow treatment
  is a judgment call better made alongside the "about/maker split" section's own visual redesign in
  a later Phase B sub-phase, not bundled into this foundational pass.
- Trust bar, process steps, testimonials, thread color chart swatches, font guide previews — no
  photos in Home/category pages' trust/process/testimonial sections; thread-chart/font-guide pages
  are out of this phase's page scope (Home + category pages only).
- `FeaturedTestimonial.astro`'s existing `ring-2 ring-bg` circular avatar treatment — a different,
  already-established pattern for a different context (small circular headshot, parchment-colored
  ring for separation, not a mustard hoop-ring); left as-is, not retrofitted.

## Token cleanup: exact swap list

Every occurrence verified against `globals.css`'s actual resolved values before being included below
(none of these three classes are touched by the `@theme inline` override, so this is purely a
naming-consistency change with zero visual/behavior change):

- `bg-muted` → `bg-tertiary` (both resolve to `#f0e6d2` Mustard Light) — occurrences: `index.astro`
  (about/maker section background, gallery preview section background), `[slug].astro` (none found
  — this file doesn't use `bg-muted`).
- No changes needed to `bg-primary` (Pine Teal, already correct and consistently named), `text-accent`
  (already fixed in the prior commit), `border-border` (Muted, already correct).

## Testing

- Visual: build, load Home and at least 2 category pages (one with many gallery items, one with
  few/none) via the local preview server, confirm the mustard frame renders around every photo grid
  listed above, confirm hover/focus states still work, confirm no visual regression to the About
  photo or non-photo sections.
- `npm test` (93 existing tests, no new test surface — this is markup/class changes only, no new
  pure functions to unit test).
- `npm run build:full` — confirm no errors, all 21 routes (13 static + 8 category) prerender.
