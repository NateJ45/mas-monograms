// Safe to edit by hand
// =============================================================================
// QR codes: the link inside the code (Phase E of the Studio upgrade, 2026-10-05)
// =============================================================================
// Pure functions, no browser APIs beyond the standard URL class, so the unit
// tests (src/lib/qr/qr.test.ts) run them in bare Node.
//
// THE ORIGIN IS FIXED. A printed QR code lives for years, so it must point at
// the permanent address (https://mas-monograms.com), never at wherever the
// Studio happens to be open (localhost, the workers.dev host).
//
// THE TAG. Links to her own site get
//   ?utm_source=qr&utm_medium=<placement>&utm_campaign=<name or YYYY-MM>
// so the site's analytics can show which placement brought people in. Links to
// other sites (her Google review link, Facebook, Instagram) are NOT tagged:
// their analytics are not hers to read, and a shorter link makes a less dense
// code that scans more easily at hang-tag size.
// =============================================================================

/** The site's permanent address. Matches `site` in astro.config.mjs. */
export const SITE_ORIGIN = 'https://mas-monograms.com';

/** A web address she pasted, if it is a real http(s) address; otherwise null. */
export function parseWebAddress(raw: string | null | undefined): URL | null {
  const text = (raw ?? '').trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // "https://localhost" or "https://foo" is not something a customer can open.
  if (!url.hostname.includes('.')) return null;
  return url;
}

/** True when the address is on her own website. */
export function isOwnSite(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, '');
  return host === new URL(SITE_ORIGIN).hostname;
}

/** "2026-10" for October 2026: the default batch name. */
export function monthTag(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * The batch name as it goes into the link: lower case, letters, numbers and
 * single hyphens only, at most 30 characters. Empty means "this month".
 */
export function campaignTag(name: string | null | undefined, now: Date = new Date()): string {
  const slug = (name ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/, '');
  return slug || monthTag(now);
}

export interface TagOptions {
  /** The placement's short tag, for example "card" (utm_medium). */
  medium: string;
  /** Her batch name, or empty for this month (utm_campaign). */
  campaign?: string;
  now?: Date;
}

/**
 * The link that goes into the QR code. Own-site links get the qr tag; any
 * existing query string and #fragment are kept, and an older utm_ value is
 * replaced rather than repeated. Throws on an address that is not http(s),
 * because a QR code that opens nothing is worse than no QR code.
 */
export function qrLink(destination: string, opts: TagOptions): string {
  const url = parseWebAddress(destination);
  if (!url) throw new Error(`Not a web address: "${destination}"`);
  if (isOwnSite(url)) {
    url.searchParams.set('utm_source', 'qr');
    url.searchParams.set('utm_medium', opts.medium);
    url.searchParams.set('utm_campaign', campaignTag(opts.campaign, opts.now));
  }
  const out = url.toString();
  // URL.toString() percent-encodes anything outside ASCII, which is what the
  // byte-mode encoder needs. Guard it anyway.
  if (!/^[\x21-\x7e]+$/.test(out)) throw new Error(`Link is not plain ASCII: "${out}"`);
  return out;
}

/** A page on her own site, as a full address. */
export function sitePage(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
