// Internal page links always end in a slash (astro.config `trailingSlash: 'always'`).
// The canonical tags and the sitemap use the slashed form, so a link without it costs
// a redirect hop (Cloudflare answers /about with a 307 to /about/) and makes Google
// report "Page with redirect". Run EVERY internal href that is built at render time
// (Sanity slugs, CMS strings, data files) through here.
//
// Left alone: external URLs, protocol links (mailto:, tel:), bare #anchors, relative
// paths, and files with an extension (.pdf, .xml, .txt, images). A ?query or #hash
// keeps its place, with the slash placed before it.

/** Add the trailing slash to an internal path; return anything else unchanged. */
export function internalHref(href: string): string;
export function internalHref(href: string | null | undefined): string | undefined;
export function internalHref(href: string | null | undefined): string | undefined {
  if (typeof href !== 'string') return undefined;
  // Only root-relative paths ("/x"); "//host" is protocol-relative, so external.
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? '' : href.slice(cut);
  if (path.endsWith('/')) return href;
  // A dot in the last segment means a file (.pdf, .xml, .png ...).
  if (/\.[A-Za-z0-9]+$/.test(path.slice(path.lastIndexOf('/') + 1))) return href;
  return `${path}/${tail}`;
}
