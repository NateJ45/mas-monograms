// Foundation, edit with care
// The ONE place a Sanity `navLink` becomes a web address.
// (ported from presacademy 2026-08-27; the "chrome options" pattern)
//
// Every menu Mary Ann can edit — the top menu, the footer link columns, the
// small-print row, the quote button — comes through here, so a page type maps
// to an address in exactly ONE table.
//
// THE MAP MIRRORS SINGLETON_PREVIEW_PATHS in src/sanity/resolve.ts with the
// `/preview` prefix removed. When a page moves, change both.
//
// Two kinds of destination beyond the fixed pages:
//   - itemCategory documents -> /<slug>  (src/pages/[slug].astro)
//   - legalPage documents    -> /legal/<slug>
// There is no `page` document type in this Studio, so there is no bare
// slug-page case.
//
// Which one wins inside a single link:
//   1. the address typed by hand. It wins, so every menu that was set up by
//      typing addresses keeps working exactly as it did.
//   2. the page picked from the list, worked out from the page it points at.
//   3. the pasted web address.
//
// A link that ends up pointing nowhere (a page that was deleted, an empty box)
// returns undefined and is DROPPED by whoever asked for it. A dead link in a
// menu is worse than no link.

/** Web address per fixed page. Mirrors SINGLETON_PREVIEW_PATHS. */
export const SINGLETON_LIVE_PATHS: Record<string, string> = {
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
  notFoundPage: '/404',
};

/**
 * Document types whose pages each live under a shared address. The page's own
 * slug is added on the end. An empty prefix means a bare /<slug> address.
 */
const COLLECTION_ROUTE_PREFIXES: Record<string, string> = {
  itemCategory: '',
  legalPage: '/legal',
};

/** One navLink as NAV_LINK_PROJECTION in src/lib/queries.ts returns it. */
export interface RawNavLink {
  _type?: string | null;
  _key?: string | null;
  label?: string | null;
  linkType?: string | null;
  /** The address typed by hand. Wins over everything else when set. */
  href?: string | null;
  externalUrl?: string | null;
  /** internalPage->slug.current */
  slug?: string | null;
  /** internalPage->_type */
  docType?: string | null;
}

/** A link that came through resolution with both halves present. */
export interface ResolvedNavLink {
  label: string;
  href: string;
}

/**
 * The stega character class, built from escapes inside a plain string so no
 * invisible character is ever typed literally into this file. Declared BEFORE
 * its only caller: a const referenced from a function that already ran would be
 * a temporal-dead-zone crash, and this module is imported by the header.
 */
const STEGA_CHARS = new RegExp('[\u200B-\u200F\uFEFF\u{E0000}-\u{E007F}]', 'gu');

/**
 * Strip the invisible characters Sanity's stega encoder hides inside strings in
 * preview builds (Unicode tag characters, plus the zero-width family). Labels
 * keep theirs — that is what makes click-to-edit work in the preview — but
 * anything used as LOGIC or as a web address must be compared and emitted clean.
 */
export function plain(value?: string | null): string {
  if (typeof value !== 'string') return '';
  return value.replace(STEGA_CHARS, '').trim();
}

/** Work out where one link points, or undefined when it points nowhere. */
export function navHref(link?: RawNavLink | null): string | undefined {
  if (!link) return undefined;

  const typed = plain(link.href);
  if (typed) return typed;

  if (plain(link.linkType) === 'external') {
    return plain(link.externalUrl) || undefined;
  }

  const docType = plain(link.docType);
  if (!docType) return undefined;
  const prefix = COLLECTION_ROUTE_PREFIXES[docType];
  if (prefix !== undefined) {
    const slug = plain(link.slug);
    return slug ? `${prefix}/${slug}` : undefined;
  }
  return SINGLETON_LIVE_PATHS[docType];
}

/** True when an address leaves this site (so the link opens in a new tab). */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

/**
 * Turn a list of Sanity links into renderable {label, href} pairs, dropping
 * every entry with no label or no destination. Labels pass through untouched so
 * click-to-edit still works in the preview.
 */
export function resolveNavLinks(links?: (RawNavLink | null)[] | null): ResolvedNavLink[] {
  if (!Array.isArray(links)) return [];
  const out: ResolvedNavLink[] = [];
  for (const link of links) {
    const label = link?.label;
    const href = navHref(link);
    if (!label || !href) continue;
    out.push({ label, href });
  }
  return out;
}
