# 07: Component & Route Map

> **As-built (updated 2026-10-04).** This doc originally proposed a layout before the build; it now
> reflects what was actually shipped, through the "Heirloom Coast" rebrand and "Direction D, The
> Atelier" (branch `redesign/atelier`). Route + redirect table is in `docs/01` and
> `.claude/rules/site-routes.md` (also the quote query-string contract); design system and the motif
> catalog in `docs/02`; the engine in `.claude/rules/atelier-engine.md`; deployment in `docs/08`.

---

## `src/` layout (as built)

```
src/
  pages/
    index.astro                 homepage (homePage singleton; pulls from everything)
    about.astro
    how-it-works.astro
    pricing.astro
    request-a-quote.astro       the quote form
    thank-you.astro
    shop-by-item.astro
    style-gallery.astro
    font-lettering-guide.astro
    thread-color-chart.astro
    clearance.astro
    404.astro
    [slug].astro                dynamic: builds /tote-bags, /towels-linens, … from itemCategory docs
    legal/[slug].astro          legal pages
    robots.txt.ts               build-time robots.txt endpoint
    preview/                    SSR draft preview for the Presentation tool
    api/
      quote.ts                  quote-form Worker (Turnstile → R2 backup → Resend); prerender = false
      draft-mode/               draft mode on/off for the preview
  components/
    Header.astro                header + dropdown folders (indigo eyebrow strip)
    MobileNav.tsx               the phone menu (React + Radix Sheet). NOT an island since 2026-10-04:
    mobileNavMount.tsx          Header.astro server-renders a look-alike menu button and imports this
                                module on the first tap or interaction anywhere, or 2.5s after load plus
                                an idle moment, then swaps the real menu in (flushSync, no blank frame).
                                Keeps React (~80 KB) off the first paint. tests/features.spec.ts covers it
    Footer.astro
    Logo.astro                  the hybrid logo: Flourished-Initial lockup + Badge mark
    Hero.astro                  legacy page hero; only the /preview shell and a unit test still use it
                                (with HeroBackground, HeroFillScript, HeroSlideshowScript, HeroTriScript).
                                The live pages use their own Direction D heroes
    ScriptKicker.astro          the one-per-page Petemoss kicker (claret on light / gold on dark)
    SectionHeading.astro        eyebrow + headline (+ italic swash word) + subhead heading block
    CategoryCard.astro          shop-category card (shop-by-item and category pages)
    CtaLink.astro               the single button recipe (onDark flips to paper-on-indigo)
    CtaBanner.astro             recurring bottom-of-page CTA band (data-thread-end)
    ProcessStepIllustration.astro  pattern-sheet illustration for a process step (ProcessStep.astro is unused)
    SanityImage.astro           responsive images through the Sanity CDN
    PortableText.tsx            rich-text renderer, rendered at BUILD time (no client: directive; it has no
                                state, so an island only shipped ~110 KB of JS, 2026-10-04)
    FaqAccordion.tsx            FAQ accordion (React island, client:visible). Answers are force-mounted so
                                they exist in the HTML; globals.css hides closed ones (data-state) with JS
                                and shows them all with no JS
    BackToTop.tsx
    atelier/                    THE MONOGRAM ATELIER UI. AtelierStage (+Script: lazy engine import, pause
                                off-screen), HeroAtelierStage (engine started by HomeHeroScript),
                                AtelierStudio (+Script, atelierStudioData.ts: the full controls)
    home/                       HomeHero (+Script), HoopWall, MakerBand, ProcessPath (+Script), StudioWall,
                                FinalCta, swashSplit.ts
    thread/                     SpoolRack, StitchPanel, ThreadChartScript, threadData.ts (/thread-color-chart)
    quote/                      QuoteFormScript (form behaviour, moved unchanged), QuotePrefillScript
                                (query-string contract), QuotePreview, QuoteSteps
    gallery/                    Lightbox (native dialog), lightboxData.ts, GallerySwatch, EmptyHoopOrnament, swash.ts
    motifs/                     ThreadLine (+Script: golden thread and legibility mask), RevealScript, HoopFrame,
                                SwatchCard, HangTag, Spool, RunningStitch, Marquee (+Script), Needle, uid.ts
    preview/                    Presentation-tool preview shell pieces
    ui/                         shadcn primitives (accordion, button, sonner, sheet, …)
  layouts/
    BaseLayout.astro            <html>, head, SEO + OG meta, JSON-LD, ClientRouter, Header, ThreadLine,
                                RevealScript, <slot/>, Footer
  lib/
    sanity.ts                   Sanity client + image URL builder + guarded sanityFetch()
    queries.ts                  every GROQ query (one per page + the collection fetches); includes
                                getAtelierSettings() and getGalleryItemsForWall()
    schemas.ts                  JSON-LD builders (LocalBusiness)
    sanity.types.ts             generated by `npm run typegen`
    atelier/                    the embroidery engine: engine.ts (createAtelier), layout, field, stitches,
                                geometry, raster, color, fabric, noise, fonts, compute.ts +
                                atelier.worker.ts (module worker), atelier.test.ts
  styles/
    globals.css                 Tailwind v4 entry + ALL design tokens (the `@theme` block) + base styles
    starwind.css                thin adapter mapping shadcn/Starwind tokens onto the brand tokens
  data/
    site.ts                     static identity values (domain, brand colors) — NOT content
public/
  favicon.svg · og/ · _redirects · _headers · robots
src/sanity/                     the Sanity Studio schemas (schemaTypes/, structure.ts); config at the
                                repo-root sanity.config.ts, embedded at /studio
```

Two differences from the original plan worth noting:

- The quote/contact backend is `src/pages/api/quote.ts` (an Astro endpoint that runs as a Worker),
  **not** a `functions/` Pages Function. Cloudflare merged Pages into Workers in early 2026.
- The 2026-10-04 redesign extracted the home page into `components/home/`, and the Atelier, thread
  chart, quote and gallery pieces into their own folders; other pages (pricing, about, how-it-works,
  clearance...) still keep their sections inline in the page `.astro` files. SEO/OG lives in
  `BaseLayout.astro`, not a separate `Seo.astro`.
- **Never put a `<script>` in a JSX expression;** every client script lives in its own `*Script.astro`
  component (`.claude/rules/design-system.md`).
- Three sections that existed in earlier drafts are **gone**: the homepage "most popular combinations"
  block (and its `popularCombination` type), the testimonials rows on Home and About (and the
  `testimonial` type), and the homepage stats strip. Don't reintroduce them without real content.

---

## Squarespace section → where it lives now

| Squarespace section                     | Lives in                                                                                              | Data source                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Two-column hero                         | `home/HomeHero.astro`; inline elsewhere                                                               | `homePage`, `atelierSettings`; page singleton or `itemCategory` |
| Live monogram preview (new, 2026-10-04) | `atelier/AtelierStudio.astro` on `/`; `thread/` on `/thread-color-chart`; `quote/QuotePreview.astro`  | `atelierSettings`, `threadColor`                                |
| 4-step "How it works" strip             | `home/ProcessPath.astro`, inline in `how-it-works.astro`                                              | `processSteps[]` / `steps[]`                                    |
| Category card grid                      | `home/HoopWall.astro`, `CategoryCard` on `shop-by-item.astro`                                         | `itemCategory` docs                                             |
| Gallery grid                            | `gallery/GallerySwatch` + `Lightbox` (`style-gallery.astro`, `[slug].astro`); `home/StudioWall.astro` | `galleryItem` docs                                              |
| Pricing tier cards                      | inline (`pricing.astro`)                                                                              | `pricingTier` docs (rendered "from $X")                         |
| About "why come back" cards             | inline (`about.astro`)                                                                                | `aboutPage.values[]`                                            |
| FAQ                                     | `FaqAccordion.tsx`                                                                                    | `faqItem` docs                                                  |
| Quote form                              | `request-a-quote.astro` + `src/pages/api/quote.ts`                                                    | Sanity for labels, Resend for send                              |
| Footer                                  | `Footer.astro`                                                                                        | `siteSettings`                                                  |
| CTA banner                              | `CtaBanner.astro`                                                                                     | page singleton CTA fields                                       |
| Rich text (about, intros, FAQ answers)  | `PortableText.tsx`                                                                                    | Portable Text fields                                            |

---

## Data flow

Astro builds static pages in CI at deploy time. Each page's frontmatter runs GROQ queries through
`lib/queries.ts` → `lib/sanity.ts`, gets data, and renders. **No client-side data fetching for
content.** Images go through Sanity's URL builder (`SanityImage.astro`). The server-side runtime code is
the quote-form Worker and the preview routes. In the browser, the Atelier engine (code-split, in a worker)
draws the live embroidery from `data-*` attributes and props that were rendered from Sanity at build time;
it fetches nothing but its lettering font files, on demand.

Content refreshes only when a build runs (push to `main`, or — recommended, not yet wired — a Sanity
webhook → Cloudflare deploy hook). See `docs/08`.

---

## Component editing guidance

Keep components small and single-purpose; comment the non-obvious parts (the accent-word heading
treatment, the form's progressive-enhancement and safe-DOM file rendering). Pull all colors, fonts,
spacing, and radii from the tokens in `src/styles/`, never hardcode. Test on a PR build
before merging to `main`. After any Sanity schema change, run `npm run typegen`.
