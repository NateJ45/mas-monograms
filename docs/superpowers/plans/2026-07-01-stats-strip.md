# Stats/Credibility Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the existing, unused `StatsRow.astro`/`StatsCounter.tsx` components on Home with a new Sanity-editable `statsItems` field, seeded with real, sourced (not fabricated) credibility facts.

**Architecture:** New Sanity array field on the `homePage` schema → GROQ query addition → `<StatsRow>` rendered on `index.astro` right after the Trust bar → a small, idempotent, single-field patch script seeds real data without touching any other `homePage` content.

**Tech Stack:** Astro 6, Sanity 7/5 Studio schema, `@sanity/client`.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-stats-strip-design.md`.

---

### Task 1: Add `statsItems` schema field

**Files:**
- Modify: `studio/schemaTypes/homePage.ts`

- [ ] **Step 1: Read the current file's Trust strip section to confirm nothing has changed**

Run: `sed -n '71,81p' studio/schemaTypes/homePage.ts`
Expected: the existing `trustItems` field definition (`group: 'trust'`, `of: [defineArrayMember({ type: 'string' })]`, `validation: (Rule) => Rule.required().min(2).max(6)`).

- [ ] **Step 2: Add the new field immediately after `trustItems`**

After the existing `trustItems` field block (ends with `validation: (Rule) => Rule.required().min(2).max(6),\n    }),`), insert:

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

- [ ] **Step 3: Run typegen to regenerate `sanity.types.ts`**

Run: `npm run typegen`
Expected: succeeds, no errors. Confirm via `grep -n "statsItems" src/lib/sanity.types.ts` that the new field appears in the generated `HomePage` type.

- [ ] **Step 4: Commit**

```bash
git add studio/schemaTypes/homePage.ts src/lib/sanity.types.ts
git commit -m "feat: add statsItems schema field to homePage"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Query the new field and wire `<StatsRow>` into `index.astro`

**Files:**
- Modify: `src/lib/queries.ts`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add `statsItems` to `getHomePage()`'s GROQ projection**

In `src/lib/queries.ts`, find `getHomePage()`'s query (starts `*[_type == "homePage"][0]{`). Change:

```
      trustEyebrow,
      trustHeadline,
      trustItems,
      categoriesEyebrow,
```

to:

```
      trustEyebrow,
      trustHeadline,
      trustItems,
      statsItems[]{ number, suffix, label },
      categoriesEyebrow,
```

- [ ] **Step 2: Read `index.astro`'s Trust bar section to confirm nothing has changed**

Run: `grep -n "trustItems" src/pages/index.astro`
Expected: one match — the Trust bar section rendering `(page?.trustItems ?? []).map(...)`. Read the ~10 lines around that match to find exactly where the section's closing `)}`/`</section>` is.

- [ ] **Step 3: Add the `StatsRow` import**

Near the top of `src/pages/index.astro`, alongside the other component imports (e.g. `import Hero from '@/components/Hero.astro';`), add:

```astro
import StatsRow from '@/components/StatsRow.astro';
```

- [ ] **Step 4: Render `<StatsRow>` immediately after the Trust bar section**

Immediately after the Trust bar section's closing (the `)}`  that closes `{(page?.trustItems ?? []).length > 0 && (...)}`), and before the next section (Category grid), add:

```astro
  <StatsRow stats={page?.statsItems ?? []} />
```

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors. Since `statsItems` will be empty at this point (not yet seeded — that's Task 3), `StatsRow`'s own `{stats.length > 0 && (...)}` guard means nothing renders yet; this step only confirms no build/type errors from the wiring itself.

Do NOT start a dev server / preview / visual browser check yourself — real visual verification (with actual seeded data) happens in Task 4, after the seed script runs.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/queries.ts src/pages/index.astro
git commit -m "feat: wire StatsRow component into index.astro after trust bar"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Seed the real stat values

**Files:**
- Create: `scripts/seed-stats-strip.mjs`

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-stats-strip.mjs`:

```js
// scripts/seed-stats-strip.mjs
//
// Patches ONLY homePage.statsItems with real, sourced credibility stats.
// Does NOT touch any other homePage field — deliberately narrower than
// re-running scripts/seed-content.mjs, since that would risk overwriting
// any homePage field hand-edited in Sanity Studio since the original seed.
//
// Idempotent: uses stable _key values and .set() (full-array replace), so
// re-running this script produces no diff and no duplicate entries.
//
// Prerequisites:
//   - PUBLIC_SANITY_PROJECT_ID in .env
//   - SANITY_API_WRITE_TOKEN in .env (Editor permission or higher)

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID is not set. Configure your .env and re-run.');
  process.exit(1);
}
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is not set. A write token is required to run this seed.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-05-01',
  useCdn: false,
});

// Each stat traces to a real, already-established fact — see
// docs/superpowers/specs/2026-07-01-stats-strip-design.md for sourcing.
const statsItems = [
  { _key: 'years', _type: 'statItem', number: 3, suffix: '+', label: 'Years Perfecting the Craft' },
  { _key: 'handstitched', _type: 'statItem', number: 100, suffix: '%', label: 'Hand-Stitched, By Me' },
  { _key: 'reply', _type: 'statItem', number: 1, suffix: '', label: 'Business Day Average Reply' },
  { _key: 'colors', _type: 'statItem', number: 40, suffix: '+', label: 'Thread Colors' },
];

async function main() {
  await client.patch('homePage').set({ statsItems }).commit();
  console.log(`Patched homePage.statsItems with ${statsItems.length} stat(s).`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the seed script**

Run: `node scripts/seed-stats-strip.mjs`
Expected: `Patched homePage.statsItems with 4 stat(s).`

- [ ] **Step 3: Verify idempotency — run it again**

Run: `node scripts/seed-stats-strip.mjs`
Expected: identical output, no error, no duplicate entries (confirm via a quick Sanity query: `node -e "import('@sanity/client').then(async ({createClient}) => { const {loadEnv} = await import('./scripts/lib/loadEnv.mjs'); const env = loadEnv(process.cwd()); const client = createClient({projectId: env.PUBLIC_SANITY_PROJECT_ID, dataset: env.PUBLIC_SANITY_DATASET ?? 'production', token: env.SANITY_API_WRITE_TOKEN, apiVersion: '2026-05-01', useCdn: false}); const doc = await client.fetch('*[_type==\\"homePage\\"][0]{statsItems}'); console.log(JSON.stringify(doc.statsItems, null, 2)); });"` — expect exactly 4 entries, matching the seed script's array, not 8).

- [ ] **Step 4: Build and visually verify with real data**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Using dev server or preview tooling, load `/` and confirm:
- A stats strip renders between the Trust bar and Category grid sections, showing 4 stats.
- Numbers animate (count up) when scrolled into view (or verify computed final values are correct even if the animation itself isn't checked frame-by-frame): "3+ Years Perfecting the Craft", "100% Hand-Stitched, By Me", "1 Business Day Average Reply" (confirm the empty suffix renders as just "1", not "1undefined" or similar), "40+ Thread Colors".
- No console errors.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-stats-strip.mjs
git commit -m "feat: add seed script for real, sourced stats-strip content"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 4: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `npm run build:full`
Expected: succeeds, no errors, all 21 routes prerender.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 3: Confirm real data is live in the built output**

Run: `grep -o "Years Perfecting the Craft\|Hand-Stitched, By Me\|Business Day Average Reply\|Thread Colors" dist/client/index.html`
Expected: all four labels present in the prerendered HTML.

- [ ] **Step 4: Visual spot-check**

Using dev server or preview tooling, confirm the full Home page flow reads correctly: Hero → Trust bar → Stats strip → Category grid → ... — the stats strip should feel like a natural continuation of the trust bar, not an awkward insertion.

- [ ] **Step 5: Report and push**

Report build/test status. If clean, push to origin/main (live Cloudflare deploy — proceed given delegated authority):

```bash
git push origin main
```
