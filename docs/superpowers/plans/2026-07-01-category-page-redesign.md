# Category Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Home's category-grid card into a reusable `CategoryCard.astro` component, then use it to add a real "Explore Other Items" cross-sell section to every category page — fixing genuinely thin pages (`bring-your-own-item` has 0 gallery items today) with real, non-fabricated content.

**Architecture:** One new shared component (`CategoryCard.astro`, a pure extraction of already-live markup) + a refactor of `index.astro`'s existing grid to use it (zero visual change) + a new section on `[slug].astro` using the same component with different data (other categories, not the current one).

**Tech Stack:** Astro 6, existing `SanityImage.astro`, existing `getAllItemCategories()` query.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-category-page-redesign-design.md`.

---

### Task 1: Create `CategoryCard.astro`

**Files:**
- Create: `src/components/CategoryCard.astro`

- [ ] **Step 1: Write the component**

Create `src/components/CategoryCard.astro`:

```astro
---
// Safe to edit by hand
// A single item-category card: hoop-ring-framed image + name, linking to
// /{slug}. Extracted from index.astro's Category Grid section (Phase B1)
// so both Home's grid and category pages' "Explore Other Items" cross-sell
// (Phase C) share one implementation — same markup, same visual treatment.

import SanityImage from '@/components/SanityImage.astro';

interface CardImage {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface Props {
  name: string;
  slug: string;
  cardImage?: CardImage | null;
}

const { name, slug, cardImage } = Astro.props as Props;
---

<a
  href={`/${slug}`}
  class="group block rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-lg transition-shadow"
>
  {cardImage?.asset ? (
    <div class="aspect-square overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
      <SanityImage
        source={cardImage}
        width={400}
        height={400}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  ) : (
    <div class="aspect-square bg-tertiary" />
  )}
  <div class="p-s text-center">
    <p class="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
      {name}
    </p>
  </div>
</a>
```

- [ ] **Step 2: Build**

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output. Nothing imports this file yet, so this only confirms it compiles.

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryCard.astro
git commit -m "feat: extract CategoryCard component from Home's category grid"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Refactor `index.astro`'s Category Grid to use `CategoryCard`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current Category Grid section to confirm nothing has changed**

Run: `sed -n '107,150p' src/pages/index.astro`

Expected exactly:

```astro
  {/* ── Category Grid ─────────────────────────────────────────────────────── */}
  {categories.length > 0 && (
    <section class="py-section-lg">
      <div class="mx-auto max-w-content px-m">
        <div class="text-center mb-l" data-reveal>
          {page?.categoriesEyebrow && (
            <p class="text-xs uppercase tracking-eyebrow text-link mb-s">{page.categoriesEyebrow}</p>
          )}
          <h2 class="font-display text-h2 text-foreground">{page?.categoriesHeadline ?? 'Shop by Item'}</h2>
          {page?.categoriesSubhead && (
            <p class="text-foreground/70 mt-s max-w-xl mx-auto">{page.categoriesSubhead}</p>
          )}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-m" data-stagger-grid>
          {categories.slice(0, 8).map((cat: any) => (
            <a
              href={`/${cat.slug?.current ?? ''}`}
              class="group block rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-lg transition-shadow"
            >
              {cat.cardImage?.asset ? (
                <div class="aspect-square overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                  <SanityImage
                    source={cat.cardImage}
                    width={400}
                    height={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div class="aspect-square bg-tertiary" />
              )}
              <div class="p-s text-center">
                <p class="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                  {cat.name}
                </p>
              </div>
            </a>
          ))}
        </div>
        <div class="text-center mt-l">
          <a href="/shop-by-item" class="inline-flex items-center gap-xs text-xs uppercase tracking-eyebrow font-semibold text-link hover:text-primary-dark transition-colors">
```

(the rest of the section — "View all items" link, closing tags — continues below and is unaffected by this task). If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Add the `CategoryCard` import**

Find `index.astro`'s imports (includes `Hero`, `StatsRow`, `ProcessStep`, `ComboPreviewSection`, `SanityImage`, `PortableText`, `CtaBanner`). Add, alongside them:

```astro
import CategoryCard from '@/components/CategoryCard.astro';
```

- [ ] **Step 3: Replace the inline card markup with `<CategoryCard>`**

Replace:

```astro
          {categories.slice(0, 8).map((cat: any) => (
            <a
              href={`/${cat.slug?.current ?? ''}`}
              class="group block rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-lg transition-shadow"
            >
              {cat.cardImage?.asset ? (
                <div class="aspect-square overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                  <SanityImage
                    source={cat.cardImage}
                    width={400}
                    height={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div class="aspect-square bg-tertiary" />
              )}
              <div class="p-s text-center">
                <p class="font-semibold text-sm text-foreground group-hover:text-link transition-colors">
                  {cat.name}
                </p>
              </div>
            </a>
          ))}
```

with:

```astro
          {categories.slice(0, 8).map((cat: any) => (
            <CategoryCard name={cat.name} slug={cat.slug?.current ?? ''} cardImage={cat.cardImage} />
          ))}
```

- [ ] **Step 4: Check whether `SanityImage` is still used elsewhere in this file**

Run: `grep -n "SanityImage" src/pages/index.astro`
Expected: still at least one other usage (about photo, combos images, gallery preview — all untouched by this task). Keep the import.

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that verification happens in the final task.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "refactor: use CategoryCard component in Home's category grid"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Add "Explore Other Items" cross-sell to `[slug].astro`

**Files:**
- Modify: `src/pages/[slug].astro`

- [ ] **Step 1: Read the current file to confirm nothing has changed**

Run: `cat "src/pages/[slug].astro"`

Expected: matches the version with `Hero`, Trust items, Gallery, `CtaBanner` sections, importing `getSiteSettings, getAllItemCategories, getItemCategoryBySlug, getAllGalleryItems` from `@/lib/queries`, fetching `[siteSettings, category, allGallery]` via `Promise.all`. If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Add the `CategoryCard` import and fetch all categories**

Change:

```astro
import type { GetStaticPaths } from 'astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import SanityImage from '@/components/SanityImage.astro';
import CtaBanner from '@/components/CtaBanner.astro';
import { getSiteSettings, getAllItemCategories, getItemCategoryBySlug, getAllGalleryItems } from '@/lib/queries';
```

to:

```astro
import type { GetStaticPaths } from 'astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import CategoryCard from '@/components/CategoryCard.astro';
import SanityImage from '@/components/SanityImage.astro';
import CtaBanner from '@/components/CtaBanner.astro';
import { getSiteSettings, getAllItemCategories, getItemCategoryBySlug, getAllGalleryItems } from '@/lib/queries';
```

(`getAllItemCategories` is already imported — it's used by `getStaticPaths`. No new import needed for the query itself, just fetch it again in the page body since `getStaticPaths` runs in a separate scope.)

- [ ] **Step 3: Fetch all categories and gallery counts for the cross-sell selection**

Change:

```astro
const [siteSettings, category, allGallery] = await Promise.all([
  getSiteSettings(),
  getItemCategoryBySlug(slug),
  getAllGalleryItems(),
]);

if (!category) {
  return Astro.redirect('/404', 307);
}
```

to:

```astro
const [siteSettings, category, allGallery, allCategories] = await Promise.all([
  getSiteSettings(),
  getItemCategoryBySlug(slug),
  getAllGalleryItems(),
  getAllItemCategories(),
]);

if (!category) {
  return Astro.redirect('/404', 307);
}

// "Explore Other Items" cross-sell: every OTHER category, ranked by how
// many real gallery photos are tagged to it (categories with more real
// content to show are more useful cross-sell destinations), capped at 3.
const otherCategories = (allCategories ?? [])
  .filter((c: any) => c.slug?.current && c.slug.current !== slug)
  .map((c: any) => ({
    ...c,
    galleryCount: allGallery.filter((item: any) => item.relatedCategory?.slug?.current === c.slug?.current).length,
  }))
  .sort((a: any, b: any) => b.galleryCount - a.galleryCount)
  .slice(0, 3);
```

- [ ] **Step 4: Add the "Explore Other Items" section between Gallery and `CtaBanner`**

Find the Gallery section's closing `)}` and the `<CtaBanner` call right after it:

```astro
  {/* Gallery — items in this category */}
  {relatedGallery.length > 0 && (
    <section class="py-section-lg">
      <div class="mx-auto max-w-content px-m">
        <h2 class="font-display text-h2 text-foreground text-center mb-l" data-reveal>
          {category.name} Gallery
        </h2>
        <div class="columns-2 sm:columns-3 lg:columns-4 gap-m space-y-m">
          {relatedGallery.map((item: any) => (
            item.image?.asset && (
              <div class="break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary">
                <div class="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                  <SanityImage
                    source={item.image}
                    width={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-auto"
                  />
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )}

  <CtaBanner
    ctaLabel={category?.ctaLabel ?? 'Request a Quote'}
    ctaHref="/request-a-quote"
```

Insert the new section between the Gallery section's closing `)}` and `<CtaBanner`:

```astro
  {/* Gallery — items in this category */}
  {relatedGallery.length > 0 && (
    <section class="py-section-lg">
      <div class="mx-auto max-w-content px-m">
        <h2 class="font-display text-h2 text-foreground text-center mb-l" data-reveal>
          {category.name} Gallery
        </h2>
        <div class="columns-2 sm:columns-3 lg:columns-4 gap-m space-y-m">
          {relatedGallery.map((item: any) => (
            item.image?.asset && (
              <div class="break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary">
                <div class="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                  <SanityImage
                    source={item.image}
                    width={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-auto"
                  />
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )}

  {/* Explore Other Items — cross-sell */}
  {otherCategories.length > 0 && (
    <section class="bg-tertiary py-section-lg">
      <div class="mx-auto max-w-content px-m">
        <h2 class="font-display text-h2 text-foreground text-center mb-l" data-reveal>
          Explore Other Items
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-m max-w-3xl mx-auto" data-stagger-grid>
          {otherCategories.map((cat: any) => (
            <CategoryCard name={cat.name} slug={cat.slug?.current ?? ''} cardImage={cat.cardImage} />
          ))}
        </div>
      </div>
    </section>
  )}

  <CtaBanner
    ctaLabel={category?.ctaLabel ?? 'Request a Quote'}
    ctaHref="/request-a-quote"
```

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors, all 8 category routes (`/tote-bags`, `/towels-linens`, `/hats-caps`, `/shirts-tops`, `/jackets-sweatshirts`, `/baby-kids`, `/home-gifts`, `/bring-your-own-item`) prerendered.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add "src/pages/[slug].astro"
git commit -m "feat: add Explore Other Items cross-sell section to category pages"
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

- [ ] **Step 3: Confirm `/bring-your-own-item` is no longer a bare 3-section page**

Run: `grep -o "Explore Other Items" dist/client/bring-your-own-item/index.html`
Expected: at least one match — confirms the cross-sell section renders even for the category with
zero gallery items.

- [ ] **Step 4: Confirm the current category never appears in its own cross-sell**

For each of the 8 category routes, confirm the category's own name doesn't appear inside the
"Explore Other Items" section's card list (spot-check 2-3 categories rather than all 8):

Using dev server or preview tooling, load `/tote-bags` and `/hats-caps`, inspect the "Explore Other
Items" section on each, confirm neither shows a card linking back to itself.

- [ ] **Step 5: Visual spot-check**

Using dev server or preview tooling:
- `/tote-bags` (has 5 real gallery items): confirm Hero → Trust bar → Gallery → Explore Other Items
  (mustard band) → CTA banner, in that order, with the cross-sell cards showing the hoop-ring frame.
- `/hats-caps` (only 2 gallery items): confirm the page doesn't feel thin — Gallery + Cross-sell
  together give it real substance.
- `/bring-your-own-item` (0 gallery items): confirm Hero → Trust bar → Explore Other Items → CTA
  banner (no empty Gallery section, cross-sell fills the gap).
- Home (`/`): confirm the Category Grid renders identically to before this phase (same 8 cards,
  same hoop-ring frames, same layout) — the `CategoryCard` extraction should be visually invisible.

- [ ] **Step 6: Report and push**

Report build/test status and what you observed visually. If clean, push to origin/main (live
Cloudflare deploy — proceed given delegated authority):

```bash
git push origin main
```
