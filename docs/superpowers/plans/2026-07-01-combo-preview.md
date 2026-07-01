# "Build Your Own" Combination Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight, non-functional "build your own combination" picker to Home — a React island letting visitors click through real item categories, fonts, and thread colors with a live text+swatch summary, ending in a CTA to the real quote form.

**Architecture:** New React island (`ComboPreview.tsx`, `useState`-driven, `client:visible`) + thin Astro wrapper (`ComboPreviewSection.astro`, mirrors the existing `StatsRow.astro`/`StatsCounter.tsx` pairing) + `index.astro` fetches and shapes 3 real data arrays (categories already fetched; fonts and thread colors newly fetched, filtered/curated, and image URLs pre-built server-side via the same `urlFor()` helper `SanityImage.astro` uses internally).

**Tech Stack:** Astro 6, React (existing island pattern), `@sanity/image-url` via `src/lib/sanity.ts`'s `urlFor()`.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-combo-preview-design.md`.

---

### Task 1: Build the `ComboPreview.tsx` React component

**Files:**
- Create: `src/components/ComboPreview.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/ComboPreview.tsx`:

```tsx
import { useState } from 'react';

interface CategoryOption {
  name: string;
  slug: string;
}
interface FontOption {
  name: string;
  previewUrl: string;
  alt: string;
}
interface ThreadOption {
  name: string;
  hex: string;
}

interface Props {
  categories: CategoryOption[];
  fonts: FontOption[];
  threadColors: ThreadOption[];
}

function PickerRow<T>({
  label,
  options,
  selectedIndex,
  onSelect,
  renderOption,
}: {
  label: string;
  options: T[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-xs">
      <legend className="text-xs uppercase tracking-eyebrow text-muted-foreground mb-xs">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-s">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === selectedIndex}
            onClick={() => onSelect(i)}
            className="min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            {renderOption(option, i === selectedIndex)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ComboPreview({ categories, fonts, threadColors }: Props) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [threadIndex, setThreadIndex] = useState(0);

  const category = categories[categoryIndex];
  const font = fonts[fontIndex];
  const thread = threadColors[threadIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-l items-start">
      <div className="flex flex-col gap-l">
        <PickerRow
          label="Item"
          options={categories}
          selectedIndex={categoryIndex}
          onSelect={setCategoryIndex}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center px-m py-s rounded-full border text-sm transition-colors ${
                isSelected ? 'border-primary bg-primary text-white' : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {opt.name}
            </span>
          )}
        />
        <PickerRow
          label="Font"
          options={fonts}
          selectedIndex={fontIndex}
          onSelect={setFontIndex}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center gap-xs px-s py-xs rounded-md border text-sm transition-colors ${
                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
              }`}
            >
              <img src={opt.previewUrl} alt="" aria-hidden="true" width={28} height={28} className="w-7 h-7 rounded object-cover" />
              {opt.name}
            </span>
          )}
        />
        <PickerRow
          label="Thread Color"
          options={threadColors}
          selectedIndex={threadIndex}
          onSelect={setThreadIndex}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 ${
                isSelected ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: opt.hex }}
              title={opt.name}
            />
          )}
        />
      </div>

      <div className="rounded-xl bg-background border border-border p-l flex flex-col items-center text-center gap-m">
        {font && (
          <div className="p-1 bg-secondary rounded-xl">
            <div className="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
              <img src={font.previewUrl} alt={font.alt} width={160} height={160} className="w-40 h-40 object-cover" />
            </div>
          </div>
        )}
        <p className="font-display text-h4 text-foreground">
          {category?.name} · {font?.name} · {thread?.name}
        </p>
        <a
          href="/request-a-quote"
          className="press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s text-xs font-semibold uppercase tracking-[0.18em] rounded-sm bg-[var(--color-rust-cta,#b8492a)] text-white hover:bg-[var(--color-rust-cta-hover,#9c3c20)] transition-colors"
        >
          Get a Quote for This Combination
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output. Nothing imports this file yet, so this only confirms it compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComboPreview.tsx
git commit -m "feat: add ComboPreview React island for the combination picker"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Build the `ComboPreviewSection.astro` wrapper

**Files:**
- Create: `src/components/ComboPreviewSection.astro`

- [ ] **Step 1: Write the wrapper**

Create `src/components/ComboPreviewSection.astro`:

```astro
---
import ComboPreview from './ComboPreview';

interface CategoryOption {
  name: string;
  slug: string;
}
interface FontOption {
  name: string;
  previewUrl: string;
  alt: string;
}
interface ThreadOption {
  name: string;
  hex: string;
}

interface Props {
  categories: CategoryOption[];
  fonts: FontOption[];
  threadColors: ThreadOption[];
}

const { categories, fonts, threadColors } = Astro.props as Props;

const hasEnoughData = categories.length > 0 && fonts.length > 0 && threadColors.length > 0;
---

{hasEnoughData && (
  <section class="bg-tertiary py-section-lg">
    <div class="mx-auto max-w-content px-m">
      <div class="text-center mb-l">
        <p class="text-xs uppercase tracking-eyebrow text-link mb-s">Try It Out</p>
        <h2 class="font-display text-h2 text-foreground">Preview Your Combination</h2>
        <p class="text-foreground/70 mt-s max-w-xl mx-auto">
          Pick an item, a font, and a thread color to see how they might look together.
        </p>
      </div>
      <ComboPreview categories={categories} fonts={fonts} threadColors={threadColors} client:visible />
    </div>
  </section>
)}
```

- [ ] **Step 2: Build**

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComboPreviewSection.astro
git commit -m "feat: add ComboPreviewSection Astro wrapper"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Wire `ComboPreviewSection` into `index.astro`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current file's imports and category-grid section to confirm nothing has changed**

Run: `sed -n '1,25p' src/pages/index.astro`
Expected: imports include `Hero`, `StatsRow`, `ProcessStep`, `SanityImage`, `PortableText`, `CtaBanner`, and a query import block with `getSiteSettings`, `getHomePage`, `getAllItemCategories`, `getPopularCombinations`, `getTestimonials`, `getFeaturedGalleryItems`.

Run: `sed -n '108,121p' src/pages/index.astro`
Expected: the Category grid section's closing (`View all items` link, closing `</div></section>)}`) immediately followed by `{/* ── About / Maker ── */}`.

If either looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Add imports**

Change:

```astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import StatsRow from '@/components/StatsRow.astro';
import ProcessStep from '@/components/ProcessStep.astro';
import SanityImage from '@/components/SanityImage.astro';
import PortableText from '@/components/PortableText';
import CtaBanner from '@/components/CtaBanner.astro';
import {
  getSiteSettings,
  getHomePage,
  getAllItemCategories,
  getPopularCombinations,
  getTestimonials,
  getFeaturedGalleryItems,
} from '@/lib/queries';
```

to:

```astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import StatsRow from '@/components/StatsRow.astro';
import ProcessStep from '@/components/ProcessStep.astro';
import ComboPreviewSection from '@/components/ComboPreviewSection.astro';
import SanityImage from '@/components/SanityImage.astro';
import PortableText from '@/components/PortableText';
import CtaBanner from '@/components/CtaBanner.astro';
import { urlFor } from '@/lib/sanity';
import {
  getSiteSettings,
  getHomePage,
  getAllItemCategories,
  getPopularCombinations,
  getTestimonials,
  getFeaturedGalleryItems,
  getAllFonts,
  getAllThreadColors,
} from '@/lib/queries';
```

- [ ] **Step 3: Fetch fonts and thread colors alongside the existing data**

Change:

```astro
const [siteSettings, page, categories, combos, testimonials, galleryItems] = await Promise.all([
  getSiteSettings(),
  getHomePage(),
  getAllItemCategories(),
  getPopularCombinations(),
  getTestimonials(true),
  getFeaturedGalleryItems(9),
]);
```

to:

```astro
const [siteSettings, page, categories, combos, testimonials, galleryItems, allFonts, allThreadColors] = await Promise.all([
  getSiteSettings(),
  getHomePage(),
  getAllItemCategories(),
  getPopularCombinations(),
  getTestimonials(true),
  getFeaturedGalleryItems(9),
  getAllFonts(),
  getAllThreadColors(),
]);

// ComboPreview data: real categories/fonts/colors, curated to a small,
// visually varied set. Fonts filtered to ones with an actual specimen photo
// (10 of 18 have none — see docs/superpowers/specs/2026-07-01-combo-preview-design.md).
const comboCategories = (categories ?? []).slice(0, 8).map((c: any) => ({
  name: c.name,
  slug: c.slug?.current ?? '',
}));
const comboFonts = (allFonts ?? [])
  .filter((f: any) => f.previewImage?.asset)
  .slice(0, 6)
  .map((f: any) => ({
    name: f.name,
    previewUrl: urlFor(f.previewImage).width(240).auto('format').url(),
    alt: f.previewImage.alt ?? f.name,
  }));
// One color per family for visual variety, in a fixed, real, verified order
// (all 8 names confirmed present in the live threadColor catalog from Plan 2).
const COMBO_THREAD_NAMES = ['Navy', 'Forest Green', 'True Red', 'Purple', 'Bright Gold', 'Charcoal', 'Bright White', 'Bronze'];
const comboThreadColors = COMBO_THREAD_NAMES
  .map((name) => (allThreadColors ?? []).find((c: any) => c.name === name))
  .filter((c: any) => !!c)
  .map((c: any) => ({ name: c.name, hex: c.hexColor }));
```

- [ ] **Step 4: Render `<ComboPreviewSection>` after the Category grid, before About/Maker**

Immediately after the Category grid section's closing `)}` (confirmed in Step 1 to be right before `{/* ── About / Maker ── */}`), add:

```astro

  <ComboPreviewSection categories={comboCategories} fonts={comboFonts} threadColors={comboThreadColors} />
```

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that verification happens separately after your commit.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: wire ComboPreviewSection into index.astro with real font/thread/category data"
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

- [ ] **Step 3: Verify real font/thread data made it into the built HTML**

Run: `grep -o "Preview Your Combination" dist/client/index.html`
Expected: at least one match.

Query the live Sanity dataset to confirm the 8 `COMBO_THREAD_NAMES` genuinely exist (this should already be true from Plan 2, but confirm directly rather than assuming):
```bash
node -e "
import('@sanity/client').then(async ({ createClient }) => {
  const { loadEnv } = await import('./scripts/lib/loadEnv.mjs');
  const env = loadEnv(process.cwd());
  const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
    token: env.SANITY_API_READ_TOKEN ?? env.SANITY_API_WRITE_TOKEN,
    apiVersion: '2026-05-01',
    useCdn: false,
  });
  const names = ['Navy','Forest Green','True Red','Purple','Bright Gold','Charcoal','Bright White','Bronze'];
  const found = await client.fetch('*[_type==\"threadColor\" && name in \$names].name', { names });
  console.log('Found', found.length, 'of', names.length, ':', found);
});
"
```
Expected: `Found 8 of 8`. If any are missing, the `comboThreadColors` array in `index.astro` will silently have fewer than 8 entries (the `.filter((c) => !!c)` drops missing ones) — not a crash, but worth knowing before calling this fully verified.

- [ ] **Step 4: Visual spot-check**

Using dev server or preview tooling, load `/` and confirm:
- The "Preview Your Combination" section renders after the category grid, before "Meet the Maker."
- A default combination is visible immediately (not blank) — first category, first font (with its real photo), first thread color swatch.
- Clicking a different item/font/thread swatch updates the summary panel and text line accordingly.
- The font preview image in the summary panel shows the hoop-ring frame treatment (mustard border) consistent with the rest of the site.
- The "Get a Quote for This Combination" button links to `/request-a-quote`.
- Tab through the picker with the keyboard — confirm focus rings are visible and each button is individually reachable.

- [ ] **Step 5: Report and push**

Report build/test status and what you observed visually. If clean, push to origin/main (live Cloudflare deploy — proceed given delegated authority):

```bash
git push origin main
```
