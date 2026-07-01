# MAS Monograms Redesign — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Execute phases in order — each phase is independently shippable and must build + test clean before the next. Create a NEW commit per task; never amend.

**Goal:** Rebrand MAS Monograms to the "Heirloom Coast" identity and fix the concentrated conversion/a11y/dead-space problems found in the audit, so the site converts visitors to quote-orders and showcases the craft like a trustworthy portfolio.

**Architecture:** Token-layer-first. Phase A swaps the whole design system (palette + fonts + logo) at the CSS custom-property layer so every later change is built in the final look and inherits AA-safe text tokens. Later phases fix page-level bugs, then rebuild the two highest-leverage conversion modules (the "Try It Out" combo preview and the Style Gallery filter). All content stays Sanity-editable; no cart, no dark mode, no breakage of the quote form / product data / Stripe links.

**Tech Stack:** Astro 6 (static) · Tailwind CSS 4 (`@theme` / `@theme inline` in `src/styles/globals.css` + `src/styles/tokens.css`) · Fontsource variable fonts · React 19 islands · Sanity 7 client + Studio 5 (GROQ in `src/lib/queries.ts`, schemas in `studio/schemaTypes/`).

**Source spec:** `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md` (audit + Heirloom Coast direction, WCAG-checked palette).

---

## Heirloom Coast palette (single source of truth — every task references these)

| Token name | Hex | Role | Key contrast |
|---|---|---|---|
| Linen | `#F4EEE3` | page background | Ink 11.65:1 |
| Paper | `#FBF8F1` | raised card / surface | Ink 12.68:1 |
| Sage Linen Band | `#E4E2D3` | alternating section band / chip | Ink 10.32:1 |
| Heirloom Ink | `#26312E` | default text + headings + logo wordmark | AAA on all surfaces |
| Heritage Indigo | `#28486B` | primary accent, links, eyebrows, focus ring, logo hoop | 8.16:1 on Linen |
| Indigo Deep | `#1C3550` | link / secondary-button hover | 10.86:1 on Linen |
| Claret | `#8C3A2E` | **CTA button bg only** (white text) + logo needle-thread | white 7.61:1 |
| Claret Deep | `#722C22` | CTA hover/active | white 10.01:1 |
| Brass Text | `#835A24` | text-safe brass accent (pricing figures, meta) | 5.27:1 Linen |
| Brass Decorative | `#B98A3E` | **decorative only** — hoop-ring photo frames, hairline rules | ~2.7:1 — NEVER text |
| Secondary Taupe | `#5A5148` | secondary text token (replaces every `foreground/70`) | 6.72:1 Linen |
| Tertiary | `#67614F` | tertiary text token (captions/fine print, replaces `foreground/50`) | 5.35:1 Linen |
| Eucalyptus | `#5E7263` | decorative/large-text green accent (icons) | 4.48:1 — large/deco only |

**Fonts (Fontsource):** headings `@fontsource-variable/fraunces` → `--font-heading`; body `@fontsource-variable/mulish` → `--font-body`; monogram artifact `@fontsource/petemoss` → `--font-monogram` (decorative, artifacts only).

**Content vs code split (give this section to Mary Ann):** She edits in Sanity — real testimonial attribution names, a published turnaround line, real contact email + social links, remaining font specimen photos, thread-color swatch photos for whites/creams. Everything else in this plan is code Nate/Claude owns.

---

## PHASE A — Brand foundation (tokens + fonts + logo)

Ships: the entire site rendered in Heirloom Coast with AA-safe text tokens, mustard/accent-trap resolved. Visible, sweeping change; must build clean and be visually QA'd before Phase B.

### Task A1: Add the three webfonts

**Files:** `package.json`, whichever file currently imports fonts (grep `@fontsource` to find it — likely `src/styles/globals.css` or a font entry).

- [ ] **Step 1:** Install: `npm i @fontsource-variable/fraunces @fontsource-variable/mulish @fontsource/petemoss`
- [ ] **Step 2:** Find current font imports: `grep -rn "@fontsource" src/`
- [ ] **Step 3:** Add imports next to the existing ones (keep Work Sans import for now; it is removed in A3 only after nothing references it):
```css
@import '@fontsource-variable/fraunces';
@import '@fontsource-variable/mulish';
@import '@fontsource/petemoss';
```
- [ ] **Step 4:** `npm run build:full 2>&1 | tail -5` → `[build] Complete!`
- [ ] **Step 5:** Commit: `git commit -am "chore: add Fraunces, Mulish, Petemoss webfonts (Heirloom Coast)"`

### Task A2: Rewrite the palette tokens

**Files:** `src/styles/tokens.css`, `src/styles/globals.css` (read both fully first; the `@theme` and `@theme inline` blocks and the `:root` block are the targets).

- [ ] **Step 1:** In `tokens.css` / the static `@theme` block, replace the Thread Ledger color values with the Heirloom Coast table above, keeping the SAME token NAMES where a page already uses them (`--color-primary` → Heritage Indigo `#28486B`, `--color-primary-dark` → `#1C3550`, `--background` → Linen `#F4EEE3`, `--foreground` → Heirloom Ink `#26312E`, `--color-secondary` → Brass Decorative `#B98A3E`, `--color-tertiary`/`--muted`/`--color-bg-soft` → Sage Linen Band `#E4E2D3`, `--color-rust-cta` → Claret `#8C3A2E`, `--color-rust-cta-hover` → Claret Deep `#722C22`, `--color-rust-decorative` → keep a large-text-safe claret `#8C3A2E`, `--link` → `#28486B`, `--ring` → `#28486B`, `--border` → a visible hairline `#B7AD99`, `--border-soft` → `#D8CFBC`).
- [ ] **Step 2:** ADD new text tokens: `--color-text-secondary: #5A5148;` and `--color-text-tertiary: #67614F;` and `--color-brass-text: #835A24;`. Expose Tailwind utilities for them (mirror how existing `--color-*` map to `text-*`).
- [ ] **Step 3:** Reassign the old Mustard: `--color-secondary` (Brass Decorative `#B98A3E`) gets a code comment: `/* DECORATIVE ONLY — ~2.7:1 on Linen, never text on a light surface */`.
- [ ] **Step 4: Defuse the accent-trap.** In `globals.css` the `@theme inline` block remaps `--color-accent` to `var(--accent)` (light). Set `--accent` and `--color-accent` both to a genuinely usable value OR remove the trap: make `--color-accent: var(--foreground)` in the static theme and ensure the inline block does not silently relight it. Verify with a grep that no page uses `text-accent` expecting a light value; those were already migrated in a prior fix, so the safe move is to point the token at Ink.
- [ ] **Step 5:** `npm run build:full` → clean. Then start the preview and eyeball the home page — the site should be linen/indigo/brass, headings still in the old font (fixed in A3).
- [ ] **Step 6:** Commit: `git commit -am "feat: swap palette tokens to Heirloom Coast + add AA text tokens, defuse accent-trap"`

### Task A3: Swap the type tokens

**Files:** `src/styles/globals.css`, `src/styles/tokens.css`.

- [ ] **Step 1:** Point `--font-heading` / `--font-display` at `"Fraunces Variable", serif` and `--font-body` at `"Mulish Variable", sans-serif`. Add `--font-monogram: "Petemoss", cursive;`.
- [ ] **Step 2:** Remove the Bricolage import and the Work Sans import ONLY after `grep -rn "Bricolage\|Work Sans" src/` shows nothing references them by literal name (the tokens now resolve to Fraunces/Mulish). If a component hardcodes a family, fix it to use the token.
- [ ] **Step 3:** `npm run build:full` → clean; preview: headings now Fraunces, body Mulish.
- [ ] **Step 4:** Commit: `git commit -am "feat: Fraunces headings + Mulish body + Petemoss monogram token"`

### Task A4: Recolor the logo

**Files:** `src/components/Logo.astro` (read fully).

- [ ] **Step 1:** Change the hardcoded logo hexes: needle-thread arc → Claret `#8C3A2E`; hoop ring → Heritage Indigo `#28486B`; wordmark text fill → Heirloom Ink `#26312E`. If the wordmark uses a `font-family` attribute, set it to Fraunces (the `MADE JUST FOR YOU` small line stays the body font).
- [ ] **Step 2:** `npm run build:full` → clean; preview header + footer logo.
- [ ] **Step 3:** Commit: `git commit -am "feat: recolor logo to Heirloom Coast (claret thread, indigo hoop)"`

### Task A5: Phase A visual QA + push

- [ ] `npm run build:full` + `npm test` clean.
- [ ] Preview every route; confirm no element is illegible on the new linen ground and the CTA claret is the only saturated action color. Spot-check the pages the audit flagged.
- [ ] Push: `git push origin main`.

---

## PHASE B — Sitewide contrast migration

Ships: every small-text AA failure fixed by replacing opacity-dimmed ink with the new `text-secondary`/`text-tertiary` tokens. Depends on Phase A tokens existing.

### Task B1: Replace opacity-dimmed text across pages

**Files (from the audit — grep each to confirm):** `shop-by-item.astro`, `[slug].astro`, `clearance.astro`, `404.astro`, `pricing.astro`, `about.astro`, `request-a-quote.astro`, `font-lettering-guide.astro`, `thread-color-chart.astro`, `index.astro`, and any component using `text-foreground/50|60|70|75|80`.

- [ ] **Step 1:** `grep -rn "text-foreground/\(50\|60\|70\|75\|80\)" src/` to enumerate every instance.
- [ ] **Step 2:** For each: body/secondary copy → `text-[var(--color-text-secondary)]` (or the Tailwind alias defined in A2); least-emphasis/meta/fine-print → `text-[var(--color-text-tertiary)]`. Specific audit callouts: DMC number `thread-color-chart.astro` (was `/50` @ 2.9:1) → tertiary + bump `text-[10px]`→`text-xs`; `font-lettering-guide.astro` `bestFor` (`/60`) → secondary; error red in `request-a-quote.astro` → `#b91c1c`; form-help → secondary.
- [ ] **Step 3:** Grep again to confirm zero raw opacity-dimmed text remains for small copy.
- [ ] **Step 4:** `npm run build:full` + `npm test` clean; preview spot-check contrast on thread-chart + form.
- [ ] **Step 5:** Commit + push: `git commit -am "fix: replace opacity-dimmed text with AA-safe secondary/tertiary tokens sitewide"`.

---

## PHASE C — Quick-win bug fixes

Ships: the live bugs + dead-space relief. Each task is small and independent.

### Task C1: Fix the dangling hero headline
**Files:** `src/components/Hero.astro`, `src/components/SectionHeading.astro` (read both).
- [ ] Add a `headlineItalicSuffix?: string` prop to `SectionHeading.astro`; render `{headline}{suffix && <em class="italic">{' '+suffix}</em>}`.
- [ ] In `Hero.astro`'s no-image (`!hasImage`) branch, forward `headlineItalicSuffix={page-provided suffix}` (the same value the image branch already uses).
- [ ] Build + preview home: headline reads "Custom monogramming, made just for you." Commit.

### Task C2: Right-size the empty home hero
**Files:** `src/pages/index.astro` and/or `Hero.astro`.
- [ ] When no hero image, render `size="short"` (or a bounded band ~`min-h-[46svh]`) instead of the 100svh fill branch. (If Phase E replaces the hero with a montage, this becomes moot — but ship it now for immediate relief and keep it as the no-montage fallback.)
- [ ] Build + preview; commit.

### Task C3: Fix invisible stat suffixes
**Files:** `src/components/StatsCounter.tsx:~54`.
- [ ] Change the suffix class from `text-secondary` (Brass) to `text-primary` (Heritage Indigo) or Ink. Build + preview stats strip. Commit.

### Task C4: Empty-tile fallbacks + maker signature
**Files:** `src/pages/index.astro`, `src/pages/about.astro`.
- [ ] Popular Combinations: when `combo.image` absent, render a typographic "recipe" card — font name set in `--font-monogram` + a thread-color chip — instead of a bare `bg-tertiary` block.
- [ ] "Bring Your Own Item" category: give it a real tile (an icon/illustration or an existing representative gallery photo) instead of an empty square.
- [ ] About Story: wrap the grid so `makerPhoto` absent → single centered `max-w-3xl` column (no dead half). MOVE `makerAttribution` render OUT of the photo-only conditional so the signed "Mary Ann Stone · Founder" line always shows.
- [ ] Build + preview both pages; commit.

### Task C5: Quote-form completion + error a11y
**Files:** `src/pages/request-a-quote.astro`, `studio/schemaTypes/requestAQuotePage.ts`, `src/lib/queries.ts`.
- [ ] Reconcile the schema/template field mismatch: add the fields the template references (turnaround callout, required-field note, hero trust items) to the schema AND to `getRequestAQuotePage()`'s GROQ selection, so editor content stops being dropped.
- [ ] Render the turnaround callout as a bold line directly above the submit button.
- [ ] Error a11y: on validation fail set `aria-invalid` + `aria-describedby` per field, focus the first invalid field, add a visually-hidden error-summary; darken error red to `#b91c1c`; add `inputmode="numeric"` to quantity.
- [ ] Build + test + preview form (submit empty → errors announced, focus moves). Commit.

### Task C6: Empty-state CTAs + reference placeholder
**Files:** `src/pages/clearance.astro`, `src/pages/thank-you.astro`, `src/pages/font-lettering-guide.astro`, schemas as needed.
- [ ] Clearance empty state: add an onward CTA row (→ `/request-a-quote`, → `/shop-by-item`).
- [ ] Thank-you: add an optional `secondaryCta` and render a second onward path; seed a default 3-item `nextSteps`.
- [ ] Font guide: redesign the no-photo tile — legible "Specimen coming soon" with the font name prominent, replacing the `foreground/20` "Aa".
- [ ] Build + preview; commit + push Phase C.

---

## PHASE D — "Try It Out" live monogram preview → pre-filled quote  *(highest-leverage conversion move)*

Ships: the combo builder actually previews a monogram and hands a pre-filled quote to the form.

**Design (build to this):**
- **Inputs:** keep the existing item / font / thread pickers in `src/components/ComboPreview.tsx`; ADD a 1–3 char "initials" text field (guidance "e.g. ABS").
- **Preview output:** render the typed initials in `--font-monogram` (Petemoss), font-size large, `color` = the selected thread's hex (fallback Ink for near-white threads), centered on a Paper/Linen swatch inside the existing hoop-ring frame; show the real embroidery specimen image beside it labeled "your font, stitched". All three inputs (initials, font, thread) must visibly change the output live. Remove the current behavior where the output is just the font's alphabet sheet + a text label.
- **CTA contract:** "Get a quote for this combination" links to `/request-a-quote?item=<slug>&font=<name>&thread=<name>&initials=<ABC>`.
- **Prefill:** `request-a-quote.astro` reads those query params on load and pre-fills the matching free-text inputs (itemType, fontPreference, threadColor, personalization). No new required fields; graceful when params absent.

### Task D1: Rebuild the preview render in `ComboPreview.tsx`
- [ ] Add the initials input + state; render the live monogram (Petemoss, thread hex, item swatch) + specimen image; keep roving-tabindex a11y on pickers. Build + preview: picking Navy shows navy initials, changing font changes the letterform.
- [ ] Commit.

### Task D2: Build the pre-filled-quote deep link + form prefill
- [ ] `ComboPreview.tsx` CTA builds the query string. `request-a-quote.astro` (or a small client script) reads `URLSearchParams` on load and sets the field values. Build + test the round-trip: click CTA → form opens with fields populated.
- [ ] Commit + push Phase D.

---

## PHASE E — Grouped filter taxonomy (Style Gallery)  *(second conversion move)*

Ships: the 71-pill wall replaced by ~4–6 editable groups.

**Design (build to this):**
- **Schema:** add `filterGroups[] { groupLabel: string, tags: string[] }` to `studio/schemaTypes/styleGalleryPage.ts`; query it in `getStyleGalleryPage()`.
- **Tag → group mapping (from audit; seed this):** ITEM (tote, towel, napkin, kitchen-towel, linen, t-shirt, polo, pullover, sweatshirt, jacket, beanie, sun-hat, baby-blanket/-dress/-hat/-sweater, romper, infant-dress, bandana, key-fob, bag-tag, keychain, gift-bag, duffel-bag, fabric-bucket, kids-bag, wall-hanging, wreath-sash, greeting-card); THEME/OCCASION (christmas, easter, seasonal, wedding, birthday, faith, scripture, farmhouse, chinoiserie, palmetto, south-carolina, sports, collegiate, novelty, keepsake); TECHNIQUE/STYLE (monogram, name, script, block, applique[merge appliqué], logo, paw-print, pet-portrait, photo-stitch, line-art, heat-transfer, bow, topiary, wreath, polka-dot, multicolor); RECIPIENT (baby, pet, matching-set). **Exclude META tags entirely:** closeup, customer-photo.
- **Render:** `src/pages/style-gallery.astro` renders each group as a labeled row/disclosure, options ordered by count desc, long groups behind "+ more"; keep `role="group"` + `aria-pressed`; photos-first on mobile (filters behind one "Filter" disclosure).

### Task E1: Schema + query + seed the groups & merge duplicate tag
- [ ] Add `filterGroups[]` schema + GROQ; write a small seed/patch to populate the four groups and merge `appliqué`→`applique` in gallery item tags. `npm run typegen`. Commit.

### Task E2: Render grouped filters + drop meta tags
- [ ] Replace the flat `flatMap` render with grouped, count-ordered, progressively-disclosed groups; exclude meta tags; keep the client filter script working against `data-tags`. Build + preview: a few tidy groups, photos visible on first paint, filtering still works.
- [ ] Commit + push Phase E.

---

## PHASE F — Home hero montage + process + photo→quote bridges + about depth

Ships: the remaining dead-space and conversion-bridge fixes.

### Task F1: Monogram-variety home hero from existing photos
- [ ] Build a hero collage/lineup from `getFeaturedGalleryItems` (already fetched) so `hasImage` is true — several real finished pieces, each a different font/style, with the Fraunces headline + Petemoss "MAS" motif and the claret CTA over a proper scrim. Keep headline/eyebrow Sanity-driven. Build + preview. Commit.

### Task F2: Home process horizontal layout
- [ ] Switch the `preview` variant of `ProcessStep.astro` (and the `<ol>` wrapper in `index.astro`) from a tall left-crammed list to a responsive 4-across row (number + icon + title + short line stacked per card). Same Sanity fields. Build + preview. Commit.

### Task F3: Photo → quote bridges + category price
- [ ] Add "Request something like this" deep-links (→ `/request-a-quote?item=<relatedCategory>`) on gallery/category photos; surface a category starting-price on shop-by-item cards (Sanity field). Keep CTA text Sanity-editable. Build + preview. Commit.

### Task F4: About "recent work" strip + shop/category differentiation
- [ ] Add a Sanity-driven strip of 2–3 existing gallery photos ("recent from the studio") to `about.astro`; tighten `shop-by-item` hero and make its cards promise price/turnaround so it reads as a directory distinct from category pages. Build + preview. Commit + push Phase F.

---

## PHASE G — Full verification + launch pass

- [ ] `npm run build:full` (all 21 routes) + `npm test` (93) clean.
- [ ] Grep: zero opacity-dimmed small text, zero `bg-muted`/legacy tokens, zero `text-accent` relying on the trap.
- [ ] Preview EVERY route at desktop + mobile widths; verify Heirloom Coast contrast holds (spot-check with computed color on the previously-failing spots: DMC numbers, form help, card copy, stat suffix, hero headline).
- [ ] Confirm quote form, Stripe clearance links, and product data are unbroken.
- [ ] Push; verify the Cloudflare Workers build deploys.
- [ ] Hand Mary Ann the content checklist (testimonial names, turnaround line, email/socials, font/thread photos).

---

## Self-review notes
- **Spec coverage:** every audit item maps to a task — hero bug (C1), hero void (C2/F1), stat suffix (C3), empty tiles + signature (C4), contrast (Phase B), quote form (C5), empty states (C6), accent-trap (A2), Try-It-Out (Phase D), filter pills (Phase E), process (F2), photo→quote (F3/D2), about (F4), brand (Phase A). The five named issues: empty space (C2/C4/F1/F2), Try It Out (D), headshot (C4/F4), filter pills (E), fonts/colors (A).
- **Dependency order:** A (tokens/fonts) → B (uses new tokens) → C (page fixes on new brand) → D/E (big modules) → F (layout) → G (verify). Correct — nothing later is undone by something earlier.
- **No cart/form/product breakage:** Phase C5/D touch the form additively (params + a11y), never its POST contract to `api/quote.ts`; clearance Stripe links untouched.
