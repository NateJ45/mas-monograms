# MAS Monograms — "Thread Ledger" Redesign & WCAG 2.1 AA Remediation

> Design spec. Status: approved by Nate, 2026-06-30. Supersedes the visual system described in
> `docs/02-design-system.md` and the "no dark mode" / "Playfair + DM Sans" / palette rules in
> `CLAUDE.md` — those files get updated once implementation lands.

## Goals

1. Bring every page to WCAG 2.1 AA (the Squarespace-era site was never designed against it).
2. Replace the current cream/sage/blush visual identity — confirmed too close to Reid Design's
   palette, and structurally identical (cream/paper + one deep accent + serif heading) to the
   formula three other sites in Nate's portfolio already use (Theology Matters, Second Presbyterian
   Chicago, Presbyterian Academy) — with something genuinely distinct.
3. Port the reusable parts of the `nixoncreativestudio` toolkit (motion vocabulary, a11y discipline,
   image/lightbox pipeline) without dragging in pieces that don't fit a craft boutique (dark mode,
   WebGL, blog/case-study collections).
4. Treat the site as what it actually is: a portfolio whose entire job is to make a visitor trust
   Mary Ann's hand-stitched work enough to fill out the quote form. Every design decision should
   serve that funnel.

## Why the current identity has to change

A survey of Nate's other live client projects found:

| Project | Palette | Type | Vibe |
|---|---|---|---|
| nixoncreativestudio | Navy / NCS blue / amber | Bebas Neue + Source Sans 3 | Dark tech-forward studio |
| Reid Design | Warm bronze / taupe / sage / cream | Cormorant Garamond + Source Sans 3 | Premium warm editorial |
| Theology Matters | Oxblood / navy / cream | Newsreader + IBM Plex Sans | Scholarly editorial |
| Foundation for Reformed Theology | Navy / burgundy / gold / off-white | Serif + Source Serif 4 | Dignified archival nonprofit |
| Second Presbyterian Chicago | Paper / espresso / bronze / Tiffany green | Fraunces + Source Sans 3 | Warm historic parish |
| Presbyterian Academy | Paper / forest green / brass | Fraunces + Source Sans 3 | Bookish minimalism |

Cream/paper + one deep jewel-tone accent + a serif heading (often literally Fraunces or Newsreader)
is the studio's default look, repeated three times over. MAS's current cream/sage/blush/Playfair
system sits inside that exact territory. Genuinely open ground: saturated color pulled from a
non-institutional source, a non-serif/characterful display face, and a tactile motion language
instead of the shared `Lenis` + `[data-reveal]` + count-up vocabulary.

## Visual identity — "Thread Ledger"

Color story pulled from embroidery floss number cards rather than generic "warm boutique" tones.

| Token | Hex | Use | Contrast notes |
|---|---|---|---|
| Parchment | `#F7F1E6` | page background | — |
| Ink | `#2B2420` | text, headings, the logo needle | ~14:1 on parchment, AAA |
| Pine Teal | `#1F5C4F` | primary accent, links, eyebrow labels | ~7.2:1 on parchment, AAA |
| Rust — decorative | `#C1542C` | large text (18px+/bold 14px+) on parchment, decorative thread-line strokes, hoop-ring details — never as a background under white text | clears AA for large text on parchment with room to spare; as a *background* color with white text on top it only reaches ~4.6:1, too tight for small button labels |
| Rust — CTA | `#B8492A` | **background color for all buttons/chips carrying white text** | darkened specifically so white-on-rust buttons clear AA with margin; verify with a contrast tool during implementation before shipping |
| Mustard Gold | `#D9A441` | gallery photo "hoop ring" frames, highlights, dark-surface accent | decorative use only, not for text-on-background pairings without a separate check |

Two color tokens, decorative-rust and CTA-rust, is a deliberate split (mirrors how NCS keeps
`--accent` vivid for buttons while `--link` is a separately-tuned darker shade for body text). Don't
collapse them into one hex value.

**Typography**: Bricolage Grotesque (headings, weights 400/600/700) + Work Sans (body, 400/500/600).
Both self-hosted via `@fontsource` to match the pattern in `nixoncreativestudio` and avoid a runtime
Google Fonts dependency. No serif anywhere in the system — this is the single biggest typographic
break from the rest of the portfolio.

**Logo**: a needle-and-thread cross, in the same horizontal lockup Mary Ann's current logo already
uses (wordmark left, cross standing to the right, a small-caps line underneath — "MADE JUST FOR
YOU" replacing "STITCHES OF HOPE & JOY", pending her sign-off on copy). The needle's vertical line
and eye form the cross's vertical bar; an arced rust thread forms the horizontal bar. A compact
version (hoop ring + cross only, no wordmark) serves as favicon / small UI mark. Locked at the
clean/geometric construction validated in brainstorming; a brush-textured pass (closer to the
hand-painted feel of her current cross) is an explicit follow-up, not a launch blocker — attempt it
as a properly hand-drawn/traced SVG rather than a generated noise-displacement filter, which reads
muddy at small sizes.

**Dark mode**: staying light-only, no toggle. This supersedes the old CLAUDE.md rule with a
considered "no" — every distinctive element of Thread Ledger (parchment paper, ink, hoop-ring photo
frames) is a light-mode idea, and the funnel (someone browsing for a gift idea, often on a phone) has
no use for a dark theme. Update `CLAUDE.md`'s "Absolute rules" section to reflect this explicitly
once implementation lands, so a future session doesn't re-litigate it.

## Motion & component vocabulary

Tactile and craft-themed, used purposefully — NOT NCS's tech-animation density (no WebGL, no
cursor-reactive shaders, no marquees). The vocabulary:

- **Running-stitch reveals**: headings and section dividers get a dashed running-stitch underline
  that draws on as it scrolls into view (reskin of NCS's `[data-reveal]` pattern, same
  `prefers-reduced-motion` gating).
- **Hoop-ring photo frames**: every gallery/product photo gets a mustard-gold ring/frame treatment
  on its container, echoing an embroidery hoop.
- **Thread-trail hover**: links and nav items get a small thread-line hover state instead of a flat
  underline or color swap.
- **Reduced-motion and focus discipline carried over from NCS wholesale**: every animation has a
  static fallback, focus-visible rings in pine teal on every interactive element, 44px touch targets
  on mobile, no color-only state changes.

**Porting from `nixoncreativestudio`**:
- The reveal-on-scroll script infrastructure (`enhance.ts` pattern), reskinned to the stitch
  vocabulary above.
- The Lighthouse CI accessibility gate (`lighthouserc.json` + workflow), pinned at 100, as a hard
  CI gate — matches the bar the rest of the studio's sites hold themselves to.
- The plaiceholder blur-up + lightbox pattern (`CaseStudyCover`-equivalent wrapper + a `Lightbox`
  component) for the Style Gallery, which is the real portfolio on this site (70+ photos) and
  deserves a proper zoomable lightbox instead of a static grid.
- The token-contrast-math discipline and the accessibility section structure in NCS's CLAUDE.md
  (landmarks, heading hierarchy, form patterns, "don't" list) as the template for MAS's own
  accessibility rules once written up.

**NOT porting**: WebGL hero (`HeroCanvas`), the three-state theme system, blog/journal collections,
case-study MDX architecture, Embla carousel (MAS has few enough testimonials that a simple grid
works), `three`/`@react-three/fiber`, Lenis smooth scroll (adds complexity without serving this
site's calmer motion budget).

## Accessibility approach

WCAG 2.1 AA baked into the tokens and components from the start, not retrofitted after the fact. No
separate audit report is being produced — findings from reviewing the current Squarespace-era site
and the existing Astro build fold directly into the implementation plan. Known gaps to close during
implementation (see also `docs/02-design-system.md`'s existing "Accessibility quick checks," which
this supersedes):

- Verify the CTA rust shade against white text with an actual contrast tool before shipping (see
  palette table above).
- Every interactive element needs a visible focus state, not just hover — carry over NCS's
  focus-ring discipline.
- Form inputs (the quote form) need associated `<label for>`, native input types, `autocomplete`
  hints, and `role="alert"` error containers — confirm `request-a-quote.astro` already does this and
  fix where it doesn't.
- Gallery/lightbox needs full keyboard operability (Escape to close, focus trap, focus return) —
  follow NCS's `Lightbox.astro` pattern (native `<dialog>` + `showModal()`).
- Decorative motion (stitch reveals, hoop frames) must be `aria-hidden` where appropriate and fully
  inert under `prefers-reduced-motion: reduce`.
- Image alt text needs a real pass once the ~80 sourced photos are categorized — "Tote bag with
  embroidered monogram" not "image1.jpg" or filler text.

## Content & photography pipeline

The live Squarespace site (`https://www.mas-monograms.com/`) was surveyed in full. Findings:

- **~80 real product photos** exist, concentrated almost entirely on `/style-gallery` (monograms,
  designs, logos, pets, seasonal/wreath, appliqué, key fobs, heat-transfer vinyl, greeting cards,
  plus a handful of raw customer phone photos). Category pages (`/tote-bags`, `/hats-caps`, etc.)
  currently each borrow just one photo from this pool rather than having dedicated photography — the
  single biggest content gap to close.
- Photography style is mixed quality (home-studio, natural light, some unedited phone shots) —
  consistent with a one-woman operation, and honestly "real work, real customers" per the existing
  site's own framing, but will need consistent cropping and light color-correction for a cohesive
  catalog feel. No reshoot is in scope for this phase; work with what exists.
- The Thread Color Chart page currently has zero swatch images (text-only) — the rebuild should add
  actual color swatches.
- The Font Guide has 9 real specimen images for named fonts (Pillow, Master Circle, Vine Heirloom,
  Golden Valley, Fishtail, Curlz, Classic, CA Liberty, "10 Popular").
- Social links on the live site are Squarespace placeholder defaults (`facebook.com/squarespace`,
  etc.) — need real URLs from Mary Ann or removal.
- Real pricing, process copy, FAQ themes, and testimonials were captured and can carry over largely
  as-is (see appendix).
- Direct CDN image URLs for all of the above were captured during research — see appendix. These
  need to be downloaded and re-uploaded into Sanity (not hotlinked from Squarespace long-term).

## Repo cleanup

`src/components/` currently carries ~30 components left over from the starter-template scaffold that
are never imported by any page (`AboutPersonal`, `BeforeAfterSlider`, `CalendlyInline`,
`CaseStudyTOC`, `FeaturedJournal`, `JournalCard`, `PressStrip`, `ServiceAreaMap`, `ThemeToggle`, and
more — confirmed via grep against `src/pages`/`src/layouts`). Removing this dead code is in scope as
part of implementation, both for hygiene and because a couple of them (`ThemeToggle.tsx`) directly
contradict the no-dark-mode decision above and shouldn't sit in the repo inviting reuse.

## Rollout

Build the full redesign in a branch/preview (new tokens, components, logo, every page migrated),
verify WCAG AA and visual QA across all routes, then cut over to `main` in one relaunch rather than
shipping page-by-page on the live site.

## Page scope

Every route in the current route table applies: `/`, `/how-it-works`, `/pricing`, `/about`,
`/request-a-quote`, `/shop-by-item`, `/[slug]` (item categories), `/style-gallery`,
`/font-lettering-guide`, `/thread-color-chart`, `/clearance`, `/thank-you`, `/404`. The Style Gallery
and category pages carry the most weight (they're the portfolio); the quote form carries the most
accessibility risk (it's the conversion point). No page is out of scope.

## Open follow-ups (not blockers for the plan)

- Brush-textured logo refinement (hand-drawn/traced, not filter-generated).
- Real social media URLs from Mary Ann.
- Tagline copy sign-off ("MADE JUST FOR YOU" is a placeholder carried from the current site's
  "made just for you" tagline, replacing "Stitches of Hope & Joy" — confirm with Mary Ann).
- Whether to reshoot any photography vs. work entirely from sourced Squarespace images (current
  decision: work from sourced images only, for this phase).

---

## Appendix: sourced image URLs (Squarespace CDN, for download + Sanity re-upload)

**Logo (current, reference only — being replaced)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/c46ea7aa-908b-449e-a942-f3b8c33bfe64/MasMonogramsText.png?format=1500w
```

**Owner portrait**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/f21fb1fe-48a2-447d-9f73-637137ec5814/Mary+Ann+Stone_JPG.jpg
```

**Monograms (style gallery, ~21)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/3560f6c2-2e1d-4942-8293-c90ddebaaca4/monogram-32.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/a4fc46d3-6f27-4def-92c7-b6e070b43a89/monogram-35.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/6245bd41-94f8-4793-938a-5a7d335ae304/monogram-40.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/3fb6c58c-b0d4-4068-a77c-02b84221a1e2/monogram-37.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/b4c45513-184e-4a20-90f6-e1f17479734e/monogram-38.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8b82f575-e781-4c8a-9d55-bcbfdd8342f2/monogram-39.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/980dac0e-8a55-48c1-935a-70b00fa12b71/monogram-41.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/612a1476-6eb8-45a8-8dc9-75bce2e973fa/monogram-43.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/0fe3ed69-0180-48ec-8507-38d2c457f107/monogram-44.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/af41c8b3-e97d-457d-b0b1-7616bb5d4378/monogram-33.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/002a093b-97db-4bf8-aa7b-4fa6e4e89d86/monogram-42.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/7986d038-8c32-49b9-a700-610f2a31b158/monogram-36.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/d33fc9bc-a8f0-494d-b70c-fa85918eeaed/monogram-27.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8dc256a4-12bd-4642-b885-bf3170b8bd96/monogram-24.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/15b3c3cf-f5d9-441d-a32f-ddb946754c5c/monogram-25.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/6edbc153-26e4-4408-b3b7-150060d55bbe/monogram-30.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/2778f6d5-6af3-4743-82b1-e33319a4d698/monogram-34.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/17be7177-b22f-48cd-9668-36ff51aa70f1/monogram-31.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/87fe6aa9-ab81-4f40-b1d2-5f75747e825c/monogram-28.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/1fb991b2-79bf-47e6-a1cc-20a8d608a93f/monogram-29.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8b12c8f2-d3d7-4b03-92a4-8a26ec36ad5e/monogram-26.jpg
```

**Designs (style gallery, ~21)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/7c17f3e0-50c6-4103-85b3-b0c47fae6fa1/design-32.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8c735da2-90a9-4b44-a63b-404d03727077/design-39.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/72fdc3e3-880c-4a8d-bc72-6a1ac5e176f8/design-33.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/da337286-3bb9-479b-9b7c-a1b2dc37a3aa/design-42.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/92348650-e5c1-4a4d-a2fb-6cf40702df63/design-36.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/12dbdafd-ea60-4344-9d38-67a05fd70493/design-29.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/37daa90e-93e5-4319-9e6b-0f74e4e553bb/design-34.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/0d8da14a-191c-459a-a644-b1f98a6d6c88/design-37.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/a4a14d28-46ad-4078-b158-4870a493965a/design-43.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/e3c20232-fd20-485f-88f9-5e4dbd13534b/design-38.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/4af09c4c-bcac-49bf-b365-49b6b98dda63/design-41.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/9ec86849-5847-49cd-8881-49c99dc43612/design-40.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/4dcae133-4095-47e8-8e0a-ee4af9456dc8/design-44.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/173db4b6-1912-4d0a-819b-5fe1c0d670a3/design-31.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/2ceed813-34a8-46db-8662-8deafe3bf081/design-24.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/e177dc85-fe69-4ca4-af15-bd7681456a35/design-35.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/1eba0c47-c39a-47d4-a8cf-1adc843cba70/design-30.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/3049d4df-da4e-4b23-8bbd-fabcca363aa9/design-25.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/60c4bf08-213d-47a1-b3e9-95c85d088196/design-26.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/d82c5544-cae2-4bb3-aef7-ac636e09cddf/design-27.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/d8fb60cb-7092-4f6e-9155-ecfdbf18f1a2/design-28.jpg
```

**Logos / business embroidery (8)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/2b515e45-690c-41f1-a260-5f63981b7fa5/logo-16.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/39fd6a6f-1ece-48f4-8578-21ec5f197d42/logo-20.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/c8941002-2d54-4aab-bd72-763f8668f937/logo-18.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/1f35e2ed-5ce8-45b0-8478-82545f88e85d/logo-12.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/621e5aba-d771-4614-ba5f-57862c5a073d/logo-13.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/d130ceb7-9f0f-4ccd-b523-b802d50c3a78/logo-17.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/6ee925a1-cd3c-4283-8ea8-d0bf87793768/logo-14.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/acddd7f7-3fd0-43b4-ad0f-17289e5c4950/logo-15.jpg
```

**Seasonal / wreath / holiday**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/f5d991f8-69ba-4027-b205-788d9a3a18df/wreath-sash-05.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/b5c41418-3aed-4bb2-bec6-4d15ac829b38/wreath-sash-06.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/db657221-4a0c-4ece-b0c2-b29e1218fce8/Bunny+Wreath+Sash.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/25e27d9b-66a1-446c-90fa-245384b6853b/Easter+T.jpg
```

**Pets (3)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/3ea27c27-488c-43d9-9ae9-86fcf3603045/pet-06.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8fb4f23d-f462-4ff2-8b54-48fdd03a9e12/pet-07.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/3148fad3-4e58-44c3-a1cf-a994c08036af/pet-08.jpg
```

**Wall hangings (2)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/016c34cd-e886-4ca9-82ff-182d2a7ac4d7/wall-hanging-05.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/69cf226b-85b0-44ed-83ce-01fa2bb6afa8/wall-hanging-06.jpg
```

**Appliqué (2)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/75df6c0c-47b2-47bf-9385-062ea91145d7/applique-05.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/022eb8a5-4753-4b0e-8d37-4add9399e0e2/applique-06.jpg
```

**Key fobs (2)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/e21d8c69-f981-44da-bc94-05dac363c5cc/fob-05.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/20f4e2fb-ecfe-42bd-a6c2-adb98d0f5e04/fob-06.jpg
```

**Heat transfer vinyl (2)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/557c292d-0664-43b4-943a-fbacd74c5321/heat-transfer-vinyl-05.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/319bb97c-f7c7-4b8a-8de9-7d7bbcc0a1d1/heat-transfer-vinyl-06.jpg
```

**Greeting card (1)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/2a0bc4bd-a99a-421e-9991-39cb6dde37ed/greeting-card-03.jpg
```

**Raw customer-order phone photos (unedited, authentic-order proof)**
```
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/20be5143-c150-40ce-b558-3a55efe0db88/20260314_104607.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/a59a8e80-611b-4373-a8bf-b7e5719b83fd/20260316_165705.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/ec147481-360f-435c-ad2f-173b59cf4387/20260308_151837.jpg
https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/bfe4db60-ea3f-44c4-b489-171616393f63/Camo+over+the+collar.jpg
```

**Font/lettering specimens (9 — note different CDN path, `/content/` not `/content/v1/`)**
```
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/a7824a28-c9e9-413f-bbd7-9e5a523fb4fe/Pillow+%281%29.jpg?content-type=image%2Fjpeg
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/01d7f218-4a92-47e1-b567-8ad820b08010/Master+Circle+%281%29.jpg?content-type=image%2Fjpeg
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/264d5150-4d41-4add-bc8d-87e542d5edc3/Vine.Heirloom+%281%29.jpg?content-type=image%2Fjpeg
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/c0e18398-be23-4218-9f0f-b57f002020e6/Golden+Valley.png?content-type=image%2Fpng
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/284f77df-29cb-493e-95d2-87ff461e30bf/Fishtail.png?content-type=image%2Fpng
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/2fa7bcdc-168c-40ba-a509-fc170db13d41/Curlz.png?content-type=image%2Fpng
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/c6c0baf8-0e4f-455d-923e-e9e917551602/Classic.png?content-type=image%2Fpng
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/a854173c-1b9d-468e-bc1a-961030079118/CA+Liberty.png?content-type=image%2Fpng
https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/c1161c6c-b544-42e5-ab60-065bbc0875a0/10+Popular+%281%29.jpg?content-type=image%2Fjpeg
```

## Appendix: copy/content notes carried from the live site

- Tagline: "Custom monogramming, made just for you."
- Process: Browse → Request → Quote → Stitch (quote within 1 business day, turnaround 3–7 business
  days)
- Founder bio line: "What started as a creative hobby three years ago has grown into something I
  truly love sharing." / "No task is too great, and I really mean that."
- Pricing: basic monogram $16, name/word stitch $16–20, premium/bordered from $18, custom appliqué
  from $45 (+$30 setup), custom embroidery/digitizing from $16 (+$30 digitization setup; complex
  jackets/sweatshirts $60–75); 7+ letter names small surcharge; rush turnaround quoted separately.
- Font names: Pillow, Master Circle, Vine Heirloom, Golden Valley, Fishtail, Curlz, Classic, CA
  Liberty, Meadow, Moonlight, Fuchsia, Hydrangea, Subscriber, Melissa, Swallow, Green Lemonade,
  Katherine, Edelweiss.
- Thread color names (8 families, ~37 colors): whites/naturals, blues, greens, pinks, reds/burgundy,
  purples, golds/yellows, grays/blacks — full list available in the live-site research, needs actual
  swatch images for the rebuilt Thread Color Chart.
- "Bring Your Own Item" accepted for: tote bags, cotton shirts, sweatshirts, towels, hats, fleece
  blankets, denim jackets, canvas pouches, backpacks, baby items.
- Location: St. Matthews, SC; replies within 1 business day; local pickup + nationwide shipping.
