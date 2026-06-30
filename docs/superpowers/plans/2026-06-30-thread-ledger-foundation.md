# Thread Ledger Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MAS Monograms' cream/sage/blush/Playfair design system with the new "Thread Ledger" identity (parchment/ink/pine-teal/rust/mustard palette, Bricolage Grotesque + Work Sans type, a needle-and-thread cross logo), remove the dead/contradictory starter-template scaffolding (dark-mode toggle infrastructure, unused MDX integration, ~19 unused components), and add a Lighthouse CI accessibility gate — so every later page-by-page redesign task builds on a clean, correct foundation.

**Architecture:** This is a tokens-and-infrastructure pass, not a page-by-page redesign (that's a separate later plan). Color and type tokens live in two places that must stay in sync — `src/styles/tokens.css` (the documented, human-editable source) and the `@theme`/`:root` blocks in `src/styles/globals.css` (what Tailwind and shadcn primitives actually consume) — both get updated together. The logo becomes a single inline-SVG Astro component with a `variant` prop instead of a light/dark raster-asset pair swapped at runtime, which also lets us delete the dark-mode bootstrap script entirely. Dead component deletion is verified by grep before and after each deletion, not assumed.

**Tech Stack:** Astro 6, Tailwind CSS 4 (`@theme` blocks, no `tailwind.config`), `@fontsource-variable` self-hosted fonts, GitHub Actions + `@lhci/cli` for the accessibility gate.

---

## Reference

Design decisions implemented here come from `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md` — read it first if anything below seems unmotivated.

Palette (final, contrast-checked):

| Token | Hex |
|---|---|
| Parchment (bg) | `#F7F1E6` |
| Ink (text/headings) | `#2B2420` |
| Muted (secondary text) | `#6B6258` |
| Pine Teal (primary accent/links) | `#1F5C4F` |
| Rust — decorative (large text only) | `#C1542C` |
| Rust — CTA (button backgrounds) | `#B8492A` |
| Mustard Gold (frames/highlights) | `#D9A441` |
| White (cards) | `#FFFFFF` |

Type: Bricolage Grotesque (headings) + Work Sans (body), both self-hosted via `@fontsource-variable`.

---

### Task 1: Delete confirmed-dead components

**Why these and not others:** every component below was checked with a three-way grep (`src/pages`, `src/layouts`, `src/components`, excluding the file's own definition) and has zero live references, OR its only "reference" is a stale code comment, OR its only importer is itself dead (a dead chain). Components that came back with real usage (e.g. `MobileNav`, `HeroBackground`, `ProcessStep`, `StatsRow`, `FinalCta`, `SectionDivider`) are NOT in this list — leave them alone.

**Files to delete:**
```
src/components/AboutPersonal.astro
src/components/BeforeAfterSlider.tsx
src/components/CalendlyInline.tsx
src/components/CaseStudyTOC.tsx
src/components/ContactForm.tsx
src/components/CopyEmailButton.tsx
src/components/FeaturedJournal.astro
src/components/JournalCard.astro
src/components/JournalCategoryChip.astro
src/components/JournalPortableText.tsx
src/components/NewsletterSignup.tsx
src/components/PortableTextStatic.astro
src/components/PostInquiryRoadmap.astro
src/components/PressStrip.astro
src/components/ReadingProgress.astro
src/components/ServiceAreaCue.astro
src/components/ServiceAreaMap.astro
src/components/StickyCTAChip.tsx
src/components/ThemeToggle.tsx
```

- [ ] **Step 1: Verify the list is still accurate (nothing newly wired these up)**

Run:
```bash
for name in AboutPersonal BeforeAfterSlider CalendlyInline CaseStudyTOC ContactForm CopyEmailButton FeaturedJournal JournalCard JournalCategoryChip JournalPortableText NewsletterSignup PortableTextStatic PostInquiryRoadmap PressStrip ReadingProgress ServiceAreaCue ServiceAreaMap StickyCTAChip ThemeToggle; do
  count=$(grep -rl "$name" src/pages src/layouts src/components 2>/dev/null | grep -vE "/$name\.(astro|tsx)$" | wc -l)
  echo "$count $name"
done
```
Expected: every line reads `0 <name>`. If any line is non-zero, stop and inspect that file with `grep -n "<name>" <matching file>` before deleting it — something now depends on it.

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/AboutPersonal.astro src/components/BeforeAfterSlider.tsx src/components/CalendlyInline.tsx src/components/CaseStudyTOC.tsx src/components/ContactForm.tsx src/components/CopyEmailButton.tsx src/components/FeaturedJournal.astro src/components/JournalCard.astro src/components/JournalCategoryChip.astro src/components/JournalPortableText.tsx src/components/NewsletterSignup.tsx src/components/PortableTextStatic.astro src/components/PostInquiryRoadmap.astro src/components/PressStrip.astro src/components/ReadingProgress.astro src/components/ServiceAreaCue.astro src/components/ServiceAreaMap.astro src/components/StickyCTAChip.tsx src/components/ThemeToggle.tsx
```

- [ ] **Step 3: Confirm the build still succeeds**

Run: `npm run build`
Expected: build completes with no "Cannot find module" or similar resolution errors. (This is the real regression check — if anything still imported one of these files, the build fails here, not at the grep step.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused starter-template components

Verified zero live references via grep across src/pages, src/layouts,
and src/components before deletion. Includes ThemeToggle.tsx, which
directly contradicted the no-dark-mode-toggle rule."
```

---

### Task 2: Remove the dead Sonner toast wiring

`CopyEmailButton.tsx` (just deleted in Task 1) was the only component anywhere in `src` that imported `toast` from `sonner`. The `<Toaster />` mount in `BaseLayout.astro` now has no live caller, so it's pure dead weight (a JS island shipped for nothing).

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Confirm no remaining `sonner` consumer**

Run: `grep -rln "from 'sonner'" src`
Expected: only `src/components/ui/sonner.tsx` itself (the shadcn primitive file). No other file should appear.

- [ ] **Step 2: Remove the Toaster import and mount**

In `src/layouts/BaseLayout.astro`, remove this line from the imports:

```astro
import { Toaster } from '@/components/ui/sonner';
```

And remove this block (currently right after the `<BackToTop client:idle />` line):

```astro
    {/* Sonner toast region. Used by CopyEmailButton and ContactForm. Position bottom-right by default. */}
    <Toaster client:idle position="bottom-right" />
```

- [ ] **Step 3: Verify the build still succeeds**

Run: `npm run build`
Expected: succeeds, no unused-import errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "chore: remove dead Sonner toast wiring (no live caller after CopyEmailButton removal)"
```

(Leave `src/components/ui/sonner.tsx` itself in place — it's a vendored shadcn primitive, harmless to keep available for a future feature that genuinely needs a toast.)

---

### Task 3: Remove the unused MDX integration

No `.mdx` files or `astro:content` collections exist anywhere in this repo (verified by `grep -rl "astro:content\|content.config\|\.mdx" src` returning nothing). `@astrojs/mdx` is configured and installed but never used — leftover from the starter template this project was scaffolded from.

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`

- [ ] **Step 1: Remove the `mdx` integration from `astro.config.mjs`**

Change:
```js
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
```
to:
```js
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
```

Change:
```js
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') }), react()],
```
to:
```js
  integrations: [sitemap({ filter: (page) => !page.includes('/404') }), react()],
```

- [ ] **Step 2: Remove the dependency**

```bash
npm uninstall @astrojs/mdx
```

- [ ] **Step 3: Verify the build still succeeds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "chore: remove unused @astrojs/mdx integration"
```

---

### Task 4: Add the new fonts, remove the old ones

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the new fonts, remove the old ones**

```bash
npm uninstall @fontsource/playfair-display @fontsource-variable/dm-sans
npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/work-sans
```

- [ ] **Step 2: Verify versions landed**

Run: `npm ls @fontsource-variable/bricolage-grotesque @fontsource-variable/work-sans`
Expected: both listed with no "missing" or "invalid" errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap Playfair Display + DM Sans for Bricolage Grotesque + Work Sans"
```

(The `@import` lines that actually load these fonts get updated in Task 5, alongside the rest of `globals.css` — committing the dependency swap separately keeps this diff reviewable on its own.)

---

### Task 5: Rewrite `src/styles/tokens.css` with the Thread Ledger palette and type

**Files:**
- Modify: `src/styles/tokens.css` (full rewrite)

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `src/styles/tokens.css` with:

```css
/* =============================================================================
   MAS Monograms: Design Tokens — "Thread Ledger"
   -----------------------------------------------------------------------------
   This file is the single source of truth for color, type, spacing, and radius.
   Change a value HERE and it updates everywhere it is used. Do not hard-code
   these values in component styles; reference the variables instead.

   SAFE TO EDIT YOURSELF: the values (the part after the colon). Tweaking a hex
   code or a font size here is the intended way to adjust the whole site's look.

   CODE, DO NOT RENAME: the variable names, for example --color-rust-cta.
   Components all over the site reference these names. Renaming one quietly
   breaks styling in places you will not think to check.

   Design rationale: docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md
   ========================================================================== */

:root {
  /* ---------------------------------------------------------------------------
     COLOR
     Color story pulled from embroidery floss number cards: parchment paper,
     ink, a deep pine teal as the primary accent, and rust as the one CTA
     color. Rust is split into two shades on purpose — decorative (large text,
     thread-line strokes) and CTA (button backgrounds) — because the same hex
     does not clear WCAG AA in both roles. Do not collapse them into one.
     --------------------------------------------------------------------------- */
  --color-ink: #2b2420;             /* Primary text, headings, the logo needle */
  --color-parchment: #f7f1e6;       /* Default page background, form input fields */
  --color-white: #ffffff;           /* Cards and raised surfaces */
  --color-muted: #6b6258;           /* Secondary text, captions, eyebrows — 5.5:1 on parchment */

  --color-pine-teal: #1f5c4f;       /* Primary accent, links, focus ring — 7.2:1 on parchment */
  --color-pine-teal-dark: #163f37;  /* Pine teal hover/active state */

  --color-rust-decorative: #c1542c; /* Large text (18px+/bold 14px+) and decorative strokes ONLY.
                                        Clears AA for large text on parchment (~4.2:1) but NOT for
                                        small text, and NOT as a background under white text. */
  --color-rust-cta: #b8492a;        /* The ONE button-background color. Darkened from the
                                        decorative shade specifically so white text on top clears
                                        AA with margin (~5.2:1). Use this, not rust-decorative, for
                                        every button/chip background. */
  --color-rust-cta-hover: #9c3c20;  /* CTA hover state */

  --color-mustard: #d9a441;         /* Gallery photo "hoop ring" frames, highlights — decorative
                                        only, do not pair with text without checking contrast */

  /* Semantic aliases. Reference THESE in components where it reads more clearly,
     so the intent survives even if the literal color is retuned later. */
  --color-bg: var(--color-parchment);
  --color-text: var(--color-ink);
  --color-text-soft: var(--color-muted);
  --color-link: var(--color-pine-teal);
  --color-accent: var(--color-pine-teal);
  --color-surface: var(--color-white);
  --color-band: var(--color-mustard);
  --color-border: var(--color-pine-teal);
  --color-cta-bg: var(--color-rust-cta);
  --color-cta-bg-hover: var(--color-rust-cta-hover);
  --color-cta-text: var(--color-white);

  /* ---------------------------------------------------------------------------
     TYPOGRAPHY
     Two families, both self-hosted via @fontsource-variable (no Google Fonts
     runtime dependency):
       Bricolage Grotesque (400/600/700)  headings — characterful sans, no serif
       Work Sans (400/500/600)            body, UI, buttons, navigation
     No script font in the type system — the logo's needle-and-thread cross is
     a hand-built SVG (see src/components/Logo.astro), not a webfont.
     --------------------------------------------------------------------------- */
  --font-heading: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', system-ui, sans-serif;
  --font-body: 'Work Sans Variable', 'Work Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Weights, named so usage stays consistent across components. */
  --weight-body: 400;
  --weight-body-medium: 500;
  --weight-body-semibold: 600;
  --weight-heading: 700; /* Bricolage Grotesque reads best bold at display sizes */
  --weight-heading-medium: 600;

  /* Type scale. Adjust the values, keep the names. */
  --text-xs: 0.75rem;   /* 12px  fine print */
  --text-sm: 0.875rem;  /* 14px  captions, labels */
  --text-base: 1rem;    /* 16px  body default */
  --text-lg: 1.125rem;  /* 18px  lead paragraphs */
  --text-xl: 1.5rem;    /* 24px  sub-headings */
  --text-2xl: 2rem;     /* 32px  section headings */
  --text-3xl: 2.75rem;  /* 44px  page titles */
  --text-4xl: 3.5rem;   /* 56px  hero headings */

  --leading-body: 1.6;        /* generous line-height for body readability */
  --leading-tight: 1.1;       /* headings — Bricolage Grotesque reads tighter than a serif */
  --tracking-eyebrow: 0.08em; /* looser spacing on small uppercase eyebrows/labels */

  /* ---------------------------------------------------------------------------
     SPACING
     One scale, used for padding, gaps, and section rhythm.
     --------------------------------------------------------------------------- */
  --space-1: 0.25rem;  /* 4px  */
  --space-2: 0.5rem;   /* 8px  */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-24: 6rem;    /* 96px  full-section top and bottom padding */

  /* ---------------------------------------------------------------------------
     RADIUS, BORDERS, SHADOW
     --------------------------------------------------------------------------- */
  --radius: 4px;         /* buttons, inputs, cards, chips — slightly squarer than before */
  --radius-lg: 10px;     /* larger panels */
  --border-width: 1px;
  --focus-ring: 0 0 0 3px rgba(31, 92, 79, 0.45); /* pine teal focus ring for keyboard users */
  --shadow-card: 0 2px 10px rgba(43, 36, 32, 0.08);

  /* ---------------------------------------------------------------------------
     LAYOUT
     --------------------------------------------------------------------------- */
  --content-max: 1140px;
  --content-narrow: 720px;
}

/* =============================================================================
   Optional starter base styles
   ========================================================================== */
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: var(--weight-body);
  font-size: var(--text-base);
  line-height: var(--leading-body);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  font-weight: var(--weight-heading);
  line-height: var(--leading-tight);
  color: var(--color-ink);
}

a {
  color: var(--color-link);
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius);
}

.btn-cta {
  display: inline-block;
  background: var(--color-cta-bg);
  color: var(--color-cta-text);
  font-family: var(--font-body);
  font-weight: var(--weight-body-semibold);
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
}
.btn-cta:hover {
  background: var(--color-cta-bg-hover);
}

.btn-secondary {
  display: inline-block;
  background: transparent;
  color: var(--color-pine-teal);
  font-family: var(--font-body);
  font-weight: var(--weight-body-semibold);
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-pine-teal);
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
}

.field {
  background: var(--color-parchment);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  width: 100%;
  box-sizing: border-box;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  padding: var(--space-6);
}

.band {
  background: var(--color-mustard);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: rewrite tokens.css with the Thread Ledger palette and type"
```

(`npm run build` is verified at the end of Task 6, after `globals.css` is updated too — `tokens.css` alone isn't imported anywhere yet to test in isolation; see Task 6 Step 1.)

---

### Task 6: Update `src/styles/globals.css` — fonts, `@theme` tokens, `:root`, remove dark mode

This is the file Tailwind and the shadcn primitives actually read. It must end up consistent with the new `tokens.css` from Task 5.

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Confirm `tokens.css` is actually imported somewhere**

Run: `grep -rn "tokens.css" src`
Expected: at least one `@import` or `import` reference. If `tokens.css` turns out to be unreferenced (i.e. `globals.css` is the only file Tailwind actually consumes and `tokens.css` is purely the human-readable companion documented in its own header), that's fine — `tokens.css` documents intent for hand-editing, `globals.css` is what ships. Note which case you're in; it affects nothing else in this task either way.

- [ ] **Step 2: Replace the font imports**

Change:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource/playfair-display/400.css";
@import "@fontsource/playfair-display/400-italic.css";
@import "@fontsource-variable/dm-sans";
```
to:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/bricolage-grotesque";
@import "@fontsource-variable/work-sans";
```

- [ ] **Step 3: Replace the `@theme` brand-token block**

Change:
```css
@theme {
  /* MAS Monograms palette — Ink / Cream / Sage / Blush */
  --color-primary:      #4a5e4c; /* Sage Dark — links, nav, primary action */
  --color-primary-dark: #3a4d3c; /* Sage Darker — hover states */
  --color-accent:       #2c2c28; /* Ink — headings + body */
  --color-accent-dark:  #1a1a18; /* Ink Dark */
  --color-secondary:    #8a9e8c; /* Sage Mid — borders, muted accents */
  --color-tertiary:     #e8ede8; /* Sage Light — section bands, chips */
  --color-bg:           #faf8f4; /* Cream — primary surface */
  --color-bg-soft:      #f5ede6; /* Blush Light — soft alternating surface */
  --color-border-soft:  #e8ede8; /* Sage Light — faint dividers */
  --color-white-pure:   #ffffff;
  --color-blush:        #c9a48a; /* CTA button — warm, distinct from sage */
  --color-blush-hover:  #b8926e;
  --color-muted-text:   #7a7a72;

  /* Fonts */
  --font-display: "Playfair Display", Georgia, "Times New Roman", serif;
  --font-body:    "DM Sans Variable", "DM Sans", system-ui, -apple-system, sans-serif;
  --font-script:  "Great Vibes", cursive; /* logo SVG only — not loaded as a web font */
  --font-mono:    ui-monospace, "SF Mono", Consolas, monospace;
```
to:
```css
@theme {
  /* MAS Monograms palette — "Thread Ledger": Parchment / Ink / Pine Teal / Rust / Mustard */
  --color-primary:      #1f5c4f; /* Pine Teal — links, nav, primary action */
  --color-primary-dark: #163f37; /* Pine Teal Dark — hover states */
  --color-accent:       #2b2420; /* Ink — headings + body */
  --color-accent-dark:  #1a1512; /* Ink Dark */
  --color-secondary:    #d9a441; /* Mustard — borders, gallery frame accents */
  --color-tertiary:     #f0e6d2; /* Mustard Light — section bands, chips */
  --color-bg:           #f7f1e6; /* Parchment — primary surface */
  --color-bg-soft:      #f0e6d2; /* Mustard-tinted soft alternating surface */
  --color-border-soft:  #e3d7c0; /* faint dividers on parchment */
  --color-white-pure:   #ffffff;
  --color-rust-cta:     #b8492a; /* CTA button — the one button-background color */
  --color-rust-cta-hover: #9c3c20;
  --color-rust-decorative: #c1542c; /* large text / decorative strokes only, see tokens.css */
  --color-muted-text:   #6b6258;

  /* Fonts */
  --font-display: "Bricolage Grotesque Variable", "Bricolage Grotesque", system-ui, sans-serif;
  --font-body:    "Work Sans Variable", "Work Sans", system-ui, -apple-system, sans-serif;
  --font-mono:    ui-monospace, "SF Mono", Consolas, monospace;
```

- [ ] **Step 4: Fix the fluid-heading-size comment and remove the now-dangling `--font-script` reference**

Search `globals.css` for `--leading-headline-tight: 1.1;` — its comment currently reads:
```css
  --leading-headline-tight: 1.1;   /* Playfair Display reads tighter than sans */
```
Change to:
```css
  --leading-headline-tight: 1.1;   /* Bricolage Grotesque reads tight at display sizes */
```

- [ ] **Step 5: Remove the `font-script` utility (no script font in the new system)**

Delete this block entirely:
```css
/* Script font — Great Vibes, used ONLY in the SVG logo file.
   Never load this as a web font; the logo SVG is the canonical form. */
@utility font-script {
  font-family: var(--font-script);
  font-weight: 400;
  font-style: normal;
  font-size: 1.25em;
  line-height: 0.9;
  vertical-align: -0.1em;
  letter-spacing: 0;
}
```

Run: `grep -rn "font-script" src` after deleting it — expected: no matches anywhere (if any page/component used the `font-script` utility class, fix that usage now; it has no replacement because the new logo carries no live script text).

- [ ] **Step 6: Replace the `:root` light-mode semantic tokens**

Change:
```css
:root {
    /* Surfaces — cream page, white cards */
    --background: #faf8f4;
    --foreground: #2c2c28;
    --card: #ffffff;
    --card-foreground: #2c2c28;
    --popover: #ffffff;
    --popover-foreground: #2c2c28;

    /* Brand — sage primary */
    --primary: #4a5e4c;
    --primary-foreground: #ffffff;
    --secondary: #e8ede8;
    --secondary-foreground: #2c2c28;

    /* Muted — blush light surface, muted ink text */
    --muted: #f5ede6;
    --muted-foreground: #7a7a72;

    /* Accent — sage light (subtle hover / focus surface) */
    --accent: #e8ede8;
    --accent-foreground: #2c2c28;

    /* States */
    --destructive: oklch(0.577 0.245 27.325);
    --border: #8a9e8c;
    --input: #e8ede8;
    --ring: #4a5e4c;
    --link: #4a5e4c;
```
to:
```css
:root {
    /* Surfaces — parchment page, white cards */
    --background: #f7f1e6;
    --foreground: #2b2420;
    --card: #ffffff;
    --card-foreground: #2b2420;
    --popover: #ffffff;
    --popover-foreground: #2b2420;

    /* Brand — pine teal primary */
    --primary: #1f5c4f;
    --primary-foreground: #ffffff;
    --secondary: #f0e6d2;
    --secondary-foreground: #2b2420;

    /* Muted — mustard-tinted soft surface, muted ink text */
    --muted: #f0e6d2;
    --muted-foreground: #6b6258;

    /* Accent — mustard light (subtle hover / focus surface) */
    --accent: #f0e6d2;
    --accent-foreground: #2b2420;

    /* States */
    --destructive: oklch(0.577 0.245 27.325);
    --border: #1f5c4f;
    --input: #e3d7c0;
    --ring: #1f5c4f;
    --link: #1f5c4f;
```

- [ ] **Step 7: Update the `--radius`, `--tint-rgb`, and the unused-named brand vars below it**

Change:
```css
    --radius: 0.375rem; /* ~6px — slightly tighter than shadcn default */

    /* Sidebar (reserved for admin contexts) */
    --sidebar: #faf8f4;
    --sidebar-foreground: #2c2c28;
    --sidebar-primary: #4a5e4c;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #e8ede8;
    --sidebar-accent-foreground: #2c2c28;
    --sidebar-border: #8a9e8c;
    --sidebar-ring: #4a5e4c;

    --tint-rgb: 74, 94, 76; /* Sage Dark in RGB for rgba() overlays */

    --primary-accent: #3a4d3c;
    --secondary-accent: #2c2c28;
    --info: #93C5FD;
    --info-foreground: #1E3A5F;
    --success: #86EFAC;
    --success-foreground: #14532D;
    --warning: #FDE68A;
    --warning-foreground: #713F12;
    --error: oklch(0.577 0.245 27.325);
    --error-foreground: #ffffff;
    --outline: #4a5e4c;
}
```
to:
```css
    --radius: 0.25rem; /* ~4px */

    /* Sidebar (reserved for admin contexts) */
    --sidebar: #f7f1e6;
    --sidebar-foreground: #2b2420;
    --sidebar-primary: #1f5c4f;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #f0e6d2;
    --sidebar-accent-foreground: #2b2420;
    --sidebar-border: #1f5c4f;
    --sidebar-ring: #1f5c4f;

    --tint-rgb: 31, 92, 79; /* Pine Teal in RGB for rgba() overlays */

    --primary-accent: #163f37;
    --secondary-accent: #2b2420;
    --info: #93C5FD;
    --info-foreground: #1E3A5F;
    --success: #86EFAC;
    --success-foreground: #14532D;
    --warning: #FDE68A;
    --warning-foreground: #713F12;
    --error: oklch(0.577 0.245 27.325);
    --error-foreground: #ffffff;
    --outline: #1f5c4f;
}
```

- [ ] **Step 8: Delete the entire `.dark { ... }` block**

Find and delete this whole block (it starts with the `/* ---------- Dark mode ------------------------------------ */` comment and ends with the closing `}` of `.dark`):

```css
/* ---------- Dark mode ------------------------------------ */
/* MAS Monograms is a light, warm brand — the .dark class is intentionally
   never toggled at runtime (no ThemeToggle in the Nav). These rules keep
   the CSS cascade complete if something ever adds it. */

.dark {
    --background: #1c1c1a;
    --foreground: #f0ede8;
    --card: #262623;
    --card-foreground: #f0ede8;
    --popover: #262623;
    --popover-foreground: #f0ede8;

    --primary: #8a9e8c;
    --primary-foreground: #1c1c1a;
    --secondary: #2c3328;
    --secondary-foreground: #f0ede8;

    --muted: #262623;
    --muted-foreground: #9a9a92;

    --accent: #2c3328;
    --accent-foreground: #f0ede8;

    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 15%);
    --input: oklch(1 0 0 / 12%);
    --ring: #8a9e8c;
    --link: #8a9e8c;

    --sidebar: #262623;
    --sidebar-foreground: #f0ede8;
    --sidebar-primary: #8a9e8c;
    --sidebar-primary-foreground: #1c1c1a;
    --sidebar-accent: #2c3328;
    --sidebar-accent-foreground: #f0ede8;
    --sidebar-border: oklch(1 0 0 / 15%);
    --sidebar-ring: #8a9e8c;

    --tint-rgb: 138, 158, 140;

    --primary-accent: #8a9e8c;
    --secondary-accent: #f0ede8;
    --info: #93C5FD;
    --info-foreground: #1E3A5F;
    --success: #86EFAC;
    --success-foreground: #14532D;
    --warning: #FDE68A;
    --warning-foreground: #713F12;
    --error: oklch(0.704 0.191 22.216);
    --error-foreground: #ffffff;
    --outline: #8a9e8c;
}
```

This supersedes the old CLAUDE.md "no dark mode toggle" rule by removing the dead-but-present infrastructure entirely, rather than leaving an unused `.dark` block that invites someone to wire up a toggle later. The decision (and why) is documented in `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md` and gets restated in `CLAUDE.md` in Task 12.

- [ ] **Step 9: Fix the `h1`–`h6` base rule's font weight comment**

Change:
```css
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 400; /* Playfair Display reads best at Regular weight */
    color: var(--color-accent);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  /* Italic accent words — use <em> inside headings for the editorial touch */
  h1 em, h2 em, h3 em {
    font-style: italic;
    font-weight: 400;
  }
  .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
    color: var(--foreground);
  }
```
to:
```css
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700; /* Bricolage Grotesque reads best bold at display sizes */
    color: var(--color-accent);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
```

(The `<em>`-inside-headings italic-accent convention and the now-deleted `.dark` heading override both go away — there is no italic cut being used for accent words in Thread Ledger; accent words use a solid pine-teal or rust span instead, per the design spec. If any page currently wraps an accent word in `<em>` inside a heading, that's a page-content fix for the later page-by-page plan, not this task — `grep -rln "<em>" src/pages` to see if any exist, and note them, but don't fix page content here.)

- [ ] **Step 10: Fix the print-mode selector that referenced `.dark`**

Change:
```css
@media print {
  :root,
  .dark {
    --background: white;
```
to:
```css
@media print {
  :root {
    --background: white;
```

- [ ] **Step 11: Run a final sweep for leftover old-brand references**

Run: `grep -rniE "playfair|dm-sans|great vibes|sage|blush|#4a5e4c|#c9a48a|#faf8f4|#2c2c28" src/styles/globals.css`
Expected: no matches. If anything remains, it's an old-token reference this task missed — fix it before moving on.

- [ ] **Step 12: Verify the build**

Run: `npm run build`
Expected: succeeds. This is the real test that `tokens.css` and `globals.css` are both syntactically valid and that nothing else in the codebase broke from the token rename (e.g. a component referencing `--color-blush` directly instead of through a still-valid alias — Task 7 covers fixing the one known case in `Header.astro`).

- [ ] **Step 13: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: apply Thread Ledger tokens to globals.css, remove dark-mode CSS"
```

---

### Task 7: Build the new `Logo.astro` component

Replaces the light/dark raster-asset pair (`logo-light.svg/png`, `logo-dark.svg/png`) with a single inline-SVG component. No runtime theme switching is needed because there's no dark mode — each placement just picks the variant that fits its own background at build time.

**Files:**
- Create: `src/components/Logo.astro`

- [ ] **Step 1: Write the component**

```astro
---
// Foundation, edit with care.
// The Thread Ledger wordmark + needle-and-thread cross, as an inline SVG.
// No runtime theme switching: pick the variant that matches the surface
// this instance sits on at the call site, e.g.:
//   <Logo variant="ink" />        on the parchment header
//   <Logo variant="parchment" />  on the dark-ink footer
//   <Logo mark />                 compact hoop+needle mark only, no wordmark

interface Props {
  /** "ink" (default) for placement on light/parchment surfaces.
   *  "parchment" for placement on dark-ink surfaces (e.g. the footer). */
  variant?: 'ink' | 'parchment';
  /** Render only the compact hoop-ring + needle mark, no wordmark text.
   *  Use for small/square contexts (e.g. a future app icon source). */
  mark?: boolean;
  class?: string;
}

const { variant = 'ink', mark = false, class: className } = Astro.props as Props;

const wordmarkColor = variant === 'parchment' ? '#F7F1E6' : '#2B2420';
const threadColor = variant === 'parchment' ? '#D9A441' : '#B8492A';
const ringColor = '#1F5C4F';
---

{mark ? (
  <svg
    viewBox="0 0 100 100"
    class={className}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="50" cy="50" r="44" fill="none" stroke={ringColor} stroke-width="1.5" stroke-dasharray="3 5" />
    <line x1="50" y1="20" x2="50" y2="68" stroke={wordmarkColor} stroke-width="3.5" stroke-linecap="round" />
    <ellipse cx="50" cy="24" rx="3.5" ry="6" fill="none" stroke={wordmarkColor} stroke-width="2.5" />
    <path d="M30,40 Q50,28 70,40" fill="none" stroke={threadColor} stroke-width="3.5" stroke-linecap="round" />
  </svg>
) : (
  <svg
    viewBox="0 0 420 140"
    class={className}
    aria-hidden="true"
    focusable="false"
  >
    <text x="0" y="52" font-family="'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif" font-weight="700" font-size="42" fill={wordmarkColor} letter-spacing="-0.5">MAS</text>
    <text x="0" y="90" font-family="'Bricolage Grotesque Variable', 'Bricolage Grotesque', sans-serif" font-weight="700" font-size="42" fill={wordmarkColor} letter-spacing="-0.5">MONOGRAMS</text>
    <text x="2" y="114" font-family="'Work Sans Variable', 'Work Sans', sans-serif" font-weight="600" font-size="13" letter-spacing="3" fill={ringColor}>MADE JUST FOR YOU</text>

    <g transform="translate(330,0)">
      <line x1="32" y1="6" x2="32" y2="100" stroke={wordmarkColor} stroke-width="4" stroke-linecap="round" />
      <ellipse cx="32" cy="14" rx="5" ry="9" fill="none" stroke={wordmarkColor} stroke-width="3" />
      <path d="M2,46 Q32,30 62,46" fill="none" stroke={threadColor} stroke-width="4.5" stroke-linecap="round" />
    </g>
  </svg>
)}
```

The caller is always responsible for the accessible name (a wrapping `<a aria-label="...">`, matching the existing pattern in `Header.astro`/`Footer.astro`), so the SVG itself stays `aria-hidden="true"` and never duplicates that text for assistive tech — consistent with the project's "Image immediately adjacent to a heading/label that names the same thing → decorative" rule in the design spec.

- [ ] **Step 2: Verify it typechecks**

Run: `npx astro check`
Expected: no errors referencing `Logo.astro` (errors in other files unrelated to this change are out of scope here — note them but don't fix them in this task).

- [ ] **Step 3: Commit**

```bash
git add src/components/Logo.astro
git commit -m "feat: add Logo.astro — inline-SVG needle-and-thread cross wordmark"
```

---

### Task 8: Wire `Logo.astro` into `Header.astro`, remove the old logo-swap script and hardcoded blush hex

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Remove the old logo imports and `getImage` calls**

Change:
```astro
import { getImage } from 'astro:assets';
import { site } from '@/data/site';
import { Mail, Phone } from 'lucide-react';
import { IconBrandInstagram, IconBrandFacebook, IconBrandPinterest } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
import MobileNav from './MobileNav';
import logoLightAsset from '@/assets/logo-light.svg';
import logoDarkAsset from '@/assets/logo-dark.svg';
import { telHref } from '@/lib/phone';

const logoLightImg = await getImage({ src: logoLightAsset });
const logoDarkImg  = await getImage({ src: logoDarkAsset });
const logoLightSrcset = logoLightImg.src;
const logoDarkSrcset  = logoDarkImg.src;
```
to:
```astro
import { site } from '@/data/site';
import { Mail, Phone } from 'lucide-react';
import { IconBrandInstagram, IconBrandFacebook, IconBrandPinterest } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
import MobileNav from './MobileNav';
import Logo from './Logo.astro';
import { telHref } from '@/lib/phone';
```

- [ ] **Step 2: Replace the logo `<img>` + its inline swap script**

Change:
```astro
    <a
      href="/"
      class="inline-flex items-center hover:opacity-80 transition-opacity"
      aria-label={`${brandName} home`}
    >
      <img
        alt={brandName}
        width={280}
        height={60}
        class="h-12 w-auto"
        loading="eager"
        decoding="async"
        data-theme-logo
        data-logo-light-src={logoLightImg.src}
        data-logo-light-srcset={logoLightSrcset}
        data-logo-dark-src={logoDarkImg.src}
        data-logo-dark-srcset={logoDarkSrcset}
      />
    </a>
    <script is:inline>
      (function () {
        const img = document.querySelector('header img[data-theme-logo]');
        if (!img) return;
        const dark = document.documentElement.classList.contains('dark');
        img.src    = dark ? img.dataset.logoDarkSrc    : img.dataset.logoLightSrc;
        img.srcset = dark ? img.dataset.logoDarkSrcset : img.dataset.logoLightSrcset;
      })();
    </script>
```
to:
```astro
    <a
      href="/"
      class="inline-flex items-center hover:opacity-80 transition-opacity"
      aria-label={`${brandName} home`}
    >
      <Logo variant="ink" class="h-12 w-auto" />
    </a>
```

- [ ] **Step 3: Fix the hardcoded blush hex on the CTA button**

Change:
```astro
      <a
        href="/request-a-quote"
        class:list={[
          'press-tactile inline-flex items-center px-m py-2 rounded-md text-xs uppercase tracking-eyebrow font-semibold text-white transition-colors',
          isActive('/request-a-quote')
            ? 'bg-[var(--color-blush-hover,#b8926e)]'
            : 'bg-[var(--color-blush,#c9a48a)] hover:bg-[var(--color-blush-hover,#b8926e)]',
        ]}
      >
        {ctaLabel}
      </a>
```
to:
```astro
      <a
        href="/request-a-quote"
        class:list={[
          'press-tactile inline-flex items-center px-m py-2 rounded-md text-xs uppercase tracking-eyebrow font-semibold text-white transition-colors',
          isActive('/request-a-quote')
            ? 'bg-[var(--color-rust-cta-hover,#9c3c20)]'
            : 'bg-[var(--color-rust-cta,#b8492a)] hover:bg-[var(--color-rust-cta-hover,#9c3c20)]',
        ]}
      >
        {ctaLabel}
      </a>
```

- [ ] **Step 4: Verify the build and run the dev server visually**

Run: `npm run build`
Expected: succeeds.

Run: `npm run dev`, open the homepage, and confirm: the header shows the new wordmark+cross logo, the "Request a Quote" button is rust-colored (not blush/tan), and clicking nav dropdowns still works (this exercises the `details`/`summary` JS, untouched by this task, as a quick regression check).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: wire Logo.astro into the header, fix hardcoded blush CTA hex"
```

---

### Task 9: Wire `Logo.astro` into `Footer.astro`

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Remove the old logo imports and `getImage` calls**

Change:
```astro
import { getImage } from 'astro:assets';
import { site } from '@/data/site';
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandPinterest,
  IconLink,
} from '@tabler/icons-react';
import { Mail, Phone } from 'lucide-react';
import logoLightAsset from '@/assets/logo-light.png';
import logoDarkAsset  from '@/assets/logo-dark.png';
import { telHref } from '@/lib/phone';

const footerLogoLight1x = await getImage({ src: logoLightAsset, format: 'webp', width: 96 });
const footerLogoLight2x = await getImage({ src: logoLightAsset, format: 'webp', width: 192 });
const footerLogoDark1x  = await getImage({ src: logoDarkAsset,  format: 'webp', width: 96 });
const footerLogoDark2x  = await getImage({ src: logoDarkAsset,  format: 'webp', width: 192 });
const footerLogoLightSrcset = `${footerLogoLight1x.src} 1x, ${footerLogoLight2x.src} 2x`;
const footerLogoDarkSrcset  = `${footerLogoDark1x.src} 1x, ${footerLogoDark2x.src} 2x`;
```
to:
```astro
import { site } from '@/data/site';
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandPinterest,
  IconLink,
} from '@tabler/icons-react';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo.astro';
import { telHref } from '@/lib/phone';
```

- [ ] **Step 2: Decide and confirm the footer's surface color**

Run: `grep -n "<footer" src/components/Footer.astro`
Current class is `class="bg-muted text-foreground"`. After Task 6, `--muted` is `#f0e6d2` (mustard-tinted parchment, NOT dark ink) — so the footer is actually a LIGHT surface in the new system, same family as the rest of the page. That means the footer logo should use `variant="ink"` (dark wordmark), not `variant="parchment"`. This is a deliberate change from the old system, where the footer may have been visually darker. If a later page-by-page pass decides the footer should be a dark-ink band instead (closer to the original assumption), that's a footer-redesign decision for the page-by-page plan — for this task, match what the footer's CSS class actually resolves to today.

- [ ] **Step 3: Replace the logo `<img>`**

Change:
```astro
    <a href="/" aria-label={`${brandName} home`} class="inline-block hover:opacity-80 transition-opacity">
      <img
        alt={brandName}
        width={96}
        height={102}
        class="h-20 w-auto"
        loading="lazy"
        decoding="async"
        data-theme-logo
        data-logo-light-src={footerLogoLight1x.src}
        data-logo-light-srcset={footerLogoLightSrcset}
        data-logo-dark-src={footerLogoDark1x.src}
        data-logo-dark-srcset={footerLogoDarkSrcset}
      />
    </a>
```
to:
```astro
    <a href="/" aria-label={`${brandName} home`} class="inline-block hover:opacity-80 transition-opacity">
      <Logo variant="ink" class="h-20 w-auto" />
    </a>
```

- [ ] **Step 4: Verify the build and visual check**

Run: `npm run build`
Expected: succeeds.

Run: `npm run dev`, scroll to the footer, confirm the new logo renders legibly against the footer's mustard-tinted background.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: wire Logo.astro into the footer"
```

---

### Task 10: Remove the anti-FOUC dark-mode bootstrap and the dark `theme-color` meta from `BaseLayout.astro`

With `ThemeToggle.tsx` deleted (Task 1) and the `.dark` CSS block deleted (Task 6), this script has nothing left to bootstrap — `localStorage` is never written to by anything, so `applyTheme()` always resolves to system preference, which a user with a dark-mode OS setting would still see toggle `.dark` on `<html>` even though there's no `.dark` CSS left to apply. That's a no-op today, but it's confusing dead code that re-implements theme switching the project explicitly doesn't want. The same script also drove the old `data-theme-logo` swap, which Tasks 8–9 already removed the only two consumers of.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Confirm no remaining `data-theme-logo` consumer**

Run: `grep -rn "data-theme-logo" src`
Expected: no matches (Tasks 8 and 9 removed the only two `<img data-theme-logo>` elements).

- [ ] **Step 2: Remove the dark-aware `theme-color` meta tags**

Change:
```astro
    {/* Mobile browser UI chrome color, theme-aware (Soft Linen / Charcoal Dark). */}
    <meta name="theme-color" content="#FAF8F5" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#2A2A2A" media="(prefers-color-scheme: dark)" />
```
to:
```astro
    {/* Mobile browser UI chrome color — Thread Ledger parchment. Single value:
        this site has no dark mode, by design (see docs/superpowers/specs/
        2026-06-30-thread-ledger-redesign-design.md). */}
    <meta name="theme-color" content="#F7F1E6" />
```

- [ ] **Step 3: Remove the entire anti-FOUC theme bootstrap script**

Delete this whole block:
```astro
    {/* Anti-FOUC theme bootstrap — must run inline before first paint.
        Also re-applies the theme + theme-aware images (header logo) after
        every Astro View Transitions navigation: the transition swap
        replaces <html>'s className with the new page's (empty), so without
        this listener a user who set dark mode would see the next page
        render in light. The listener registers exactly once via the
        __themeBootstrapBound flag. */}
    <script is:inline define:vars={{ key: site.themeStorageKey }}>
      (function () {
        function applyTheme() {
          let dark = false;
          try {
            const stored = localStorage.getItem(key) ?? 'system';
            dark =
              stored === 'dark' ||
              (stored === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
            document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
          } catch (_) { /* localStorage unavailable, default light */ }

          // Theme-aware images (header logo) — swap src/srcset to match the
          // active theme. Single-img approach means only one variant is ever
          // fetched per page load, so Lighthouse doesn't flag the inactive
          // variant as "image larger than displayed."
          const imgs = document.querySelectorAll('img[data-theme-logo]');
          for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            const nextSrc = dark ? img.dataset.logoDarkSrc : img.dataset.logoLightSrc;
            const nextSrcset = dark ? img.dataset.logoDarkSrcset : img.dataset.logoLightSrcset;
            if (nextSrc && img.src !== nextSrc) img.src = nextSrc;
            if (nextSrcset && img.srcset !== nextSrcset) img.srcset = nextSrcset;
          }
        }
        applyTheme();
        if (!window.__themeBootstrapBound) {
          window.__themeBootstrapBound = true;
          // The first applyTheme() runs in <head> before the body is
          // parsed, so theme-aware imgs below the fold (footer logo) don't
          // exist yet and never get their src set. Run once more after the
          // body is in the DOM. (Header logo is handled by its own inline
          // script directly after the img, so it's already set by here.)
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
          }
          // View Transitions: html className gets reset on every swap, so
          // re-apply the persisted theme after each navigation.
          document.addEventListener('astro:after-swap', applyTheme);
        }
      })();
    </script>
```

- [ ] **Step 4: Check whether `site.themeStorageKey` is used anywhere else**

Run: `grep -rn "themeStorageKey" src`
Expected: no matches after this deletion. If `src/data/site.ts` defines `themeStorageKey`, remove that field too (open `src/data/site.ts`, delete the `themeStorageKey` property and its value) — it has no remaining reader.

- [ ] **Step 5: Verify the build and a manual check**

Run: `npm run build`
Expected: succeeds.

Run: `npm run dev`, open the homepage with browser devtools open, confirm no console errors on load and no flash of unstyled content.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/data/site.ts
git commit -m "chore: remove dead anti-FOUC dark-mode bootstrap script"
```

---

### Task 11: New favicon matching the compact logo mark

**Files:**
- Modify: `public/favicon.svg`

- [ ] **Step 1: Read the current file to confirm what's being replaced**

Run: `cat public/favicon.svg` (or open it) — note its current viewBox/content so the replacement is a clean swap, not an accidental format mismatch.

- [ ] **Step 2: Replace its contents**

Replace the full contents of `public/favicon.svg` with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#F7F1E6"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#1F5C4F" stroke-width="2" stroke-dasharray="3 5"/>
  <line x1="50" y1="22" x2="50" y2="68" stroke="#2B2420" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="50" cy="26" rx="4" ry="7" fill="none" stroke="#2B2420" stroke-width="3"/>
  <path d="M30,42 Q50,30 70,42" fill="none" stroke="#B8492A" stroke-width="5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Verify it renders**

Run: `npm run dev`, load the homepage, check the browser tab icon shows the new mark (you may need a hard refresh / cache clear — favicons are aggressively cached).

- [ ] **Step 4: Commit**

```bash
git add public/favicon.svg
git commit -m "feat: replace favicon with the Thread Ledger compact mark"
```

---

### Task 12: Remove now-orphaned logo assets and generation scripts

**Files to delete:**
```
src/assets/logo-light.png
src/assets/logo-light.svg
src/assets/logo-dark.png
src/assets/logo-dark.svg
scripts/generate-logo-variants.mjs
scripts/optimize-logo-files.mjs
```

- [ ] **Step 1: Confirm nothing still imports the old assets**

Run: `grep -rln "logo-light\|logo-dark" src scripts package.json`
Expected: no matches (Tasks 8–9 removed the only importers). If `package.json` has an npm script that runs `generate-logo-variants.mjs` or `optimize-logo-files.mjs`, note its name — you'll remove that script entry too.

- [ ] **Step 2: Check `package.json` for scripts referencing the files being deleted**

Run: `grep -n "generate-logo-variants\|optimize-logo-files" package.json`
If found, remove that line from the `"scripts"` block in `package.json`.

- [ ] **Step 3: Delete the files**

```bash
git rm src/assets/logo-light.png src/assets/logo-light.svg src/assets/logo-dark.png src/assets/logo-dark.svg scripts/generate-logo-variants.mjs scripts/optimize-logo-files.mjs
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove orphaned logo assets and generation scripts"
```

---

### Task 13: Add a Lighthouse CI accessibility gate

Matches the bar `nixoncreativestudio` holds itself to (`minScore: 1` / 100 on Accessibility, pinned as a hard CI gate; performance/best-practices/SEO are warnings so normal variance doesn't block a PR).

**Files:**
- Create: `lighthouserc.json`
- Create: `.github/workflows/lighthouse.yml`
- Modify: `package.json`

- [ ] **Step 1: Add the dev dependency**

```bash
npm install -D @lhci/cli
```

- [ ] **Step 2: Write `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist/client",
      "numberOfRuns": 1,
      "url": [
        "http://localhost/index.html",
        "http://localhost/about/index.html",
        "http://localhost/how-it-works/index.html",
        "http://localhost/pricing/index.html",
        "http://localhost/request-a-quote/index.html",
        "http://localhost/shop-by-item/index.html",
        "http://localhost/style-gallery/index.html",
        "http://localhost/font-lettering-guide/index.html",
        "http://localhost/thread-color-chart/index.html",
        "http://localhost/clearance/index.html",
        "http://localhost/thank-you/index.html",
        "http://localhost/404.html"
      ]
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

(Verify `dist/client` is the actual static output directory for this project's `@astrojs/cloudflare` adapter — check by running `npm run build` and inspecting the `dist/` folder structure; adjust `staticDistDir` if the real path differs. The `[slug].astro` dynamic item-category routes aren't listed individually here since the exact slugs depend on live Sanity content — note this as a known gap; a later task could read the built `dist/client` directory and generate the URL list dynamically instead of hardcoding it, but that's out of scope for this foundation pass.)

- [ ] **Step 3: Write `.github/workflows/lighthouse.yml`**

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

- [ ] **Step 4: Add an `npm run lighthouse` convenience script**

In `package.json`, add to `"scripts"`:
```json
    "lighthouse": "npm run build && npx lhci autorun",
```

- [ ] **Step 5: Run it locally to confirm the config is valid**

Run: `npm run lighthouse`
Expected: it runs (don't expect a clean 100 yet — the page-by-page redesign plan is what actually fixes any remaining a11y violations on individual pages; this task's job is just to get the gate wired up and reporting). Note any failures it reports for the later page-by-page plan to address; do not attempt to fix page-level a11y issues in this task.

- [ ] **Step 6: Commit**

```bash
git add lighthouserc.json .github/workflows/lighthouse.yml package.json package-lock.json
git commit -m "ci: add Lighthouse CI accessibility gate, pinned at 100"
```

---

### Task 14: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "No dark mode toggle" rule with the considered decision**

This rule is at `CLAUDE.md:33-35`, under "## Absolute rules." Change:
```markdown
### No dark mode toggle
The brand is warm cream/sage/ink. `.dark` CSS exists but is never applied at runtime.
Do NOT add a ThemeToggle component.
```
to:
```markdown
### No dark mode
The brand is warm parchment/ink/pine-teal/rust ("Thread Ledger"). There is no `.dark` CSS, no
theme toggle, and no theme-bootstrap script anywhere in the codebase — this was a considered
decision (not just an unused old rule), see `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.
Do NOT add a ThemeToggle component or reintroduce a `.dark` class.
```

- [ ] **Step 2: Update the Typography section**

Change:
```markdown
## Typography
- **Playfair Display 400 + 400-italic** — headings. `<em>` inside headings italicizes in Playfair.
- **DM Sans Variable** — body / UI text.
- **Great Vibes** — SVG logo ONLY. Not loaded as a web font anywhere else.
- **Embroidery fonts are NOT web fonts** — each `font` document has a `previewImage` field.
```
to:
```markdown
## Typography
- **Bricolage Grotesque Variable** — headings (weight 700, 600 for sub-headings). No serif anywhere
  in the system — this is deliberate, see the design spec referenced below.
- **Work Sans Variable** — body / UI text.
- No script font. The logo's needle-and-thread cross is a hand-built inline SVG
  (`src/components/Logo.astro`), not a webfont.
- **Embroidery fonts are NOT web fonts** — each `font` document has a `previewImage` field.
```

- [ ] **Step 3: Update the Color palette table**

Change the table under `## Color palette` to:
```markdown
## Color palette
| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#2b2420` | default text |
| Parchment | `#f7f1e6` | page background |
| Pine Teal | `#1f5c4f` | primary / links |
| Muted | `#6b6258` | secondary text |
| Rust — decorative | `#c1542c` | large text (18px+) and decorative strokes only |
| Rust — CTA | `#b8492a` | CTA buttons ONLY (the decorative shade is too light for small white-on-rust text) |
| Mustard | `#d9a441` | gallery photo "hoop ring" frames, highlights |

Full rationale, contrast math, and what NOT to use these for:
`docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.
```

- [ ] **Step 4: Add a pointer comment near the top of the file**

In `CLAUDE.md`, immediately after the "## Status (current — 2026-06-30)" section's bullet list and
before the "## Stack" heading, insert:
```markdown

## Design system note
The visual identity described below ("Thread Ledger") superseded the original cream/sage/blush
system. Full rationale: `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for the Thread Ledger design system"
```

---

### Task 15: Update `docs/02-design-system.md`

**Files:**
- Modify: `docs/02-design-system.md`

- [ ] **Step 1: Replace the file's status banner and content to match the new system**

Replace the full contents of `docs/02-design-system.md` with:

```markdown
# 02: Design System

> **Status: current as of 2026-06-30.** This is "Thread Ledger," the design system that replaced
> the original cream/sage/blush system. Implemented in `src/styles/tokens.css` + `globals.css`.
> Full design rationale (why it changed, what it avoids, contrast math):
> `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.

The feel: an embroidery floss number card brought to life as a website. Parchment paper, ink text,
pine teal as the primary accent, rust as the one CTA color, mustard gold for gallery photo frames.

---

## Color palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#2b2420` | Primary text, headings, the logo needle |
| Parchment | `#f7f1e6` | Default page background, form input fields |
| White | `#ffffff` | Cards, raised surfaces |
| Muted | `#6b6258` | Secondary text, captions, eyebrows |
| Pine Teal | `#1f5c4f` | Primary accent, links, focus ring |
| Pine Teal Dark | `#163f37` | Hover state on pine-teal elements |
| Rust — decorative | `#c1542c` | Large text (18px+/bold 14px+) and decorative thread-line strokes ONLY |
| Rust — CTA | `#b8492a` | The one CTA button-background color |
| Mustard Gold | `#d9a441` | Gallery photo "hoop ring" frames, highlights |

The CTA color is split into two shades on purpose: the decorative rust clears AA for large text but
NOT as a background under small white button labels, so buttons use the separately-darkened CTA
shade. Don't collapse them into one hex value — see the design spec for the contrast math.

---

## Typography

Two families, both self-hosted via `@fontsource-variable` (no Google Fonts runtime dependency).

| Role | Family | Weights | Notes |
|---|---|---|---|
| Headings | **Bricolage Grotesque Variable** | 700 (600 for sub-headings) | Characterful sans, no serif anywhere in the system. |
| Body / UI | **Work Sans Variable** | 400, 500, 600 | Everything that is not a heading. |

No script font. The logo's needle-and-thread cross is a hand-built inline SVG
(`src/components/Logo.astro`), not a webfont — there is nothing to load for it.

---

## Logo

`src/components/Logo.astro` — a needle-and-thread cross in the same horizontal lockup the brand has
always used (wordmark left, cross standing right, small-caps line beneath). Accepts a `variant` prop
(`"ink"` for light/parchment surfaces, `"parchment"` for dark-ink surfaces) and a `mark` prop (render
only the compact hoop-ring + needle, no wordmark). No runtime theme switching — each placement picks
its variant at build time based on the surface it sits on.

A brush-textured pass (closer to a hand-painted cross) is a known follow-up, not yet built — see the
design spec's "Open follow-ups" section.

---

## Component styling notes

**Buttons.** Two variants.
- *Primary / CTA:* rust-CTA background (`#b8492a`), white text, hover to `#9c3c20`. This is the
  "Request a Quote" button. Use it sparingly so it stays meaningful.
- *Secondary:* pine-teal outline or pine-teal text on transparent/parchment.
- Both: ~4px border radius, Work Sans 600, comfortable padding, a clear pine-teal focus ring for
  keyboard users.

**Form inputs.** Parchment field background, a subtle border, pine-teal focus ring on `:focus`.

**Cards.** White surface on the parchment page, soft shadow, generous internal padding.

**Section bands.** Alternate parchment and mustard-tinted (`#f0e6d2`) backgrounds to separate
full-width sections without hard lines.

**Spacing and radius.** Keep a single spacing scale and a single radius value as tokens (see
`tokens.css`) rather than ad hoc pixel values.

---

## Accessibility quick checks

- Ink on parchment and white passes contrast at AAA (~14:1).
- Pine teal on parchment passes at AAA (~7.2:1) — safe for links and body-size accent text.
- Decorative rust (`#c1542c`) on parchment clears AA only for large text (18px+, or 14px+ bold) —
  never use it for small body text, and never as a button background under white text.
- The CTA rust (`#b8492a`) is specifically darkened so white button labels clear AA (~5.2:1) — use
  it, not the decorative shade, for every button/chip background.
- Mustard gold is decorative only (gallery frames, highlights) — check contrast before ever pairing
  it with text.
- Every interactive element needs a visible focus state (the pine-teal ring), not just a hover
  state.
- No dark mode anywhere in the codebase — this was a considered decision, not an oversight. See the
  design spec for why.
```

- [ ] **Step 2: Commit**

```bash
git add docs/02-design-system.md
git commit -m "docs: rewrite docs/02-design-system.md for Thread Ledger"
```

---

### Task 16: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `npm run build:full`
Expected: succeeds (this also runs `typegen`, which hits the Sanity Studio — confirm it doesn't fail; if it fails for an unrelated reason like a missing `SANITY_API_READ_TOKEN` in your local `.env`, that's a pre-existing environment issue, not something this plan introduced — note it and move on).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors introduced by this plan's changes. Pre-existing lint warnings unrelated to files this plan touched are out of scope.

- [ ] **Step 3: Unit tests**

Run: `npm test`
Expected: existing tests in `src/lib/*.test.ts` still pass (this plan didn't touch `src/lib`, so this should be a no-op confirmation).

- [ ] **Step 4: Grep sweep for any remaining old-brand references outside `globals.css`**

Run: `grep -rniE "playfair|great vibes|#4a5e4c|#8a9e8c|#e8ede8|#c9a48a|#b8926e|#faf8f4|#2c2c28" src --include=*.astro --include=*.tsx --include=*.css`
Expected: no matches. Any hit is a hardcoded old-token reference Task 6–9 missed (most likely in a page file not touched by this plan — note it for the page-by-page redesign plan rather than fixing it here, since this plan's scope is the foundation, not every page).

- [ ] **Step 5: Manual visual check**

Run: `npm run dev`, open `http://localhost:4321/`, and confirm:
- Page background is parchment, not cream.
- Headings render in Bricolage Grotesque (bold, sans-serif — visibly different from the old serif).
- Body text renders in Work Sans.
- Header and footer both show the new needle-and-thread logo.
- The "Request a Quote" button is rust, not tan/blush.
- Browser tab favicon shows the new mark.
- No console errors.

- [ ] **Step 6: Final commit (if any cleanup from this verification pass is needed)**

If Steps 1–5 surfaced any small fix, make it, then:
```bash
git add -A
git commit -m "fix: address foundation verification findings"
```
If nothing needed fixing, skip this step — there's nothing to commit.

---

## What this plan does NOT cover (intentionally — see the other plans)

- Sourcing the ~80 real product photos from the live Squarespace site into Sanity (separate content-pipeline plan).
- Applying the running-stitch / hoop-ring-frame / thread-trail motion vocabulary to individual pages, or deciding page-by-page whether to keep Lenis/View Transitions on a given section (separate page-by-page plan — this foundation plan deliberately left `lenis`, `[data-reveal]`, `[data-stagger-grid]`, and the rest of the existing live motion system untouched, since they're working infrastructure, not contradictory dead code).
- Fixing any hardcoded old-token hex values inside individual page files under `src/pages/` (Task 16 Step 4 finds these but doesn't fix them — that's page-by-page work).
- Logo brush-texture refinement (explicit follow-up in the design spec, not a launch blocker).
