# Stats/Credibility Strip (Plan 3, Phase B2)

> Design spec. Status: approved under delegated authority ("carry out best judgement... no need to
> wait for me to confirm," 2026-07-01). Second new-component sub-phase of Plan 3 Phase B, following
> B1 (hoop-ring frames + token cleanup, shipped).

## Decisions made without a check-in, and why

- **Reframed "stats/credibility strip" away from vanity metrics.** The original brainstorm idea
  (generic numbers like "500+ happy customers," "4.9 star rating") was never actually approved with
  specific content in mind — and MAS Monograms has no real customer-count or rating data available
  to source honestly. Fabricating numbers to look impressive would be dishonest marketing content
  and directly contradicts the existing project convention of flagging placeholder content rather
  than inventing facts (see [[content-seeded]]'s placeholder-testimonial-name handling). Mary Ann's
  actual brand story — solo, home-based, personally stitches every order, "no team, no warehouse" —
  is itself the differentiator, and a generic big-numbers strip would undercut that intimacy rather
  than reinforce it. So this phase builds the strip using only facts already established in existing
  Sanity content or Plan 2's real catalog data:
  - **"3+ Years Perfecting the Craft"** — sourced from `aboutPage`'s existing copy: "What started as
    a creative hobby three years ago has grown into something I truly love sharing."
  - **"100% Hand-Stitched, By Me"** — sourced from the same About copy's "no team, no warehouse...
    you're talking to the person who will actually stitch your item."
  - **"1 Business Day" (average reply)** — already an existing, real claim in Home's current trust
    bar (`trustItems`: "Reply within 1 business day").
  - **"40+ Thread Colors"** — Plan 2's real import populated 43 `threadColor` documents; rounded
    down to "40+" so the claim stays accurate even if a few colors are later added or removed,
    rather than hardcoding an exact count that could go stale.

  These are all real, defensible claims — nothing here is invented. Still, since I'm choosing the
  exact wording without Nate's review, the seed script writes these as editable Sanity content (not
  hardcoded in the page), so they're one Studio edit away from being corrected if any phrasing
  doesn't sit right with him or Mary Ann.

- **Reused existing, unused components instead of building new ones.** `src/components/StatsRow.astro`
  + `src/components/StatsCounter.tsx` already exist, fully built: animated count-up on scroll into
  view, respects `prefers-reduced-motion`, accessible (`aria-label`), uses only verified-safe tokens
  (`text-primary`, `text-muted-foreground`, `bg-border` divider) — none remapped by the `@theme
  inline` accent trap. They're dead code today (imported nowhere). This phase wires them up rather
  than building a new stats component from scratch — a much smaller, lower-risk change.

## Scope

### 1. Sanity schema — add `statsItems` to `homePage`

New array field in `studio/schemaTypes/homePage.ts`, group `trust` (same group as the existing trust
bar — these are both "quick reassurance" content, grouped together for Mary Ann's editing
convenience):

```ts
defineField({
  name: 'statsItems',
  title: 'Stats strip items',
  type: 'array',
  group: 'trust',
  description: 'Short numeric credibility stats shown as an animated strip below the trust bar. Only use real, verifiable facts — no invented numbers.',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'statItem',
      fields: [
        defineField({ name: 'number', title: 'Number', type: 'number', validation: (R) => R.required() }),
        defineField({ name: 'suffix', title: 'Suffix (optional)', type: 'string', description: 'E.g. "+", "%", "day".' }),
        defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required().max(40) }),
      ],
      preview: { select: { number: 'number', suffix: 'suffix', label: 'label' },
        prepare: ({ number, suffix, label }: any) => ({ title: `${number}${suffix ?? ''} — ${label}` }) },
    }),
  ],
  validation: (Rule) => Rule.max(4),
}),
```

`max(4)` matches `StatsCounter.tsx`'s existing layout (`flex flex-wrap justify-center gap-8`, divider
between each stat) — tested for up to 4 items visually; more would need a design pass this phase
doesn't cover.

### 2. Query — add `statsItems` to `getHomePage()`

Add `statsItems[]{number, suffix, label}` to the GROQ projection in `src/lib/queries.ts`'s
`getHomePage()` function.

### 3. Typegen

Run `npm run typegen` after the schema change to regenerate `sanity.types.ts`.

### 4. Wire `<StatsRow>` into `index.astro`

Placed immediately after the existing Trust bar section (`{(page?.trustItems ?? []).length > 0 &&
(...)}`), before the Category grid section. Both are quick reassurance signals — stacking them
together reads as one cohesive "here's why you can trust this" beat right after the hero, before the
shop-by-item browsing begins.

```astro
<StatsRow stats={page?.statsItems ?? []} />
```

`StatsRow.astro` already handles the empty-array case (`{stats.length > 0 && (...)}`), so no
conditional wrapper is needed at the call site.

### 5. Seed the real stat values

New small, surgical, idempotent patch script (matching the pattern already established for one-off
content patches in this project, e.g. Plan 2's category-image patching) —
`scripts/seed-stats-strip.mjs` — patches ONLY the `statsItems` field on the existing `homePage`
document via `client.patch('homePage').set({ statsItems: [...] }).commit()`. Does NOT re-run the
full `scripts/seed-content.mjs` (which would risk overwriting any other `homePage` field that may
have been hand-edited in Sanity Studio since the original 2026-06-30 seed — using a full-document
reseed here is an unnecessary and riskier tool for a single-field addition).

Seed values (each `_key` a stable string so re-running the script is idempotent):
```js
[
  { _key: 'years', number: 3, suffix: '+', label: 'Years Perfecting the Craft' },
  { _key: 'handstitched', number: 100, suffix: '%', label: 'Hand-Stitched, By Me' },
  { _key: 'reply', number: 1, suffix: '', label: 'Business Day Average Reply' },
  { _key: 'colors', number: 40, suffix: '+', label: 'Thread Colors' },
]
```

## What this phase does NOT do

- Does not change `StatsRow.astro`/`StatsCounter.tsx`'s internals — both are reused as-is.
- Does not add a stats strip to any other page (category pages, About, etc.) — Home only, matching
  the original brainstorm's scope (Home + category pages for Phase B, but stats specifically make
  sense as a homepage-only trust beat, not repeated on every category page).
- Does not attempt to source a real customer/order count or star rating — no such data exists to
  source honestly; this is a deliberate scope boundary, not an oversight.

## Testing

- Visual: build, load Home via local preview server, confirm the stats strip renders between Trust
  bar and Category grid, numbers animate on scroll into view, confirm `prefers-reduced-motion`
  produces the static final numbers instantly (per `StatsCounter.tsx`'s existing `reduceMotion`
  branch — already built, just confirm it still works once real data flows through it).
- `npm test` (93 existing tests unaffected — no new pure-function surface).
- `npm run build:full` — confirm no errors, `typegen` succeeds, Home prerenders with the new section.
- Confirm the seed script is idempotent: run it twice, confirm the second run produces no diff /
  duplicate array entries (stable `_key`s + `.set()` replaces the whole array atomically).
