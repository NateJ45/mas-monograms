// Foundation, edit with care
// =============================================================================
// Studio URL helpers - shared by the repo-root sanity.config.ts, the desk
// structure, and the Presentation location resolver (src/sanity/resolve.ts).
// =============================================================================
// Extracted out of the old studio/sanity.config.ts on 2026-08-28, when the
// nested studio/ package folded into the root one (PORTS.md card 10). Helpers
// live in this small sibling module instead of in the repo-root config file so
// structure.ts and resolve.ts can import them without a cycle back through the
// config that imports THEM.
//
// Shape ported from ncs-astro-sanity-starter/src/sanity/urls.ts; the route table
// itself is MAS Monograms', which is the per-site half.

// -----------------------------------------------------------------------------
// Env access that works in BOTH bundlers. The sanity CLI defines
// process.env.SANITY_STUDIO_*; the EMBEDDED /studio (bundled by Astro/Vite) has
// no real `process` global in the browser and exposes PUBLIC_* vars on
// import.meta.env instead. A bare `process.env.X` read would throw a
// ReferenceError the moment the embedded studio chunk evaluates.
// -----------------------------------------------------------------------------
export const envVal = (...names: string[]): string | undefined => {
  for (const n of names) {
    const fromProcess = typeof process !== 'undefined' ? process.env?.[n] : undefined;
    if (fromProcess) return fromProcess;
    const fromVite = (import.meta as { env?: Record<string, string | undefined> }).env?.[n];
    if (fromVite) return fromVite;
  }
  return undefined;
};

// Base origin for "view it live" links out of the Studio. Defaults to the local
// dev server; set SANITY_STUDIO_PREVIEW_URL (or PUBLIC_SITE_URL) to the real
// origin to point them at the deployed site.
export const SITE_URL_FOR_PREVIEW =
  envVal('SANITY_STUDIO_PREVIEW_URL', 'PUBLIC_SITE_URL') || 'http://localhost:4321';

// Map doc _type -> live-site PATH (no host). Singletons get a fixed path;
// itemCategory builds its path from the slug. Returns null for types with no
// public page of their own (siteSettings, the Start Here helper documents).
//
// Two callers depend on this staying accurate: the "view it live" affordances in
// the Studio, and src/sanity/resolve.ts, which turns these paths into the
// Presentation tool's document <-> URL mapping. Add a route here and you have
// added it to both.
export function pathForDoc(schemaType: string, doc: any): string | null {
  const slug = doc?.slug?.current;
  switch (schemaType) {
    // ── Page singletons ─────────────────────────────────────────────────────
    case 'homePage':          return '/';
    case 'howItWorksPage':    return '/how-it-works';
    case 'pricingPage':       return '/pricing';
    case 'aboutPage':         return '/about';
    case 'requestAQuotePage': return '/request-a-quote';
    case 'shopIndexPage':     return '/shop-by-item';
    case 'styleGalleryPage':  return '/style-gallery';
    case 'fontGuidePage':     return '/font-lettering-guide';
    case 'threadChartPage':   return '/thread-color-chart';
    case 'clearancePage':     return '/clearance';
    case 'thankYouPage':      return '/thank-you';
    case 'notFoundPage':      return '/404';
    // ── Collections with their own route ────────────────────────────────────
    case 'itemCategory':      return slug ? `/${slug}` : '/shop-by-item';
    case 'legalPage':         return slug ? `/legal/${slug}` : null;
    // ── Collections that render inside a parent page ────────────────────────
    case 'galleryItem':       return '/style-gallery';
    case 'font':              return '/font-lettering-guide';
    case 'threadColor':       return '/thread-color-chart';
    case 'pricingTier':       return '/pricing';
    case 'clearanceItem':     return '/clearance';
    case 'faqItem':           return '/how-it-works';
    default:                  return null;
  }
}

/** Full URL on the preview/site base. */
export function urlForDoc(schemaType: string, doc: any): string | null {
  const path = pathForDoc(schemaType, doc);
  return path === null ? null : `${SITE_URL_FOR_PREVIEW}${path}`;
}
