// Foundation, edit with care
// Single source of truth for reserved URL slugs — routes served by explicit
// Astro page files that a custom `page` document may not shadow.
//
// Used by:
//   - src/sanity/schemaTypes/page.ts   (Studio slug validation rule)
//   - src/pages/[slug].astro       (getStaticPaths filter)
//
// Keep both consumers in sync: when adding a new page route (e.g., a new
// module), add its slug here so the page builder guard stays current.

export const RESERVED_SLUGS = new Set([
  'about',
  'services',
  'process',
  'portfolio',
  'faq',
  'contact',
  'journal',
  'e-design',
  'shop',
  'gift-certificates',
  'quiz',
  'calculator',
  'resources',
  'guides',
  'press',
  'privacy',
  '404',
  'sitemap-index.xml',
  'og',
  '_astro',
  // MAS Monograms' own pages and Studio plumbing (2026-10-18): a shop category
  // named like one of these would sit on top of a real page. 'studio' is the
  // site's own /studio page since starter card 120.
  'studio',
  'preview',
  'api',
  'pricing',
  'clearance',
  'how-it-works',
  'request-a-quote',
  'shop-by-item',
  'style-gallery',
  'font-lettering-guide',
  'thread-color-chart',
  'thank-you',
  'legal',
]);

/** Returns true when a slug collides with a built-in route. */
export function isReservedSlug(slug: string | undefined | null): boolean {
  if (!slug) return false;
  return RESERVED_SLUGS.has(slug);
}
