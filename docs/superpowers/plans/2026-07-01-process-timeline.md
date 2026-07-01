# Interactive Process Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Home's static numbered-circle process grid with the existing (but currently unused) `ProcessStep.astro` component's connector-threaded timeline treatment, correcting its 4 wrong-brand illustration icons to embroidery-appropriate ones, and fix the same connector-thread animation on `/how-it-works` where it's currently silently broken.

**Architecture:** No new components — `ProcessStep.astro`/`ProcessStepIllustration.astro` already exist and already use the correct, working `.step-connector::after` CSS/JS animation system (`BaseLayout.astro`'s `IntersectionObserver` + `globals.css`'s pseudo-element transform). This plan corrects `ProcessStepIllustration.astro`'s icon content, wires `ProcessStep.astro` into `index.astro` (mapping Sanity's `{number, label, body}` field shape onto the component's `{stepNumber, title, shortDescription}` props), and fixes `how-it-works.astro`'s duplicated, broken inline connector markup.

**Tech Stack:** Astro 6, inline SVG, existing Tailwind tokens.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-process-timeline-design.md`.

---

### Task 1: Replace `ProcessStepIllustration.astro`'s 4 icons

**Files:**
- Modify: `src/components/ProcessStepIllustration.astro`

- [ ] **Step 1: Read the current file to confirm nothing has changed**

Run: `cat src/components/ProcessStepIllustration.astro`
Expected: 4 conditional blocks (`{stepNumber === 1 && (...)}` through `4`), each a `<svg viewBox="0 0 48 48" ...>` with `stroke="var(--color-tertiary)"`, depicting (in order) a notebook+coffee cup, a moodboard, a shopping bag with hangtag, and a room with sofa/lamp/keys. If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Replace the entire file with corrected icons**

Replace the full contents of `src/components/ProcessStepIllustration.astro` with:

```astro
---
// Safe to edit by hand
// Inline line illustrations above each Process step. Quiet single-stroke
// drawings in Mustard Gold, sized at ~3rem square. Four variants keyed by
// stepNumber (1-4), matching MAS Monograms' actual 4-step process (Browse,
// Request, Quote, Stitch). Step numbers outside that range render nothing
// so the layout falls back to the original numeral-only treatment.
//
// Built as inline SVG with no external deps so they're zero-cost on the
// performance budget. Keep strokes thin (1.5) and palette restrained —
// these are signposts, not main events. Step 4's icon deliberately reuses
// the hoop-ring motif (two concentric circles) already established for
// photo frames elsewhere on the site.

interface Props {
  stepNumber?: number;
  /** Optional decorative class override. */
  class?: string;
}

const { stepNumber, class: className = '' } = Astro.props as Props;
---

{stepNumber === 1 && (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="var(--color-tertiary)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class:list={['block', className]}
  >
    {/* Step 1 — Browse: a folded garment (t-shirt) outline. */}
    <path d="M17 8 L14 12 L8 15 L11 21 L14 19 V40 H34 V19 L37 21 L40 15 L34 12 L31 8 H17Z" />
    <path d="M17 8 Q24 13 31 8" />
  </svg>
)}

{stepNumber === 2 && (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="var(--color-tertiary)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class:list={['block', className]}
  >
    {/* Step 2 — Request: a simple form with text lines and a pencil mark. */}
    <rect x="8" y="7" width="26" height="34" rx="2" />
    <path d="M13 15 H29" />
    <path d="M13 21 H29" />
    <path d="M13 27 H24" />
    <path d="M32 30 L42 20 a2.1 2.1 0 0 1 3 3 L35 33 L31 34 Z" />
  </svg>
)}

{stepNumber === 3 && (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="var(--color-tertiary)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class:list={['block', className]}
  >
    {/* Step 3 — Quote: a price tag with a punch-hole. */}
    <path d="M6 24 L24 6 H40 a2 2 0 0 1 2 2 V24 L26 42 a2 2 0 0 1 -2.8 0 L6 26.8 a2 2 0 0 1 0 -2.8Z" />
    <circle cx="32" cy="16" r="2.2" fill="var(--color-tertiary)" stroke="none" />
  </svg>
)}

{stepNumber === 4 && (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="var(--color-tertiary)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class:list={['block', className]}
  >
    {/* Step 4 — Stitch: an embroidery hoop (two concentric circles, same
        motif as the site's photo hoop-ring frames) crossed by a needle
        and a trailing thread. */}
    <circle cx="24" cy="24" r="17" />
    <circle cx="24" cy="24" r="12.5" />
    <path d="M12 12 L34 34" />
    <path d="M34 34 L38 38 M34 34 L38 30" />
    <path d="M8 40 Q14 36 18 40 T28 40" />
  </svg>
)}
```

- [ ] **Step 3: Build**

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output (no errors). Nothing imports this file yet, so this just confirms it parses cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProcessStepIllustration.astro
git commit -m "fix: replace ProcessStepIllustration's wrong-brand icons with embroidery-appropriate ones"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 2: Wire `ProcessStep` into `index.astro`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current file's Process section to confirm nothing has changed**

Run: `sed -n '159,195p' src/pages/index.astro`

Expected exactly:

```astro
  {/* ── Process ───────────────────────────────────────────────────────────── */}
  {(page?.processSteps ?? []).length > 0 && (
    <section class="py-section-lg">
      <div class="mx-auto max-w-content px-m">
        <div class="text-center mb-l" data-reveal>
          {page?.processEyebrow && (
            <p class="text-xs uppercase tracking-eyebrow text-link mb-s">{page.processEyebrow}</p>
          )}
          <h2 class="font-display text-h2 text-foreground">{page?.processHeadline ?? 'How It Works'}</h2>
          {page?.processSubhead && (
            <p class="text-foreground/70 mt-s max-w-xl mx-auto">{page.processSubhead}</p>
          )}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-l mt-l" data-stagger-grid>
          {(page.processSteps as any[]).map((step: any, i: number) => (
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-primary text-white font-display text-h4 flex items-center justify-center mx-auto mb-m">
                {step.number ?? i + 1}
              </div>
              <h3 class="font-display text-h4 text-foreground mb-xs">{step.label}</h3>
              {step.body && <p class="text-sm text-foreground/70">{step.body}</p>}
            </div>
          ))}
        </div>
        {page?.processCtaLabel && (
          <div class="text-center mt-l">
            <a
              href={page.processCtaHref ?? '/how-it-works'}
              class="inline-flex items-center gap-xs text-xs uppercase tracking-eyebrow font-semibold text-link hover:text-primary-dark transition-colors"
            >
              {page.processCtaLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  )}
```

If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Add the `ProcessStep` import**

Find the current imports at the top of `index.astro` (should include `import Hero from '@/components/Hero.astro';` and `import StatsRow from '@/components/StatsRow.astro';` from prior phases). Add, alongside them:

```astro
import ProcessStep from '@/components/ProcessStep.astro';
```

- [ ] **Step 3: Replace the grid with a `ProcessStep` list**

Replace only the inner grid block:

```astro
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-l mt-l" data-stagger-grid>
          {(page.processSteps as any[]).map((step: any, i: number) => (
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-primary text-white font-display text-h4 flex items-center justify-center mx-auto mb-m">
                {step.number ?? i + 1}
              </div>
              <h3 class="font-display text-h4 text-foreground mb-xs">{step.label}</h3>
              {step.body && <p class="text-sm text-foreground/70">{step.body}</p>}
            </div>
          ))}
        </div>
```

with:

```astro
        <ol class="space-y-l mt-l">
          {(page.processSteps as any[]).map((step: any, i: number) => (
            <li data-reveal>
              <ProcessStep
                step={{
                  stepNumber: parseInt(step.number, 10) || i + 1,
                  title: step.label,
                  shortDescription: step.body,
                }}
                variant="preview"
                isLast={i === (page.processSteps as any[]).length - 1}
              />
            </li>
          ))}
        </ol>
```

Note: Sanity's `processSteps` field stores `number` as a STRING (e.g. `"01"`), while `ProcessStep.astro`'s `stepNumber` prop expects a real `number` (it does its own `padStart(2, '0')` internally) — `parseInt(step.number, 10) || i + 1` converts it correctly, falling back to the loop index if parsing ever fails. Do NOT pass `step.number` directly.

Everything else in this section (the eyebrow/headline/subhead block above, the `processCtaLabel` link below) stays completely unchanged — only the grid-to-list swap.

- [ ] **Step 4: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors.

Do NOT start a dev server / preview / visual browser check yourself — that verification happens separately after your commit.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: replace Home's static process grid with ProcessStep connector timeline"
```

Create a NEW commit — do not amend any existing commit.

---

### Task 3: Fix `how-it-works.astro`'s broken connector line

**Files:**
- Modify: `src/pages/how-it-works.astro`

- [ ] **Step 1: Read the current file's step-connector markup to confirm nothing has changed**

Run: `grep -n "step-connector" src/pages/how-it-works.astro`

Expected:
```astro
                {i < (page.steps as any[]).length - 1 && (
                  <div class="step-connector hidden md:block w-px flex-1 min-h-[3rem] bg-border-soft relative overflow-hidden mt-2" aria-hidden="true">
                    <div class="absolute inset-0 bg-primary origin-top" style="transform: scaleY(0)"></div>
                  </div>
                )}
```

If this looks substantially different, STOP and report BLOCKED with what you found instead.

- [ ] **Step 2: Replace the broken inline-div connector with the working bare-div pattern**

Change:

```astro
                {i < (page.steps as any[]).length - 1 && (
                  <div class="step-connector hidden md:block w-px flex-1 min-h-[3rem] bg-border-soft relative overflow-hidden mt-2" aria-hidden="true">
                    <div class="absolute inset-0 bg-primary origin-top" style="transform: scaleY(0)"></div>
                  </div>
                )}
```

to:

```astro
                {i < (page.steps as any[]).length - 1 && (
                  <div class="step-connector hidden md:block w-px flex-1 min-h-[3rem]" aria-hidden="true"></div>
                )}
```

`globals.css`'s `.step-connector` base rule already supplies the resting-state line color (`background: var(--border)`) and the `::after` pseudo-element handles the fill animation — the old inline child `<div>` with its own `bg-primary`/`origin-top`/inline `style` was never targeted by that animation system at all, which is exactly why it silently never animated. Removing it and letting the CSS class do its job (as `ProcessStep.astro` already correctly does) fixes this.

- [ ] **Step 3: Build**

Run: `npm run build:full 2>&1 | tail -20`
Expected: `[build] Complete!`, no errors, `/how-it-works` prerenders.

Do NOT start a dev server / preview / visual browser check yourself — that happens in the final verification task.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/how-it-works.astro
git commit -m "fix: correct how-it-works.astro's connector line to use the working animation system"
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

- [ ] **Step 3: Grep for any remaining wrong-brand icon content**

Run: `grep -n "coffee\|moodboard\|hangtag\|sofa\|lamp" src/components/ProcessStepIllustration.astro`
Expected: no matches (all replaced; note "hangtag" specifically — confirm the OLD shopping-bag-with-hangtag icon is fully gone, not left alongside the new price-tag icon).

- [ ] **Step 4: Visual spot-check**

Using dev server or preview tooling:
- Home (`/`): confirm the Process section shows large soft numerals (01-04), a connector thread visibly filling in as you scroll down the list, and 4 icons that read as: a garment (Browse), a form (Request), a price tag (Quote), an embroidery hoop with needle/thread (Stitch) — NOT the old coffee cup/moodboard/shopping bag/sofa icons.
- `/how-it-works`: confirm the connector line between steps now visibly animates (fills downward) as you scroll, rather than staying invisible.
- Confirm both pages' heading hierarchy still reads correctly (Home's steps under an `<h2>`, `/how-it-works`'s steps under their own `<h3>` per step, unchanged from before).

- [ ] **Step 5: Report and push**

Report build/test status. If clean, push to origin/main (live Cloudflare deploy — proceed given delegated authority):

```bash
git push origin main
```
