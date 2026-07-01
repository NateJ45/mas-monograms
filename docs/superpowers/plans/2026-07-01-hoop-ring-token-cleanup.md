# Hoop-Ring Photo Frames & Token Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the mustard-gold "hoop-ring" photo frame treatment (from the original Thread Ledger spec, never implemented) to every photo grid on Home and category pages, and consolidate the one confirmed duplicate legacy token (`bg-muted`/`bg-tertiary`, both Mustard Light) onto a single canonical class.

**Architecture:** Pure markup/class changes to `src/pages/index.astro` and `src/pages/[slug].astro` — no new components, no `@theme` changes. Each photo-bearing card's outer wrapper swaps `border border-border` for `p-1 bg-secondary` (a ~4px Mustard Gold frame), keeping the same `rounded-xl overflow-hidden` radius/clipping.

**Tech Stack:** Astro 6, Tailwind CSS 4 (existing `bg-secondary`/`bg-tertiary` tokens, no new ones).

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-hoop-ring-token-cleanup-design.md`.

---

### Task 1: Apply hoop-ring frames + token cleanup to `index.astro`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current file to confirm nothing has changed**

Run: `sed -n '78,315p' src/pages/index.astro`

Expected: matches the version referenced below — category grid cards (~line 82-104), about/maker section (~line 118), process section (unchanged, no photos), popular combinations cards (~line 208), testimonials (unchanged, no photos), gallery preview (~line 269, ~283).

- [ ] **Step 2: Category grid card — apply hoop-ring frame**

Change:

```astro
            <a
              href={`/${cat.slug?.current ?? ''}`}
              class="group block rounded-xl overflow-hidden border border-border bg-background hover:shadow-lg transition-shadow"
            >
              {cat.cardImage?.asset ? (
                <div class="aspect-square overflow-hidden">
```

to:

```astro
            <a
              href={`/${cat.slug?.current ?? ''}`}
              class="group block rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-lg transition-shadow"
            >
              {cat.cardImage?.asset ? (
                <div class="aspect-square overflow-hidden rounded-[calc(theme(borderRadius.xl)-0.25rem)]">
```

The inner `rounded-[calc(theme(borderRadius.xl)-0.25rem)]` keeps the photo's corners visually nested inside the outer frame's `rounded-xl` (frame radius minus the `p-1` inset, so the corners line up rather than the inner square photo poking out past a rounded outer edge). Leave the "no image" fallback (`<div class="aspect-square bg-tertiary" />`, a few lines below) and the `<p>` label below it completely unchanged — only the `<a>` wrapper's class and the image-container's class change.

- [ ] **Step 3: About/maker section background — token cleanup**

Change:

```astro
  {(page?.aboutHeadline || page?.aboutBody) && (
    <section class="bg-muted py-section-lg">
```

to:

```astro
  {(page?.aboutHeadline || page?.aboutBody) && (
    <section class="bg-tertiary py-section-lg">
```

Do NOT touch the about photo itself (`rounded-2xl overflow-hidden shadow-xl`, no `border`) — per the design spec, this single editorial photo is explicitly out of scope for the hoop-ring treatment.

- [ ] **Step 4: Popular Combinations card — apply hoop-ring frame**

Change:

```astro
            <div class="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow">
              {combo.image?.asset ? (
                <div class="aspect-[4/3] overflow-hidden">
```

to:

```astro
            <div class="bg-background rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {combo.image?.asset ? (
                <div class="aspect-[4/3] overflow-hidden p-1 bg-secondary rounded-xl">
```

Note this one is structured slightly differently from the category grid card: the outer `<div>` here also holds the text content below the image (`<div class="p-m">...</div>`), so the frame goes on the inner image-only container instead of the whole card. Change the closing structure accordingly — the `<SanityImage>` needs its own nested `overflow-hidden` div inside the now-framed container so the frame's padding doesn't get clipped by the image's own `object-cover`:

Full before:
```astro
            <div class="bg-background rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow">
              {combo.image?.asset ? (
                <div class="aspect-[4/3] overflow-hidden">
                  <SanityImage
                    source={combo.image}
                    width={600}
                    height={450}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    class="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div class="aspect-[4/3] bg-bg-soft" />
              )}
```

Full after:
```astro
            <div class="bg-background rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {combo.image?.asset ? (
                <div class="aspect-[4/3] p-1 bg-secondary">
                  <div class="w-full h-full overflow-hidden rounded-sm">
                    <SanityImage
                      source={combo.image}
                      width={600}
                      height={450}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div class="aspect-[4/3] bg-bg-soft" />
              )}
```

Leave the "no image" fallback (`<div class="aspect-[4/3] bg-bg-soft" />`) unchanged — no frame on a placeholder with no photo.

- [ ] **Step 5: Gallery preview masonry — apply hoop-ring frame**

Change:

```astro
              <div class="break-inside-avoid rounded-xl overflow-hidden border border-border">
                <SanityImage
                  source={item.image}
                  width={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  class="w-full h-auto"
                />
              </div>
```

to:

```astro
              <div class="break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary">
                <div class="overflow-hidden rounded-sm">
                  <SanityImage
                    source={item.image}
                    width={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-auto"
                  />
                </div>
              </div>
```

- [ ] **Step 6: Gallery preview section background — token cleanup**

Change:

```astro
  {galleryItems.length > 0 && (
    <section class="bg-muted py-section-lg">
```

to:

```astro
  {galleryItems.length > 0 && (
    <section class="bg-tertiary py-section-lg">
```

- [ ] **Step 7: Verify no other `bg-muted` occurrences remain in this file**

Run: `grep -n "bg-muted" src/pages/index.astro`
Expected: no matches (both occurrences from Steps 3 and 6 were the only two).

- [ ] **Step 8: Build and visually verify**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Using dev server or preview tooling, load `/` and confirm:
- Category grid cards show a visible mustard-gold frame around each photo (not the old thin gray border).
- Popular Combinations card photos show the same mustard frame.
- Gallery preview masonry photos show the same mustard frame.
- About/maker photo is unchanged (still just a soft shadow, no frame, no border).
- The about/maker and gallery-preview section backgrounds render as light Mustard (same color as before — this is a class-name swap, not a color change, so nothing should look different there).

- [ ] **Step 9: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 10: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: apply hoop-ring photo frames and consolidate bg-muted/bg-tertiary on Home"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Apply hoop-ring frame to `[slug].astro`'s category gallery

**Files:**
- Modify: `src/pages/[slug].astro`

- [ ] **Step 1: Read the current file to confirm nothing has changed**

Run: `sed -n '72,95p' "src/pages/[slug].astro"`
Expected: matches the "Gallery — items in this category" section referenced below.

- [ ] **Step 2: Apply the hoop-ring frame**

Change:

```astro
              <div class="break-inside-avoid rounded-xl overflow-hidden border border-border">
                <SanityImage
                  source={item.image}
                  width={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  class="w-full h-auto"
                />
              </div>
```

to:

```astro
              <div class="break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary">
                <div class="overflow-hidden rounded-sm">
                  <SanityImage
                    source={item.image}
                    width={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-auto"
                  />
                </div>
              </div>
```

Identical treatment to Task 1 Step 5, since this is the same masonry pattern duplicated between the two pages.

- [ ] **Step 3: Confirm no `bg-muted` occurrences exist in this file (none expected)**

Run: `grep -n "bg-muted" "src/pages/[slug].astro"`
Expected: no matches (per the design spec's survey, this file never used `bg-muted`).

- [ ] **Step 4: Build and visually verify**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors, all 7 category routes + `/bring-your-own-item` prerendered.

Using dev server or preview tooling, load a category page with several gallery items (e.g. `/tote-bags`) and confirm the gallery masonry photos show the mustard-gold frame, matching Home's gallery preview treatment.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/[slug].astro"
git commit -m "feat: apply hoop-ring photo frame to category page gallery"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `npm run build:full`
Expected: succeeds, no errors, all 21 routes (13 static + 8 category) prerender.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 3: Grep for any remaining `border-border` on the photo containers that were supposed to change**

Run: `grep -n "border border-border" src/pages/index.astro "src/pages/[slug].astro"`
Expected: zero matches on the specific photo-card wrappers touched in Tasks 1-2 (the category grid card, popular-combinations image container, and both gallery masonry items). If any OTHER `border border-border` usage remains (e.g. on a non-photo card like testimonials — `figure class="bg-background rounded-xl border border-border p-l..."`), that's expected and correct — testimonials are explicitly out of scope per the design spec.

- [ ] **Step 4: Grep for zero remaining `bg-muted` in these two files**

Run: `grep -n "bg-muted" src/pages/index.astro "src/pages/[slug].astro"`
Expected: no matches.

- [ ] **Step 5: Visual spot-check**

Using dev server or preview tooling: Home's category grid, Popular Combinations, and gallery preview; one category page's gallery. Confirm consistent mustard-gold framing across all of them, no broken layouts, no missing images.

- [ ] **Step 6: Report and push**

Report build/test status. If clean, push to origin/main (this triggers a live Cloudflare deploy — proceed given delegated authority to complete all phases without confirmation):

```bash
git push origin main
```
