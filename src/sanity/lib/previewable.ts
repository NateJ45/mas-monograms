// Safe to edit by hand
// =============================================================================
// previewable: which preview paths /preview/[...slug] can actually draw
// =============================================================================
// Pure (no React, no Sanity) so bare-Node tests can check it. The share-link
// action (../actions/shareLink.tsx) only appears when its link would open a
// real page, the rule Reid Design learned on 2026-09-29 (`shareWhenPreviewable`):
// a link to a page the preview route cannot draw opens an error.
//
// What the route draws (src/pages/preview/[...slug].astro): every fixed page in
// SINGLETON_PREVIEW_PATHS (src/sanity/resolve.ts, the same map as the route's
// PREVIEW_PAGES), plus one segment that is a shop category's web address.
// Legal pages (/preview/legal/...) are NOT drawn, so they get no share link.
// =============================================================================

/** The fixed preview paths. Mirror of SINGLETON_PREVIEW_PATHS in ../resolve.ts. */
export const FIXED_PREVIEW_PATHS = new Set<string>([
  '/preview',
  '/preview/how-it-works',
  '/preview/pricing',
  '/preview/about',
  '/preview/request-a-quote',
  '/preview/shop-by-item',
  '/preview/style-gallery',
  '/preview/font-lettering-guide',
  '/preview/thread-color-chart',
  '/preview/clearance',
  '/preview/thank-you',
  '/preview/404',
]);

/** One lower-case segment, the shape a category's web address takes. */
const CATEGORY_PATH = /^\/preview\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function canPreviewPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return FIXED_PREVIEW_PATHS.has(pathname) || CATEGORY_PATH.test(pathname);
}

/** Share links only work over https (the preview cookie is `secure`). */
export function shareLinksWorkHere(protocol: string): boolean {
  return protocol === 'https:';
}

export const SHARE_LABEL = 'Copy a link so someone can see this before it is on your website';
export const SHARE_COPIED_TITLE = 'Link copied';
export const SHARE_COPIED =
  'Paste it into an email or a text message. The person sees your changes before they are on your website, without signing in. The link stops working after about an hour; press the button again for a new one.';
export const SHARE_LOCAL_ONLY =
  'Links like this only work from your Studio on your real website address, not from a test copy on this computer.';
