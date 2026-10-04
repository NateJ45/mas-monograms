---
name: MAS Monograms
description: Heirloom Coast, "The Sampler": warm linen paper, deep ink, indigo-drenched bands, a claret quote button and a gold script flourish.
colors:
  linen: "#F4EEE3"
  paper: "#FBF8F1"
  sage-band: "#E4E2D3"
  border-soft: "#D8CFBC"
  border-interactive: "#847A63"
  heirloom-ink: "#26312E"
  ink-dark: "#1A1512"
  heritage-indigo: "#28486B"
  indigo-deep: "#1C3550"
  claret: "#8C3A2E"
  claret-deep: "#722C22"
  brass-text: "#835A24"
  brass-decorative: "#B98A3E"
  gold-script: "#D9B15F"
  taupe-secondary: "#5A5148"
  taupe-tertiary: "#67614F"
  error-text: "#B91C1C"
typography:
  display:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 440
    lineHeight: 1.1
  heading-small:
    fontFamily: "Fraunces Variable, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)"
    fontWeight: 560
  body:
    fontFamily: "Mulish Variable, sans-serif"
  label:
    fontFamily: "Mulish Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.18em"
  script-kicker:
    fontFamily: "Petemoss, cursive"
    fontSize: "2.75rem"
rounded:
  base: "0.25rem"
spacing:
  xs: "clamp(0.25rem, 0.5vw, 0.5rem)"
  s: "clamp(0.5rem, 1vw, 1rem)"
  m: "clamp(1rem, 2vw, 1.5rem)"
  l: "clamp(2rem, 4vw, 3rem)"
  section-md: "clamp(3rem, 6vw, 5rem)"
  section-lg: "clamp(4rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.claret}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "{spacing.s} {spacing.l}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.claret-deep}"
  button-on-dark:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.heirloom-ink}"
  band-drench:
    backgroundColor: "{colors.heritage-indigo}"
    textColor: "{colors.linen}"
---

# Design System: MAS Monograms

Tokens live in `src/styles/globals.css` (`@theme`); there is no `tokens.css` or Tailwind config. The CSS wins if this file and the code disagree. Strategy is in `PRODUCT.md`. Fuller rationale and contrast math: `docs/02-design-system.md` and `docs/superpowers/specs/2026-07-01-redesign-audit-and-recommendations.md`.

## 1. Overview

**Creative North Star: the sampler.** A hand-stitched heirloom shop: warm linen paper, deep ink text, one heritage indigo that also drenches whole bands, claret for the one action that matters, a thin gold script flourish. "Expensive through restraint": space and editing do the work, not effects.

- **Light only, by decision.** No `.dark` CSS, no toggle, no theme bootstrap script. Do not add one.
- **Mostly flat.** Paper cards on a linen page, sage bands alternating full width, one committed hover shadow. Tight `0.25rem` radius.
- **Indigo drench.** The home hero, the bottom CTA band, the desktop header strip and a 4px stripe above the footer are Heritage Indigo with linen type.
- **Motion is subtractive** (2026-07-03): no scroll reveals, no grid stagger, no floating or zoom on the hero collage.
- Reference sites and anti-references (proposed, unconfirmed) are in `PRODUCT.md`; this file records only what the code does.

## 2. Colors

- **Ground.** Linen `#F4EEE3` page, Paper `#FBF8F1` cards and raised surfaces, Sage band `#E4E2D3` alternating section, soft border `#D8CFBC` for decorative hairlines, interactive border `#847A63` for form fields (the border is the field's only affordance).
- **Ink.** Heirloom Ink `#26312E` for text and headings (11.65:1 on Linen). Secondary text taupe `#5A5148` (6.72:1), captions `#67614F` (5.35:1). Never dim text with opacity utilities; use these tokens.
- **Heritage Indigo** `#28486B`: primary, links, focus ring (8.16:1 on Linen) and the drench surface; Indigo Deep `#1C3550` on hover.
- **Claret** `#8C3A2E` (hover `#722C22`): the CTA button background on light grounds only (white label 7.61:1), plus the running-stitch borders on the hero photo mats. On indigo, claret vibrates and fails, so buttons flip to Paper with Ink text (`onDark`).
- **Brass.** Text `#835A24` (5.27:1 on Linen) for pricing figures and small meta. Decorative `#B98A3E` is about 2.7:1: hairlines and hoop-ring strokes only, never text.
- **Gold script** `#D9B15F`: the script kicker and hairlines on indigo or dark grounds only (about 4.84:1 on indigo at 44px and up; about 1.6:1 on Linen, so never on light).
- **Errors** use a token set (`#B91C1C` text, `#F9E8E6` wash, `#E0B4AC` border), not the shadcn red (about 4.0:1, fails AA).
- Near-black `#1A1512` survives only as the base of the photo scrim in `HeroBackground`.

## 3. Typography

- **Fraunces Variable** (display and headings), loaded from the opsz builds (`opsz.css` and `opsz-italic.css`, so the real italic cut is used, never a synthetic oblique). Weight 440 at display sizes, 560 for h4 to h6. Do not force 700: hierarchy comes from size and the optical axis. Line-height 1.1 on display sizes.
- **Mulish Variable** (body and UI): copy, labels, buttons. Eyebrows are tracked caps at `0.08em`.
- **Petemoss** (script), two uses only: on-screen monogram initials (combo preview, the logo's script M) and ONE script kicker per page, the opening hero's eyebrow, via `ScriptKicker.astro` (claret on light, gold on dark, tilted -2 degrees, at least 2.75rem). Never for prose, buttons, nav or small text.
- **Scale.** `--text-h1` clamp(2.5rem, 6vw, 5rem), h2 clamp(2rem, 4vw, 3rem), h3 clamp(1.5rem, 2.5vw, 2rem), h4 clamp(1.25rem, 2vw, 1.5rem), h5 clamp(1.125rem, 1.5vw, 1.25rem), h6 1rem.
- **Embroidery fonts are content, not web fonts.** Each `font` document carries a photo of the lettering stitched on fabric (`docs/04-fonts-and-lettering.md`).
- Block quotes (`.prose-blockquote`) are Fraunces italic with a 3px indigo left rule.

## 4. Elevation

Essentially flat. Surfaces separate by tone (Linen, Paper, Sage, Indigo) and by hairlines. The one committed shadow is the `.card-lift` hover: a 2px rise and `0 16px 34px -18px` at low opacity. Images zoom to 1.06 on hover under a faint indigo tint (`.img-zoom`, `.img-tint`). Photography sits frameless; the hoop-ring (a double indigo ring) frames category images. No glow, no coloured shadows.

## 5. Components

- **Buttons (`CtaLink.astro`).** One recipe: 44px minimum height, `px-l py-s`, `0.25rem` radius, 12px uppercase Mulish semibold at `0.18em` tracking, a 1px tactile press. Primary is claret with a white label on light grounds and Paper with an Ink label on dark. Secondary is an indigo outline with link-coloured text on light, a white outline on dark. "Request a Quote" is the one claret button; keep it sparing.
- **Header and footer.** A desktop strip in indigo (announcement band) above the main row; a slim indigo stripe on mobile. The footer is a sage band under a 4px indigo stripe that sits seamless below the indigo CTA band.
- **Logo (`Logo.astro`).** Lockup is the "Flourished Initial": an oversized Petemoss M in claret with a drawn thread swash beneath a Fraunces "MAS MONOGRAMS". The compact mark is the "Shopkeeper's Badge": a double indigo hoop ring around an outlined Fraunces M in claret (also the favicon, generated by `scripts/generate-favicons.mjs`).
- **Hero (`Hero.astro`).** Three shapes: full-bleed image hero with a dark scrim (category pages), split hero (home: indigo drench, headline and CTAs on one side, a pinned collage of photos on paper mats with claret running-stitch borders cross-fading in place on the other), and a text-only editorial hero. Cross-fade is the hero's one motion; the entry stagger and view-transition cross-fades remain.
- **Category cards (`CategoryCard.astro`).** Hoop-ring-framed photo and name linking to the category, shared by the home grid and "Explore Other Items".
- **Forms.** Paper or linen field, interactive-weight border, full indigo focus ring at a 2px offset, errors via the token set, each field's error linked with `aria-describedby`.
- **Process steps, FAQ accordion, CTA banner (indigo drench, Paper button), back to top, mobile nav.**

## 6. Do's and Don'ts

Motion: one house easing, `cubic-bezier(0.16, 1, 0.3, 1)` at 440ms, for every hover and focus state. `prefers-reduced-motion` is honoured throughout (transitions of 0s).

**Do**

- Pull every colour, size and space from the `@theme` tokens; never hardcode.
- Put the claret button on light grounds only and flip to Paper on indigo.
- Keep the Petemoss kicker to one per page and at least 2.75rem.
- Use real photography of the work, frameless, with a quiet label.
- Measure any new colour pair with `src/lib/contrast.ts` and add it to `theme-tokens.test.ts`.

**Don't**

- Don't add a dark mode, a theme toggle or `.dark` CSS.
- Don't use brass decorative or gold script as text on a light surface.
- Don't add scroll-in reveals, stagger entrances, floating or Ken-Burns motion on the collage.
- Don't bold Fraunces to 700 for hierarchy or synthesise an oblique.
- Don't bring back brass photo frames, caption bars, the near-black slab band, Thread Ledger or the cream/sage/blush look.
- Don't write an em-dash in copy.
