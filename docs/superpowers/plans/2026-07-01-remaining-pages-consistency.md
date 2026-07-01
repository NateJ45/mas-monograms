# Remaining Pages Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the established hoop-ring photo frame pattern to the 3 remaining pages with genuine photo grids (Style Gallery, Font Guide, Clearance), and consolidate `bg-muted`/`bg-bg-soft` to `bg-tertiary` across all 8 files where they appear (confirmed identical color in every case — zero visual change).

**Architecture:** Pure markup/class changes across 8 existing page files. No new components, no schema changes, no new content.

**Tech Stack:** Astro 6, existing Tailwind tokens (`bg-secondary`, `bg-tertiary`, `--radius-xl`).

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-remaining-pages-consistency-design.md`.

---

### Task 1: Hoop-ring frame on Style Gallery

**Files:**
- Modify: `src/pages/style-gallery.astro`

- [ ] **Step 1: Read the current gallery item markup to confirm nothing has changed**

Run: `sed -n '80,107p' src/pages/style-gallery.astro`

Expected exactly:

```astro
      {items.length > 0 ? (
        <div class="columns-2 sm:columns-3 lg:columns-4 gap-m space-y-m" id="gallery-grid">
          {items.map((item: any) => (
            <div
              class="gallery-item break-inside-avoid rounded-xl overflow-hidden border border-border bg-background"
              data-tags={JSON.stringify(item.tags ?? [])}
            >
              {item.image?.asset && (
                <SanityImage
                  source={item.image}
                  width={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  class="w-full h-auto object-cover"
                />
              )}
              {(item.relatedCategory?.name || item.relatedFont?.name) && (
                <div class="px-s py-xs">
                  {item.relatedCategory?.name && (
                    <p class="text-xs text-foreground/60">{item.relatedCategory.name}</p>
                  )}
                  {item.relatedFont?.name && (
                    <p class="text-xs text-foreground/50 italic">{item.relatedFont.name} font</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
```

If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Apply the hoop-ring frame**

Change:

```astro
            <div
              class="gallery-item break-inside-avoid rounded-xl overflow-hidden border border-border bg-background"
              data-tags={JSON.stringify(item.tags ?? [])}
            >
              {item.image?.asset && (
                <SanityImage
                  source={item.image}
                  width={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  class="w-full h-auto object-cover"
                />
              )}
              {(item.relatedCategory?.name || item.relatedFont?.name) && (
```

to:

```astro
            <div
              class="gallery-item break-inside-avoid rounded-xl overflow-hidden p-1 bg-secondary"
              data-tags={JSON.stringify(item.tags ?? [])}
            >
              {item.image?.asset && (
                <div class="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                  <SanityImage
                    source={item.image}
                    width={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    class="w-full h-auto object-cover"
                  />
                </div>
              )}
              {(item.relatedCategory?.name || item.relatedFont?.name) && (
```

Note: `data-tags` and the `gallery-item`/`break-inside-avoid` classes stay on the OUTER div (used by the client-side filter script and masonry layout) — only the visual frame classes and the new inner wrapper around `SanityImage` change. The caption block (`relatedCategory`/`relatedFont` names) stays exactly where it is, as a sibling after the new inner image wrapper, still inside the outer mustard-framed div — this matches the same "frame wraps image + caption together" structure already used by `CategoryCard.astro`.

- [ ] **Step 3: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/style-gallery.astro
git commit -m "feat: apply hoop-ring photo frame to Style Gallery grid"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Hoop-ring frame + token cleanup on Font Guide

**Files:**
- Modify: `src/pages/font-lettering-guide.astro`

- [ ] **Step 1: Read the current font card markup to confirm nothing has changed**

Run: `sed -n '73,89p' src/pages/font-lettering-guide.astro`

Expected exactly:

```astro
                <div class="group rounded-xl border border-border bg-background overflow-hidden hover:shadow-sm transition-shadow">
                  {font.previewImage?.asset ? (
                    <div class="aspect-square bg-tertiary overflow-hidden">
                      <SanityImage
                        source={font.previewImage}
                        width={300}
                        height={300}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div class="aspect-square bg-tertiary flex items-center justify-center">
                      <span class="font-display text-h2 text-foreground/20">Aa</span>
                    </div>
                  )}
```

If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Apply the hoop-ring frame to the outer card, keep the "Aa" fallback distinct**

Change:

```astro
                <div class="group rounded-xl border border-border bg-background overflow-hidden hover:shadow-sm transition-shadow">
                  {font.previewImage?.asset ? (
                    <div class="aspect-square bg-tertiary overflow-hidden">
                      <SanityImage
                        source={font.previewImage}
                        width={300}
                        height={300}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div class="aspect-square bg-tertiary flex items-center justify-center">
                      <span class="font-display text-h2 text-foreground/20">Aa</span>
                    </div>
                  )}
```

to:

```astro
                <div class="group rounded-xl overflow-hidden p-1 bg-secondary hover:shadow-sm transition-shadow">
                  {font.previewImage?.asset ? (
                    <div class="aspect-square overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
                      <SanityImage
                        source={font.previewImage}
                        width={300}
                        height={300}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div class="aspect-square bg-tertiary flex items-center justify-center rounded-[calc(var(--radius-xl)-0.25rem)]">
                      <span class="font-display text-h2 text-foreground/20">Aa</span>
                    </div>
                  )}
```

Note the "Aa" fallback (no real photo) keeps its own `bg-tertiary` fill color (distinct from the mustard `bg-secondary` frame) but gains the matching inner radius so it nests visually consistently inside the new outer frame, whether or not a given font has a real photo.

- [ ] **Step 3: Consolidate the `bg-muted` occurrence**

Run: `grep -n "bg-muted" src/pages/font-lettering-guide.astro`
Expected: one match — `<div class="mt-l bg-muted rounded-xl p-l text-center" data-reveal>` (the `customFontNote` callout).

Change `bg-muted` to `bg-tertiary` in that line only:

```astro
        <div class="mt-l bg-tertiary rounded-xl p-l text-center" data-reveal>
```

- [ ] **Step 4: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/font-lettering-guide.astro
git commit -m "feat: apply hoop-ring photo frame and consolidate bg-muted on Font Guide"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Hoop-ring frame + token cleanup on Clearance

**Files:**
- Modify: `src/pages/clearance.astro`

- [ ] **Step 1: Read the current product card markup to confirm nothing has changed**

Run: `sed -n '84,106p' src/pages/clearance.astro`

Expected exactly:

```astro
                {/* Image */}
                {primaryImage?.asset ? (
                  <div class="aspect-[4/3] overflow-hidden relative">
                    <SanityImage
                      source={primaryImage}
                      width={600}
                      height={450}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      class="w-full h-full object-cover"
                    />
                    {isSold && (
                      <div class="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <span class="bg-foreground text-background text-xs uppercase tracking-eyebrow font-semibold px-m py-xs rounded-full">
                          {soldLabel}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div class="aspect-[4/3] bg-tertiary flex items-center justify-center">
                    <span class="text-foreground/30 text-sm">No photo</span>
                  </div>
                )}
```

If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Apply the hoop-ring frame to the image area only (this card also has text/price content below, so — unlike Style Gallery/Font Guide — only the image sub-container gets framed, matching the pattern already used for Home's Popular Combinations card)**

Change:

```astro
                {/* Image */}
                {primaryImage?.asset ? (
                  <div class="aspect-[4/3] overflow-hidden relative">
                    <SanityImage
                      source={primaryImage}
                      width={600}
                      height={450}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      class="w-full h-full object-cover"
                    />
                    {isSold && (
                      <div class="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <span class="bg-foreground text-background text-xs uppercase tracking-eyebrow font-semibold px-m py-xs rounded-full">
                          {soldLabel}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div class="aspect-[4/3] bg-tertiary flex items-center justify-center">
                    <span class="text-foreground/30 text-sm">No photo</span>
                  </div>
                )}
```

to:

```astro
                {/* Image */}
                {primaryImage?.asset ? (
                  <div class="aspect-[4/3] p-1 bg-secondary">
                    <div class="w-full h-full overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)] relative">
                      <SanityImage
                        source={primaryImage}
                        width={600}
                        height={450}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        class="w-full h-full object-cover"
                      />
                      {isSold && (
                        <div class="absolute inset-0 bg-background/50 flex items-center justify-center">
                          <span class="bg-foreground text-background text-xs uppercase tracking-eyebrow font-semibold px-m py-xs rounded-full">
                            {soldLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div class="aspect-[4/3] bg-tertiary flex items-center justify-center">
                    <span class="text-foreground/30 text-sm">No photo</span>
                  </div>
                )}
```

Note the sold-out overlay (`absolute inset-0 bg-background/50`) moved down one level, now nested inside the new inner wrapper (which carries `relative` for it to position against) — this keeps the dimming overlay covering exactly the photo area, not the mustard frame padding around it. The "No photo" fallback is unchanged (no frame on a placeholder with no real image, same reasoning as Font Guide's "Aa" tile — though note this fallback tile intentionally does NOT get the inner radius treatment Font Guide's did, since it isn't nested inside an outer frame here; leave it exactly as shown above).

- [ ] **Step 3: Consolidate the `bg-muted` occurrences**

Run: `grep -n "bg-muted" src/pages/clearance.astro`
Expected: three matches — the `paymentNote` box (~line 51), the `pickupNote` box (~line 56), and the disabled Sold Out button (~line 139).

Change all three occurrences of `bg-muted` to `bg-tertiary` in this file. The three lines, verbatim before/after:

```astro
            <div class="bg-muted rounded-xl p-m border border-border-soft">
```
→
```astro
            <div class="bg-tertiary rounded-xl p-m border border-border-soft">
```
(appears twice — for both `paymentNote` and `pickupNote` — change both occurrences)

```astro
                      class="w-full mt-s py-m rounded-md bg-muted text-foreground/40 text-xs uppercase tracking-eyebrow font-semibold cursor-not-allowed"
```
→
```astro
                      class="w-full mt-s py-m rounded-md bg-tertiary text-foreground/40 text-xs uppercase tracking-eyebrow font-semibold cursor-not-allowed"
```

- [ ] **Step 4: Verify no `bg-muted` remains in this file**

Run: `grep -n "bg-muted" src/pages/clearance.astro`
Expected: no matches.

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/clearance.astro
git commit -m "feat: apply hoop-ring photo frame and consolidate bg-muted on Clearance"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 4: Token consolidation on the remaining 4 files

**Files:**
- Modify: `src/pages/pricing.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/thread-color-chart.astro`
- Modify: `src/pages/404.astro`

These 4 files have no photo grids (per the design spec's survey) — only plain class-name swaps, zero visual change (confirmed: `bg-muted`/`bg-bg-soft`/`bg-tertiary` all resolve to the identical `#f0e6d2`).

- [ ] **Step 1: `pricing.astro` — confirm and swap**

Run: `grep -n "bg-muted" src/pages/pricing.astro`
Expected: two matches, both `<section class="bg-muted py-section-lg">` (Add-ons and FAQ section wrappers). If this doesn't match, STOP and report BLOCKED with what you found instead.

Replace every occurrence of `bg-muted` with `bg-tertiary` in this file (both instances of `<section class="bg-muted py-section-lg">` become `<section class="bg-tertiary py-section-lg">`).

Run: `grep -n "bg-muted" src/pages/pricing.astro` afterward — expect no matches.

- [ ] **Step 2: `about.astro` — confirm and swap**

Run: `grep -n "bg-muted" src/pages/about.astro`
Expected: two matches — `<section class="bg-muted py-section-lg">` (Values section) and `<figure class="bg-muted rounded-xl border border-border-soft p-l flex flex-col gap-m">` (testimonial figure). If this doesn't match, STOP and report BLOCKED with what you found instead.

Replace every occurrence of `bg-muted` with `bg-tertiary` in this file.

Run: `grep -n "bg-muted" src/pages/about.astro` afterward — expect no matches.

- [ ] **Step 3: `thread-color-chart.astro` — confirm and swap both `bg-muted` and `bg-bg-soft`**

Run: `grep -n "bg-muted\|bg-bg-soft" src/pages/thread-color-chart.astro`
Expected: two matches — `<div class="mt-l bg-muted rounded-xl p-l" data-reveal>` (matchingNote) and `<div class="mt-m bg-bg-soft rounded-xl p-l border border-[var(--color-secondary,#d9a441)]/20" data-reveal>` (customColorNote). If this doesn't match, STOP and report BLOCKED with what you found instead.

Replace `bg-muted` with `bg-tertiary`, and `bg-bg-soft` with `bg-tertiary`, in this file (two separate class names, both consolidating to the same canonical one).

Run: `grep -n "bg-muted\|bg-bg-soft" src/pages/thread-color-chart.astro` afterward — expect no matches.

- [ ] **Step 4: `404.astro` — confirm and swap**

Run: `grep -n "bg-muted" src/pages/404.astro`
Expected: one match — `hover:bg-muted` inside a secondary button's class list. If this doesn't match, STOP and report BLOCKED with what you found instead.

Change `hover:bg-muted` to `hover:bg-tertiary` in this file.

Run: `grep -n "bg-muted" src/pages/404.astro` afterward — expect no matches.

- [ ] **Step 5: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors, all 21 routes prerender.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/pricing.astro src/pages/about.astro src/pages/thread-color-chart.astro src/pages/404.astro
git commit -m "refactor: consolidate bg-muted/bg-bg-soft to bg-tertiary across remaining pages"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 5: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `npm run build:full`
Expected: succeeds, no errors, all 21 routes prerender.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 3: Confirm zero remaining `bg-muted`/`bg-bg-soft` anywhere in `src/pages/`**

Run: `grep -rn "bg-muted\|bg-bg-soft" src/pages/`
Expected: no matches across the entire `src/pages/` directory.

- [ ] **Step 4: Visual spot-check**

Using dev server or preview tooling:
- Style Gallery (`/style-gallery`): confirm the masonry grid photos show the mustard hoop-ring frame, filter buttons still work (click a filter tag, confirm items show/hide correctly — this task didn't touch the filter script, but confirm it wasn't accidentally broken).
- Font Guide (`/font-lettering-guide`): confirm font cards with real photos show the hoop-ring frame, and fonts without photos still show the "Aa" placeholder tile (distinct treatment, no frame).
- Clearance (`/clearance`): confirm in-stock item photos show the hoop-ring frame, confirm a sold-out item (if any exist in the live data) still shows its dimming overlay correctly positioned over just the photo, not bleeding into the mustard padding.
- Pricing, About, Thread Color Chart, 404: confirm no visual difference from before this phase (same Mustard Light color throughout, just renamed classes).

- [ ] **Step 5: Report and push**

Report build/test status and what you observed visually. If clean, push to origin/main (live Cloudflare deploy — proceed given delegated authority):

```bash
git push origin main
```
