// Safe to edit by hand (the paths); the words live in src/sanity/qrCopy.ts
// =============================================================================
// QR codes: where the code takes people
// =============================================================================
// Five pages on her own site (paths from src/sanity/urls.ts pathForDoc), plus
// three outside addresses that come from her business details: her Google
// review link, her Facebook page and her Instagram. An outside choice with no
// address yet is shown greyed out with a way to add it.
// =============================================================================

import { parseWebAddress, sitePage } from './url.ts';

export const DESTINATION_IDS = [
  'home',
  'quote',
  'gallery',
  'threads',
  'clearance',
  'review',
  'facebook',
  'instagram',
] as const;
export type DestinationId = (typeof DESTINATION_IDS)[number];

/** Pages on her own site, by path. */
export const SITE_PATHS: Partial<Record<DestinationId, string>> = {
  home: '/',
  quote: '/request-a-quote',
  gallery: '/style-gallery',
  threads: '/thread-color-chart',
  clearance: '/clearance',
};

/** What the Studio knows about her outside pages. */
export interface OutsideLinks {
  googleReviewUrl?: string | null;
  socialLinks?: Array<{ platform?: string | null; url?: string | null } | null> | null;
}

/** The first social link for a platform ("Facebook", "Instagram"), if it is a real address. */
export function socialUrl(links: OutsideLinks, platform: string): string | null {
  for (const s of links.socialLinks ?? []) {
    if (s?.platform === platform && parseWebAddress(s.url))
      return parseWebAddress(s.url)!.toString();
  }
  return null;
}

/**
 * The full address for a destination, or null when it needs an address she
 * has not given yet (no Google review link, no Facebook page...).
 */
export function destinationUrl(id: DestinationId, links: OutsideLinks = {}): string | null {
  const path = SITE_PATHS[id];
  if (path) return sitePage(path);
  if (id === 'review') return parseWebAddress(links.googleReviewUrl)?.toString() ?? null;
  if (id === 'facebook') return socialUrl(links, 'Facebook');
  if (id === 'instagram') return socialUrl(links, 'Instagram');
  return null;
}
