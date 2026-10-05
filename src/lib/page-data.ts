// =============================================================================
// page-data - ONE loader per page, shared by the live site and the preview
// (2026-10-05, Phase C of the Studio upgrade: "Edit on the page shows the REAL
// redesigned pages")
// =============================================================================
// Every page is split in two:
//
//   - a LOADER here, which runs the page's queries through a `Fetcher`, and
//   - a BODY component in src/components/pages/<Name>Body.astro, which draws
//     the page from the loader's result and fetches nothing.
//
// The static page (src/pages/<name>.astro) calls the loader with the default
// fetcher (published content, build time) and wraps the body in BaseLayout.
// The preview route (src/pages/preview/[...slug].astro) calls the SAME loader
// with `previewFetcher(draftMode)` (drafts, stega on, per request) and wraps the
// SAME body in PreviewLayout. So the canvas Mary Ann edits in IS her website,
// and the two cannot drift: there is one query and one piece of markup.
//
// The loaders only gather; they never shape. Anything a body derives from the
// data (a filtered list, a split headline) is derived inside the body, so the
// preview derives it from the draft the same way.
// =============================================================================
import {
  type AtelierSettings,
  type Fetcher,
  getAboutPage,
  getAllClearanceItems,
  getAllFonts,
  getAllGalleryItems,
  getAllItemCategories,
  getAllPricingTiers,
  getAllThreadColors,
  getAtelierSettings,
  getClearancePage,
  getFaqItemsForHowItWorks,
  getFaqItemsForPricing,
  getFeaturedGalleryItems,
  getFontGuidePage,
  getGalleryItemsForWall,
  getHomePage,
  getHowItWorksPage,
  getItemCategoryBySlug,
  getNotFoundPage,
  getPricingPage,
  getRequestAQuotePage,
  getShopIndexPage,
  getStyleGalleryPage,
  getThankYouPage,
  getThreadChartPage,
} from './queries';
import { sanityFetch } from './sanity';

export type { Fetcher };

/**
 * What the preview route hands a page so it draws itself as the canvas. A page
 * file is an Astro component like any other, so src/pages/preview/[...slug].astro
 * renders the REAL page file with this prop: the page skips its own published
 * fetch, uses the draft `data`, and wraps its markup in `layout` (PreviewLayout)
 * with `layoutProps` on top of its own BaseLayout props. On the live site the
 * prop is absent and the page is exactly what it was.
 */
export interface PagePreview<T> {
  /** The page's loader result, read from drafts with stega on. */
  data: T;
  /** Draft siteSettings, for the few pages that show contact details. */
  siteSettings: any;
  /** The page document, for photo and list click targets (src/lib/edit-target.ts). */
  edit: import('./preview-edit-attr.ts').EditDoc;
  /** The shell to draw the page in (PreviewLayout). */
  layout: unknown;
  /** Extra props for that shell (draftMode, pageId, livePath, categorySlugs). */
  layoutProps: Record<string, unknown>;
}

/** The props every page file accepts: nothing on the live site, `preview` in the canvas. */
export interface PageProps<T> {
  preview?: PagePreview<T>;
}

/** The live site's fetcher: published content, read at build time. */
export const publishedFetcher: Fetcher = sanityFetch;

/**
 * The preview's fetcher, built from the draft-aware client in
 * src/lib/cms-preview.ts. A query that finds nothing answers with the same
 * fallback the live page would get (an empty list, or null), so a body never
 * sees `null` where the live page sees `[]`.
 *
 * Takes the fetch function rather than importing cms-preview here: that module
 * reads the Worker runtime env (`cloudflare:workers`) and must never be pulled
 * into a prerendered page's graph.
 */
export function previewFetcher(
  fetchDraft: <T>(query: string, params: Record<string, unknown>) => Promise<T>,
): Fetcher {
  return async <T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> => {
    const result = await fetchDraft<T | null>(query, params);
    return result ?? fallback;
  };
}

// -----------------------------------------------------------------------------
// Home
// -----------------------------------------------------------------------------

export interface HomeData {
  page: any;
  categories: any[];
  atelier: AtelierSettings | null;
  threads: any[];
  wallItems: any[];
}

export async function loadHome(fetch: Fetcher = publishedFetcher): Promise<HomeData> {
  const [page, categories, atelier, threads, wallItems] = await Promise.all([
    getHomePage(fetch),
    getAllItemCategories(fetch),
    getAtelierSettings(fetch),
    getAllThreadColors(fetch),
    getGalleryItemsForWall(12, fetch),
  ]);
  return { page, categories, atelier, threads, wallItems };
}

// -----------------------------------------------------------------------------
// About
// -----------------------------------------------------------------------------

export interface AboutData {
  page: any;
  recentWork: any[];
}

export async function loadAbout(fetch: Fetcher = publishedFetcher): Promise<AboutData> {
  const [page, recentWork] = await Promise.all([
    getAboutPage(fetch),
    getFeaturedGalleryItems(3, fetch),
  ]);
  return { page, recentWork };
}

// -----------------------------------------------------------------------------
// HowItWorks
// -----------------------------------------------------------------------------

export interface HowItWorksData {
  page: any;
  faqs: any[];
}

export async function loadHowItWorks(fetch: Fetcher = publishedFetcher): Promise<HowItWorksData> {
  const [page, faqs] = await Promise.all([
    getHowItWorksPage(fetch),
    getFaqItemsForHowItWorks(fetch),
  ]);
  return { page, faqs };
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------

export interface PricingData {
  page: any;
  tiers: any[];
  faqs: any[];
}

export async function loadPricing(fetch: Fetcher = publishedFetcher): Promise<PricingData> {
  const [page, tiers, faqs] = await Promise.all([
    getPricingPage(fetch),
    getAllPricingTiers(fetch),
    getFaqItemsForPricing(fetch),
  ]);
  return { page, tiers, faqs };
}

// -----------------------------------------------------------------------------
// ShopByItem
// -----------------------------------------------------------------------------

export interface ShopByItemData {
  page: any;
  categories: any[];
  threads: any[];
}

export async function loadShopByItem(fetch: Fetcher = publishedFetcher): Promise<ShopByItemData> {
  const [page, categories, threads] = await Promise.all([
    getShopIndexPage(fetch),
    getAllItemCategories(fetch),
    getAllThreadColors(fetch),
  ]);
  return { page, categories, threads };
}

// -----------------------------------------------------------------------------
// StyleGallery
// -----------------------------------------------------------------------------

export interface StyleGalleryData {
  page: any;
  items: any[];
}

export async function loadStyleGallery(
  fetch: Fetcher = publishedFetcher,
): Promise<StyleGalleryData> {
  const [page, items] = await Promise.all([getStyleGalleryPage(fetch), getAllGalleryItems(fetch)]);
  return { page, items };
}

// -----------------------------------------------------------------------------
// FontGuide
// -----------------------------------------------------------------------------

export interface FontGuideData {
  page: any;
  allFonts: any[];
}

export async function loadFontGuide(fetch: Fetcher = publishedFetcher): Promise<FontGuideData> {
  const [page, allFonts] = await Promise.all([getFontGuidePage(fetch), getAllFonts(fetch)]);
  return { page, allFonts };
}

// -----------------------------------------------------------------------------
// ThreadChart
// -----------------------------------------------------------------------------

export interface ThreadChartData {
  page: any;
  colors: any[];
  atelier: AtelierSettings | null;
}

export async function loadThreadChart(fetch: Fetcher = publishedFetcher): Promise<ThreadChartData> {
  const [page, colors, atelier] = await Promise.all([
    getThreadChartPage(fetch),
    getAllThreadColors(fetch),
    getAtelierSettings(fetch),
  ]);
  return { page, colors, atelier };
}

// -----------------------------------------------------------------------------
// Clearance
// -----------------------------------------------------------------------------

export interface ClearanceData {
  page: any;
  items: any[];
}

export async function loadClearance(fetch: Fetcher = publishedFetcher): Promise<ClearanceData> {
  const [page, items] = await Promise.all([getClearancePage(fetch), getAllClearanceItems(fetch)]);
  return { page, items };
}

// -----------------------------------------------------------------------------
// RequestQuote
// -----------------------------------------------------------------------------

export interface RequestQuoteData {
  page: any;
  itemCategories: any[];
  fonts: any[];
  atelier: AtelierSettings | null;
  threadColors: any[];
}

export async function loadRequestQuote(
  fetch: Fetcher = publishedFetcher,
): Promise<RequestQuoteData> {
  const [page, itemCategories, fonts, atelier, threadColors] = await Promise.all([
    getRequestAQuotePage(fetch),
    getAllItemCategories(fetch),
    getAllFonts(fetch),
    getAtelierSettings(fetch),
    getAllThreadColors(fetch),
  ]);
  return { page, itemCategories, fonts, atelier, threadColors };
}

// -----------------------------------------------------------------------------
// ThankYou
// -----------------------------------------------------------------------------

export interface ThankYouData {
  page: any;
}

export async function loadThankYou(fetch: Fetcher = publishedFetcher): Promise<ThankYouData> {
  const [page] = await Promise.all([getThankYouPage(fetch)]);
  return { page };
}

// -----------------------------------------------------------------------------
// NotFound
// -----------------------------------------------------------------------------

export interface NotFoundData {
  page: any;
}

export async function loadNotFound(fetch: Fetcher = publishedFetcher): Promise<NotFoundData> {
  const [page] = await Promise.all([getNotFoundPage(fetch)]);
  return { page };
}

// -----------------------------------------------------------------------------
// Category pages (/<slug>, one per itemCategory)
// -----------------------------------------------------------------------------

export interface CategoryData {
  slug: string;
  category: any;
  allGallery: any[];
  allCategories: any[];
  galleryPage: any;
  shopPage: any;
}

export async function loadCategory(
  slug: string,
  fetch: Fetcher = publishedFetcher,
): Promise<CategoryData> {
  const [category, allGallery, allCategories, galleryPage, shopPage] = await Promise.all([
    getItemCategoryBySlug(slug, fetch),
    getAllGalleryItems(fetch),
    getAllItemCategories(fetch),
    getStyleGalleryPage(fetch),
    getShopIndexPage(fetch),
  ]);
  return { slug, category, allGallery, allCategories, galleryPage, shopPage };
}
