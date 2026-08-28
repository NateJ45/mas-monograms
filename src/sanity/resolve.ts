// Foundation, edit with care
// =============================================================================
// Presentation Tool location resolver
// (ported from ncs-astro-sanity-starter 2026-08-28, PORTS.md card 10)
// =============================================================================
// Two halves:
//
//  - `mainDocuments` (URL -> document): as Mary Ann clicks through the preview
//    iframe like a normal website, Presentation opens the matching document in
//    the editor panel automatically. Routes match the iframe pathname (which
//    lives under /preview).
//
//  - `locations` (document -> URL): the reverse, so opening a document from the
//    desk points the preview at the right page. Page singletons map to their
//    fixed preview path; collection docs (galleryItem, itemCategory, pricingTier,
//    clearanceItem, threadColor, font, faqItem) have no dedicated draft-preview
//    route, so they land on the page they appear on.
//
// The preview routes themselves live in the site app: src/pages/preview/.
// SINGLETON_PREVIEW_PATHS is the SAME map as PREVIEW_PAGES in
// src/pages/preview/[...slug].astro, and as FIRST_SEGMENT_PREVIEWABLE in
// src/layouts/PreviewLayout.astro's click interceptor. Three places, one truth:
// change one and change all three.
// =============================================================================
import {
  defineDocuments,
  type PresentationPluginOptions,
} from 'sanity/presentation';

/** Preview path per page singleton. */
export const SINGLETON_PREVIEW_PATHS: Record<string, string> = {
  homePage: '/preview',
  howItWorksPage: '/preview/how-it-works',
  pricingPage: '/preview/pricing',
  aboutPage: '/preview/about',
  requestAQuotePage: '/preview/request-a-quote',
  shopIndexPage: '/preview/shop-by-item',
  styleGalleryPage: '/preview/style-gallery',
  fontGuidePage: '/preview/font-lettering-guide',
  threadChartPage: '/preview/thread-color-chart',
  clearancePage: '/preview/clearance',
  thankYouPage: '/preview/thank-you',
  notFoundPage: '/preview/404',
};

// One static location entry per singleton.
const singletonLocations = Object.fromEntries(
  Object.entries(SINGLETON_PREVIEW_PATHS).map(([type, href]) => [
    type,
    { locations: [{ title: 'Preview', href }] },
  ]),
);

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/preview', filter: '_type == "homePage"' },
    ...Object.entries(SINGLETON_PREVIEW_PATHS)
      .filter(([type]) => type !== 'homePage')
      .map(([type, href]) => ({ route: href, filter: `_type == "${type}"` })),
  ]),
  locations: {
    ...singletonLocations,
    // Collection docs have no draft-preview route of their own. Send each to the
    // page it renders on, with a note where a live-only detail page exists.
    galleryItem: { locations: [{ title: 'Style Gallery', href: '/preview/style-gallery' }] },
    itemCategory: {
      locations: [{ title: 'Shop by Item', href: '/preview/shop-by-item' }],
      message: 'Each category also has its own /<slug> page, which previews on the live site.',
    },
    pricingTier: { locations: [{ title: 'Pricing', href: '/preview/pricing' }] },
    clearanceItem: { locations: [{ title: 'Clearance', href: '/preview/clearance' }] },
    threadColor: {
      locations: [{ title: 'Thread Color Chart', href: '/preview/thread-color-chart' }],
    },
    font: { locations: [{ title: 'Font & Lettering Guide', href: '/preview/font-lettering-guide' }] },
    faqItem: { locations: [{ title: 'How It Works', href: '/preview/how-it-works' }] },
    legalPage: {
      locations: [{ title: 'Home', href: '/preview' }],
      message: 'Legal pages render at /legal/<slug> on the live site after publish.',
    },
    siteSettings: {
      locations: [{ title: 'Home', href: '/preview' }],
      message: 'Business info shows in the header, footer and contact details on every page.',
    },
  },
};
