# Hero & CTA Infrastructure Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct `CtaLink.astro` and `Hero.astro` (both leftover starter-template components with wrong routes/colors/forbidden fonts) so they can be safely adopted, then migrate `index.astro` and `[slug].astro`'s duplicated, WCAG-buggy inline hero markup onto them.

**Architecture:** `CtaLink.astro` resolves a `CtaBlock` (label + one of: raw `href`, internal document ref, external URL, email, phone) to a styled `<a>`. `Hero.astro` renders either an image hero (delegating background/scrim rendering to `HeroBackground.astro`, which already scrims correctly) or a text-only fallback hero (via `SectionHeading`), with CTAs rendered through `CtaLink`. Both files get corrected in place — same file, same general shape, wrong content replaced with right content — then two pages get their duplicated inline hero markup deleted in favor of the shared components.

**Tech Stack:** Astro 6, Tailwind CSS 4 (`@theme` tokens), existing `SanityImage`/`SectionHeading` components.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-07-01-hero-cta-infrastructure-design.md`.

---

### Task 1: Rebuild `CtaLink.astro`'s route map, colors, and href passthrough

**Files:**
- Modify: `src/components/CtaLink.astro` (full rewrite of the script section; template markup at the bottom is unchanged)

- [ ] **Step 1: Read the current file to confirm nothing has changed since this plan was written**

Run: `cat src/components/CtaLink.astro`
Expected: matches the version referenced in the design spec (stale `TYPE_TO_PATH` with `/process`/`/services`/`/faq`/`/contact`/`/journal`, `bg-primary-dark` primary variant, `fallbackHref = '/contact'`).

- [ ] **Step 2: Replace the entire script section (everything between the `---` fences) with the corrected version**

Replace lines 1-122 of `src/components/CtaLink.astro` (everything from the top comment through the `variantClasses` closing `})();`) with:

```astro
---
// Safe to edit by hand
// Resolves a CtaBlock to the right <a href>. A CtaBlock can specify its
// destination one of five ways (checked in this order):
//   - href: a pre-resolved URL string, used as-is. This is how Home's and
//     item category pages' hero CTAs work today — their Sanity fields
//     (homePage.heroPrimaryCtaHref, etc.) already store a plain string, not
//     a structured document reference, so there's nothing to "resolve."
//     Does NOT force a new tab (respects openInNewTab like any other case).
//   - internal: maps the referenced Sanity document's _type to its route.
//   - external: passes the URL through, opens in a new tab by default.
//   - email: builds a mailto: link.
//   - phone: builds a tel: link.
//
// Two visual variants + a tone modifier:
//   - "primary" — Rust CTA pill (bg-[var(--color-rust-cta)] + text-white,
//     the one button-background color per CLAUDE.md's palette table)
//   - "secondary" — outlined link with pine-teal border + text-link
//   - `onDark` toggle — for CTAs sitting over a dark surface (hero image
//     overlay). Swaps the secondary variant from pine-teal-on-light to
//     white-on-transparent so it's actually legible against the dark scrim.
//
// Both variants share generous padding, uppercase tracking, and a 44×44 minimum tap target.

interface CtaBlock {
  label?: string;
  /** A pre-resolved URL. Takes precedence over linkType if both are set. */
  href?: string;
  linkType?: 'internal' | 'external' | 'email' | 'phone';
  internalLink?: { _type?: string; slug?: string } | null;
  externalUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  openInNewTab?: boolean;
}

interface Props {
  cta?: CtaBlock | null;
  variant?: 'primary' | 'secondary';
  /** When true, swap variant colors for legibility on a dark surface. */
  onDark?: boolean;
  /** Fallback href if the CTA can't be resolved (e.g., siteSettings hasn't been populated). */
  fallbackHref?: string;
  /** Fallback label if cta.label is missing. */
  fallbackLabel?: string;
  class?: string;
}

const {
  cta,
  variant = 'primary',
  onDark = false,
  fallbackHref = '/request-a-quote',
  fallbackLabel = 'Get in touch',
  class: extraClass = '',
} = Astro.props as Props;

// Map Sanity document _type to its route. Mirrors the routes in src/pages/.
// Singletons go to a fixed path; itemCategory uses its own slug field.
const TYPE_TO_PATH: Record<string, string> = {
  homePage: '/',
  howItWorksPage: '/how-it-works',
  pricingPage: '/pricing',
  aboutPage: '/about',
  requestAQuotePage: '/request-a-quote',
  shopIndexPage: '/shop-by-item',
  styleGalleryPage: '/style-gallery',
  fontGuidePage: '/font-lettering-guide',
  threadChartPage: '/thread-color-chart',
  clearancePage: '/clearance',
  thankYouPage: '/thank-you',
};

function resolveHref(c?: CtaBlock | null): string {
  if (!c) return fallbackHref;
  if (c.href) return c.href;
  if (!c.linkType) return fallbackHref;
  switch (c.linkType) {
    case 'internal': {
      const t = c.internalLink?._type;
      if (!t) return fallbackHref;
      if (t === 'itemCategory' && c.internalLink?.slug) {
        return `/${c.internalLink.slug}`;
      }
      return TYPE_TO_PATH[t] ?? fallbackHref;
    }
    case 'external':
      return c.externalUrl ?? fallbackHref;
    case 'email':
      return c.emailAddress ? `mailto:${c.emailAddress}` : fallbackHref;
    case 'phone':
      return c.phoneNumber ? `tel:${c.phoneNumber.replace(/[^\d+]/g, '')}` : fallbackHref;
    default:
      return fallbackHref;
  }
}

const href = resolveHref(cta);
const label = cta?.label ?? fallbackLabel;
// A raw href or an internal/email/phone link never auto-opens in a new tab —
// only an actual linkType: 'external' CTA does, unless openInNewTab overrides it.
const isExternal = !cta?.href && cta?.linkType === 'external';
const newTab = cta?.openInNewTab || isExternal;

const baseClasses =
  onDark
    ? 'press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s text-xs font-semibold uppercase tracking-[0.18em] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
    : 'press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s text-xs font-semibold uppercase tracking-[0.18em] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

// Primary variant always uses Rust CTA (the one button-background color
// per CLAUDE.md's palette table) regardless of onDark — rust reads clearly
// on both parchment and the hero's dark scrim.
const variantClasses = (() => {
  if (variant === 'primary') {
    return 'bg-[var(--color-rust-cta,#b8492a)] text-white hover:bg-[var(--color-rust-cta-hover,#9c3c20)]';
  }
  // secondary
  return onDark
    ? 'border border-white/70 text-white hover:bg-white/10 hover:border-white'
    : 'border border-primary text-link hover:bg-accent';
})();
---
```

- [ ] **Step 3: Confirm the template markup below the frontmatter is unchanged**

Run: `tail -10 src/components/CtaLink.astro`
Expected: the `<a href={href} class:list={[baseClasses, variantClasses, extraClass]} ...>{label}</a>` block, identical to before — this plan doesn't touch it.

- [ ] **Step 4: Verify the file has no syntax errors**

Run: `node --check src/components/CtaLink.astro 2>&1 || npx astro check --root . 2>&1 | grep -i "CtaLink"`

Astro components aren't valid plain JS, so `node --check` will fail on the template — that's expected and not the real check. Instead run:

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output (no build errors). This does a full build, which is slower but is the only reliable syntax check for `.astro` files at this stage (nothing imports `CtaLink.astro` yet, so this just confirms the file parses).

- [ ] **Step 5: Commit**

```bash
git add src/components/CtaLink.astro
git commit -m "fix: correct CtaLink.astro routes, CTA colors, and add href passthrough"
```

---

### Task 2: Remove `Hero.astro`'s forbidden script-font and rotating-word props

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Read the current file to confirm nothing has changed**

Run: `cat src/components/Hero.astro`
Expected: matches the version referenced in the design spec (has `scriptAccent`, `rotatingWords` props, imports `splitScriptAccent`, imports `ChevronDown`, has the header comment mentioning "Cormorant Garamond" and "Contact, FAQ, Process").

- [ ] **Step 2: Replace the entire file with the corrected version**

Replace the full contents of `src/components/Hero.astro` with:

```astro
---
// Safe to edit by hand
// Page hero. Two shapes:
//   1) "image" hero (Home, item category pages) — full-bleed Sanity background
//      image with a dark scrim (rendered by HeroBackground.astro), h1 + subhead
//      + CTAs overlay.
//   2) "text" hero (used when no backgroundImage/backgroundImages is passed) —
//      clean editorial heading on Parchment with eyebrow + headline + subhead,
//      via SectionHeading.
//
// The image hero is the LCP element on the homepage. SanityImage is set to
// loading="eager" in that case. Don't add layout-shift animations to this section.

import HeroBackground from '@/components/HeroBackground.astro';
import CtaLink from '@/components/CtaLink.astro';
import SectionHeading from '@/components/SectionHeading.astro';
import { ChevronDown } from 'lucide-react';

interface CtaBlock {
  label?: string;
  href?: string;
  linkType?: 'internal' | 'external' | 'email' | 'phone';
  internalLink?: { _type?: string; slug?: string } | null;
  externalUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  openInNewTab?: boolean;
}

interface SanityImageObject {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface Props {
  eyebrow?: string;
  headline: string;
  /** Optional word/phrase rendered in italics immediately after the headline
      (e.g. Home's "Custom Embroidery, Made Just For You" pattern where the
      last word is a Sanity-editable accent). */
  headlineItalicSuffix?: string;
  subhead?: string;
  backgroundImage?: SanityImageObject | null;
  /** Optional list of hero images. 2+ render a cross-fading slideshow; 1 (or
      falling back to backgroundImage) renders a single static image. */
  backgroundImages?: SanityImageObject[] | null;
  primaryCta?: CtaBlock | null;
  secondaryCta?: CtaBlock | null;
  headingId: string;
  /** "tall" = fills the viewport below the header on first load (homepage), "short" = generous but not full screen (interior pages). */
  size?: 'tall' | 'short';
}

const {
  eyebrow,
  headline,
  headlineItalicSuffix,
  subhead,
  backgroundImage,
  backgroundImages,
  primaryCta,
  secondaryCta,
  headingId,
  size = 'short',
} = Astro.props as Props;

// Subhead emphasis: parse markdown-style _word_ markers into <em> spans so
// editors can italicize a key word in the Sanity subhead without HTML.
// Example: "Pick the tier that fits _where you are_." → italic on "where you are".
// Falls back to plain text when no markers are present.
function parseSubhead(s?: string): Array<{ type: 'text' | 'em'; value: string }> {
  if (!s) return [];
  const parts = s.split(/(_[^_]+_)/g);
  return parts.map((part) =>
    part.startsWith('_') && part.endsWith('_') && part.length > 2
      ? { type: 'em' as const, value: part.slice(1, -1) }
      : { type: 'text' as const, value: part },
  );
}
const subheadParts = parseSubhead(subhead);

// Prefer the slideshow array; fall back to the single backgroundImage so every
// other page (which only passes backgroundImage) is unaffected.
const heroImageList = (Array.isArray(backgroundImages) ? backgroundImages : []).filter(
  (img) => !!img?.asset,
);
const effectiveImages = heroImageList.length > 0
  ? heroImageList
  : (backgroundImage?.asset ? [backgroundImage] : []);
const hasImage = effectiveImages.length > 0;

// "tall" (homepage) fills the screen below the sticky header on first load.
// The exact fill height comes from the .hero-fill class plus the measured
// --header-h variable (see the inline script and scoped <style> below).
// "short" stays a generous editorial band for interior pages.
const wrapperHeight =
  size === 'tall'
    ? 'hero-fill'
    : 'min-h-[42svh] md:min-h-[52svh]';
---

{/* Full-viewport home hero plumbing (size="tall" only): measure the sticky
    header into --header-h so the hero fills exactly the space below it, and
    wire the scroll cue to glide past the hero. Runs synchronously so the
    height is set before first paint (no layout shift), then refreshes on
    load, resize, and View Transitions navigations. */}
{size === 'tall' && (
  <script is:inline>
    (function () {
      function setHeaderH() {
        var header = document.querySelector('header.site-header');
        if (header) {
          document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
        }
      }
      function wireCue() {
        var cue = document.querySelector('[data-scroll-cue]');
        if (!cue || cue.dataset.wired === '1') return;
        cue.dataset.wired = '1';
        cue.addEventListener('click', function () {
          var hero = cue.closest('section');
          if (!hero) return;
          var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
          var top = hero.offsetTop + hero.offsetHeight - hh;
          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(top);
          } else {
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        });
      }
      setHeaderH();
      wireCue();
      if (!window.__heroLayoutBound) {
        window.__heroLayoutBound = true;
        window.addEventListener('resize', setHeaderH, { passive: true });
        window.addEventListener('load', setHeaderH);
        document.addEventListener('astro:page-load', function () { setHeaderH(); wireCue(); });
      }
    })();
  </script>
)}

{hasImage ? (
  <section
    class:list={[
      'relative overflow-hidden bg-accent-dark text-bg flex flex-col justify-end',
      wrapperHeight,
    ]}
    aria-labelledby={headingId}
  >
    {/* Background: single static image or a cross-fading slideshow (2+ images),
        plus the readability overlays. See HeroBackground.astro. */}
    <HeroBackground images={effectiveImages} />

    {/* Content sits at the bottom of the section thanks to justify-end on the
        section itself. Avoids the h-full-on-flex-item brittleness that left
        content floating mid-hero on min-height containers. */}
    <div class="relative mx-auto w-full max-w-content px-m pb-section-lg pt-section-md">
      {/*
        hero-entry-stagger triggers the global page-load fade-up animation
        defined in globals.css. Each direct child of this wrapper fades up
        with a small per-child delay (eyebrow → hairline → h1 → subhead →
        CTAs). Reduced-motion users get the final composition instantly.

        Cream hairline beneath the eyebrow mirrors the SectionHeading
        inverse-tone treatment so heroes carry the same editorial signature
        as every interior section heading.
      */}
      <div class="hero-entry-stagger max-w-3xl">
        {eyebrow && (
          <p class="text-xs uppercase tracking-eyebrow text-bg/85">{eyebrow}</p>
        )}
        {eyebrow && (
          <div class="mt-xs mb-m h-px w-12 bg-bg/40" aria-hidden="true"></div>
        )}
        <h1 id={headingId} class="font-display text-h1 leading-headline-tight tracking-[-0.02em] text-bg">
          {headline}{headlineItalicSuffix && <>{' '}<em class="italic">{headlineItalicSuffix}</em></>}
        </h1>
        {subhead && (
          <p class="mt-m max-w-2xl text-lg text-bg/90">
            {subheadParts.map((part) =>
              part.type === 'em'
                ? <em class="italic font-display text-bg/95">{part.value}</em>
                : part.value
            )}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div class="mt-l flex flex-wrap gap-s">
            {primaryCta && <CtaLink cta={primaryCta} variant="primary" onDark />}
            {secondaryCta && <CtaLink cta={secondaryCta} variant="secondary" onDark />}
          </div>
        )}
      </div>
    </div>

    {/* Soft pulsing scroll cue at the bottom-center of the hero. Tells
        visitors there is more below; clicking it glides past the hero.
        Static under prefers-reduced-motion (see the scoped <style>). */}
    {size === 'tall' && (
      <button
        type="button"
        data-scroll-cue
        aria-label="Scroll down to see more"
        class="scroll-cue absolute bottom-4 left-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-bg/85 hover:text-bg hover:bg-bg/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg/70"
      >
        <ChevronDown size={28} strokeWidth={1.5} aria-hidden="true" />
      </button>
    )}
  </section>
) : (
  <section class="bg-background" aria-labelledby={headingId}>
    <div class:list={['mx-auto max-w-content px-m py-section-lg flex items-end', wrapperHeight]}>
      <SectionHeading
        eyebrow={eyebrow}
        headline={headline}
        subhead={subhead}
        headingId={headingId}
        level="h1"
      />
    </div>
  </section>
)}

<style>
  /* Full-viewport home hero. Fill the screen below the sticky header on first
     load. --header-h is measured by the inline script above; the per-breakpoint
     fallback covers the brief pre-measure window and the no-JS case (mobile
     header ~7rem, desktop with the eyebrow strip ~9.5rem). svh keeps the hero
     within the initially-visible viewport on mobile (address bar shown) so it
     never forces an immediate scroll; the vh line is the pre-svh fallback. */
  .hero-fill {
    min-height: calc(100vh - var(--header-h, 7rem));
    min-height: calc(100svh - var(--header-h, 7rem));
  }
  @media (min-width: 1024px) {
    .hero-fill {
      min-height: calc(100vh - var(--header-h, 9.5rem));
      min-height: calc(100svh - var(--header-h, 9.5rem));
    }
  }

  /* Scroll cue: a soft down-bob plus opacity pulse so it reads as "there is
     more below" without shouting. Centered with translateX(-50%) (the keyframe
     re-applies it each step). Reduced-motion users get a static, clearly
     visible chevron instead. */
  .scroll-cue {
    transform: translateX(-50%);
    animation: scroll-cue-bob 2.4s ease-in-out infinite;
  }
  @keyframes scroll-cue-bob {
    0%, 100% { transform: translate(-50%, 0); opacity: 0.55; }
    50%      { transform: translate(-50%, 0.4rem); opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .scroll-cue {
      animation: none;
      opacity: 0.85;
      transform: translateX(-50%);
    }
  }
</style>
```

- [ ] **Step 3: Confirm `splitScriptAccent` has no other callers before leaving it in place**

Run: `grep -rl "splitScriptAccent" src/`
Expected: only `src/lib/scriptAccent.ts` (its own definition) and `src/components/SectionHeading.astro`. `SectionHeading.astro` is a separate, still-used component outside this plan's scope — do NOT delete `src/lib/scriptAccent.ts`, only remove `Hero.astro`'s now-unused import of it (already done in Step 2's replacement, which has no `splitScriptAccent` import).

- [ ] **Step 4: Verify the file builds without errors**

Run: `npx astro build 2>&1 | grep -i "error"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro
git commit -m "fix: remove forbidden script-font and rotating-word props from Hero.astro"
```

---

### Task 3: Migrate `index.astro`'s hero to `<Hero />`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current file's hero section and imports to confirm nothing has changed**

Run: `sed -n '1,80p' src/pages/index.astro`
Expected: matches the version referenced in the design spec — imports at the top (no `Hero` import yet), the inline `<section class="relative min-h-[85vh] ...">` hero block at lines ~34-79, with the `heroImages`/`heroImage` consts at lines 27-29 above the `---` closing fence.

- [ ] **Step 2: Add the `Hero` import**

In `src/pages/index.astro`, change:

```astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import SanityImage from '@/components/SanityImage.astro';
import PortableText from '@/components/PortableText';
import CtaBanner from '@/components/CtaBanner.astro';
```

to:

```astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import SanityImage from '@/components/SanityImage.astro';
import PortableText from '@/components/PortableText';
import CtaBanner from '@/components/CtaBanner.astro';
```

- [ ] **Step 3: Replace the inline hero section with `<Hero />`**

Replace this block (the full `{/* ── Hero ── */}` section):

```astro
  {/* ── Hero ──────────────────────────────────────────────────────────────── */}
  <section class="relative min-h-[85vh] flex items-end overflow-hidden bg-accent">
    {heroImage && (
      <div class="absolute inset-0">
        <SanityImage
          source={heroImage}
          width={1600}
          sizes="100vw"
          class="w-full h-full object-cover opacity-50"
          loading="eager"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-accent/90 via-accent/40 to-transparent" />
      </div>
    )}
    <div class="relative mx-auto max-w-content px-m py-section-lg">
      {page?.heroEyebrow && (
        <p class="text-xs uppercase tracking-eyebrow text-cream/80 mb-s" data-reveal>{page.heroEyebrow}</p>
      )}
      <h1 class="font-display text-h1 text-cream leading-headline-tight mb-m max-w-3xl" data-reveal>
        {page?.heroHeadline ?? 'Custom Embroidery'}{' '}
        {page?.heroItalicWord && <em class="italic">{page.heroItalicWord}</em>}
      </h1>
      {page?.heroSubhead && (
        <p class="text-cream/80 mb-l max-w-xl" data-reveal>{page.heroSubhead}</p>
      )}
      <div class="flex flex-wrap gap-m" data-reveal>
        {page?.heroPrimaryCtaLabel && (
          <a
            href={page.heroPrimaryCtaHref ?? '/request-a-quote'}
            class="inline-flex items-center px-l py-m rounded-md bg-[var(--color-rust-cta,#b8492a)] hover:bg-[var(--color-rust-cta-hover,#9c3c20)] text-white text-sm uppercase tracking-eyebrow font-semibold transition-colors press-tactile"
          >
            {page.heroPrimaryCtaLabel}
          </a>
        )}
        {page?.heroSecondaryCtaLabel && (
          <a
            href={page.heroSecondaryCtaHref ?? '/how-it-works'}
            class="inline-flex items-center px-l py-m rounded-md border border-cream/40 text-cream hover:bg-cream/10 text-sm uppercase tracking-eyebrow font-semibold transition-colors"
          >
            {page.heroSecondaryCtaLabel}
          </a>
        )}
      </div>
    </div>
  </section>
```

with:

```astro
  {/* ── Hero ──────────────────────────────────────────────────────────────── */}
  <Hero
    eyebrow={page?.heroEyebrow}
    headline={page?.heroHeadline ?? 'Custom Embroidery'}
    headlineItalicSuffix={page?.heroItalicWord}
    subhead={page?.heroSubhead}
    backgroundImage={heroImage}
    primaryCta={page?.heroPrimaryCtaLabel ? { label: page.heroPrimaryCtaLabel, href: page.heroPrimaryCtaHref ?? '/request-a-quote' } : null}
    secondaryCta={page?.heroSecondaryCtaLabel ? { label: page.heroSecondaryCtaLabel, href: page.heroSecondaryCtaHref ?? '/how-it-works' } : null}
    headingId="hero-heading"
    size="tall"
  />
```

The existing `heroImage` const (line 29, `const heroImage = heroImages[0] ?? null;`) is unchanged and still used here — `Hero.astro`'s `backgroundImage` prop takes a single image, matching what Home already passes (it doesn't currently support a slideshow; that's unchanged behavior, not a regression).

- [ ] **Step 4: Check whether `SanityImage` is still used elsewhere in this file**

Run: `grep -n "SanityImage" src/pages/index.astro`
Expected: at least one remaining usage (the file renders category-grid card images and gallery preview images elsewhere using `SanityImage`, unrelated to the hero). If the only remaining match is the import line itself, remove the now-unused import; otherwise leave it — check the actual output before deciding.

- [ ] **Step 5: Check for and remove the page-scoped `.text-cream` `<style>` block**

Run: `grep -n "text-cream" src/pages/index.astro`
Expected: two matches inside a `<style>` block near the bottom of the file (`.text-cream { color: #faf8f4; }` and `.text-cream\/80 { color: rgba(250,248,244,0.80); }`). Open the file, find that `<style>` block, and delete just those two rules (if the `<style>` block contains other unrelated rules, keep the block and only remove these two; if it becomes empty, delete the whole block).

- [ ] **Step 6: Build and verify no errors**

Run: `npm run build:full 2>&1 | tail -30`
Expected: build completes successfully (`[build] Complete!`), `index.html` is among the prerendered routes.

- [ ] **Step 7: Verify the hero renders correctly and the CTA button has the right background color**

Start the dev server (`npm run dev` in the background, or use your platform's preview tooling) and check the rendered Home page:
- The primary CTA button ("Request a Quote"-style) has background-color `rgb(184, 73, 42)` (`#b8492a`, Rust CTA) — confirm via computed style inspection, the same technique used earlier this session to verify the `bg-blush` fix.
- The hero image (if `heroImages` has content in Sanity) is visibly darkened toward black/ink at the bottom where the text sits, not lightened — confirming the scrim fix.
- If Sanity currently has no `heroImages` populated for `homePage`, confirm the hero instead renders the text-only fallback (parchment background, dark ink heading) rather than a blank/broken section.

- [ ] **Step 8: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0` (no regressions — this migration doesn't touch anything the existing tests cover, but this is a repo convention check before every commit).

- [ ] **Step 9: Commit**

```bash
git add src/pages/index.astro
git commit -m "refactor: migrate index.astro hero to Hero.astro, fixing the scrim contrast bug"
```

---

### Task 4: Migrate `[slug].astro`'s hero to `<Hero />`

**Files:**
- Modify: `src/pages/[slug].astro`

- [ ] **Step 1: Read the current file's hero section and imports to confirm nothing has changed**

Run: `sed -n '1,80p' "src/pages/[slug].astro"`
Expected: matches the version referenced in the design spec — imports at the top (no `Hero` import yet), the inline `<section class="relative min-h-[60vh] ...">` hero block starting at line ~46, with `heroImages`/`primaryHero` consts at lines 39-40 above the `---` closing fence.

- [ ] **Step 2: Add the `Hero` import**

In `src/pages/[slug].astro`, change:

```astro
import type { GetStaticPaths } from 'astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import SanityImage from '@/components/SanityImage.astro';
import CtaBanner from '@/components/CtaBanner.astro';
```

to:

```astro
import type { GetStaticPaths } from 'astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import SanityImage from '@/components/SanityImage.astro';
import CtaBanner from '@/components/CtaBanner.astro';
```

- [ ] **Step 3: Replace the inline hero section with `<Hero />`**

First, read the full current hero block to get its exact end line:

Run: `sed -n '43,78p' "src/pages/[slug].astro"`

This shows the full `<section>...</section>` block (starting `{/* Hero */}`, ending after the closing `</section>` tag, right before the `{/* Trust items */}` comment). Replace that entire block with:

```astro
  {/* Hero */}
  <Hero
    backgroundImages={heroImages}
    eyebrow={category?.eyebrow}
    headline={category.name}
    subhead={category?.description}
    primaryCta={{ label: category?.ctaLabel ?? 'Request a Quote', href: '/request-a-quote' }}
    headingId="category-heading"
    size="short"
  />
```

This reuses the page-local `heroImages` const (line 39, `const heroImages = (category?.heroImages ?? []).filter((img: any) => img?.asset);`) rather than re-filtering `category.heroImages` directly — that const is NOT unused after this change, since the page's later "Additional hero images as detail grid" section (further down the file) also reads it via `heroImages.slice(1)` to show every hero image after the first one. Don't remove it.

- [ ] **Step 4: Remove only the now-unused `primaryHero` const**

In the frontmatter section, remove this one line (keep the `heroImages` line above it — it's still used both by the `<Hero />` call above and the "Additional hero images" grid later in the file):

```ts
const primaryHero = heroImages[0] ?? null;
```

Run: `grep -n "primaryHero" "src/pages/[slug].astro"` afterward to confirm zero remaining references (it was only used inside the old inline hero block this task replaced). Run: `grep -n "heroImages" "src/pages/[slug].astro"` to confirm it still has at least two usages — the new `<Hero backgroundImages={heroImages} />` call and the existing `{heroImages.length > 1 && (...)}` / `heroImages.slice(1)` detail-grid section (~line 121-125).

- [ ] **Step 5: Check whether `SanityImage` is still used elsewhere in this file**

Run: `grep -n "SanityImage" "src/pages/[slug].astro"`
Expected: at least one remaining usage (the "additional hero images" grid and related-gallery masonry both render images via `SanityImage`, per the earlier page survey). If the only remaining match is the import line itself, remove the now-unused import; otherwise leave it.

- [ ] **Step 6: Check for and remove the page-scoped `.text-cream` `<style>` block**

Run: `grep -n "text-cream" "src/pages/[slug].astro"`
Expected: two matches inside a `<style>` block near the bottom of the file, identical pattern to Task 3 Step 5. Remove those two rules the same way.

- [ ] **Step 7: Build and verify no errors**

Run: `npm run build:full 2>&1 | tail -30`
Expected: build completes successfully, all 7 category routes (`/tote-bags`, `/towels-linens`, `/hats-caps`, `/shirts-tops`, `/jackets-sweatshirts`, `/baby-kids`, `/home-gifts`) plus `/bring-your-own-item` are among the prerendered routes with no errors.

- [ ] **Step 8: Verify a category page's hero renders correctly**

Using dev server or preview tooling, load a category page (e.g. `/tote-bags`, which has multiple `heroImages` per the Plan 2 import) and confirm:
- The CTA button background is `rgb(184, 73, 42)` (Rust CTA).
- The hero shows a cross-fading slideshow (since `tote-bags` has 3 hero images per Plan 2's import) rather than a single static image — this is new behavior versus before, confirm it looks intentional, not broken.
- `/bring-your-own-item` (which has no hero images per Plan 2's `categoriesMissingPhotos` findings — confirm via `node -e "..."` Sanity query if uncertain) renders the text-only fallback hero cleanly.

- [ ] **Step 9: Run the full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 10: Commit**

```bash
git add "src/pages/[slug].astro"
git commit -m "refactor: migrate [slug].astro hero to Hero.astro, fixing the scrim contrast bug"
```

---

### Task 5: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `npm run build:full`
Expected: succeeds, no errors, all 13 static routes plus the 8 category routes prerender successfully.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: `tests 93`, `pass 93`, `fail 0`.

- [ ] **Step 3: Grep for any remaining references to the removed Hero.astro props**

Run: `grep -rn "scriptAccent\|rotatingWords" src/`
Expected: no matches in `src/components/Hero.astro` or any page. (`src/lib/scriptAccent.ts` and its use in `SectionHeading.astro` are a different, intentionally-untouched feature — matches there are expected and fine.)

- [ ] **Step 4: Grep for any remaining references to the old CtaLink route map**

Run: `grep -n "process\|/services\|/faq\|/contact\|/journal" src/components/CtaLink.astro`
Expected: no matches (all removed in Task 1).

- [ ] **Step 5: Visual spot-check across both migrated pages**

Using dev server or preview tooling:
- Home (`/`): hero CTA buttons are Rust CTA colored, hero text is legible over the image, page loads with no console errors.
- One category page with multiple hero images (`/tote-bags`): slideshow works, CTA button correct.
- One category page (spot-check any other): hero renders correctly.

- [ ] **Step 6: Report**

No commit needed for this task (verification only). Report: build status, test count, and confirm the two visual spot-checks passed.
