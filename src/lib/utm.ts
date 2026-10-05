// =============================================================================
// utm - where a visitor came from, carried into the quote form (2026-10-05)
// =============================================================================
// The Studio's "Make a QR code" tool (src/lib/qr/url.ts) tags every link to the
// site with ?utm_source=qr&utm_medium=<placement>&utm_campaign=<batch>. GA4 reads
// those on the landing page by itself. This module makes the same tags reach
// Mary Ann's quote email, so a QR scan that turns into a quote is visible.
//
// THE CONTRACT (also in .claude/rules/site-routes.md):
//   - Keys: utm_source, utm_medium, utm_campaign. Nothing else is read.
//   - A value is kept only if it is 1 to 40 letters, digits, hyphens or
//     underscores. Anything else is dropped, never repaired, so no HTML or
//     script can ride through.
//   - First touch wins for the browser session: the first landing URL that
//     carries at least one valid tag is stored in sessionStorage
//     (UTM_STORAGE_KEY) and later landings do not replace it. It ends when the
//     tab closes. Storage failures (private mode, blocked) are ignored.
//   - /request-a-quote copies the stored tags into three hidden inputs with the
//     same names; src/pages/api/quote.ts validates them again with pickUtm and
//     ignores anything else.
//
// Pure functions first (unit-tested in utm.test.ts, bare Node); the two browser
// helpers at the bottom touch window only when called.
// =============================================================================

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmTags = Partial<Record<UtmKey, string>>;

/** sessionStorage key for the first-touch tags. */
export const UTM_STORAGE_KEY = 'mas-utm-v1';

const VALID = /^[A-Za-z0-9_-]{1,40}$/;

/** The value if it passes the whitelist, else null. Surrounding spaces are trimmed. */
export function cleanUtmValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return VALID.test(v) ? v : null;
}

/** Anything with a get(key) method: URLSearchParams, FormData. */
interface Getter {
  get(key: string): unknown;
}

/** The valid tags from a query string, a form or a plain object. Junk is dropped. */
export function pickUtm(source: Getter | Record<string, unknown> | null | undefined): UtmTags {
  const out: UtmTags = {};
  if (!source) return out;
  const read =
    typeof (source as Getter).get === 'function'
      ? (k: string) => (source as Getter).get(k)
      : (k: string) => (source as Record<string, unknown>)[k];
  for (const key of UTM_KEYS) {
    const v = cleanUtmValue(read(key));
    if (v) out[key] = v;
  }
  return out;
}

export const hasUtm = (tags: UtmTags | null | undefined): tags is UtmTags =>
  !!tags && UTM_KEYS.some((k) => !!tags[k]);

/** Where a QR code was printed (utm_medium from src/lib/qr/placements.ts). */
const QR_PLACES: Record<string, string> = {
  tag: 'a hang tag or label',
  card: 'a business card',
  flyer: 'a flyer or poster',
  insert: 'a package insert or thank-you card',
  sign: 'a table sign',
  box: 'a shipping box sticker',
};

/** A few sources Mary Ann might tag links with herself. */
const SOURCES: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  pinterest: 'Pinterest',
  nextdoor: 'Nextdoor',
  google: 'Google',
  bing: 'Bing',
  email: 'An email',
};

/**
 * The plain-words line for the owner email, for example
 * "QR code on a hang tag or label (campaign fall-fair)". Null when there are no
 * valid tags. The result is PLAIN TEXT: escape it before it goes into HTML.
 */
export function describeUtm(raw: UtmTags | null | undefined): string | null {
  const tags = pickUtm(raw as Record<string, unknown>);
  if (!hasUtm(tags)) return null;
  const source = tags.utm_source;
  const medium = tags.utm_medium;
  let where: string;
  if (source?.toLowerCase() === 'qr') {
    const place = medium ? QR_PLACES[medium.toLowerCase()] : undefined;
    where = place ? `QR code on ${place}` : medium ? `QR code (Other: ${medium})` : 'QR code';
  } else if (source) {
    where = SOURCES[source.toLowerCase()] ?? `Other: ${source}`;
    if (medium) where += ` (${medium})`;
  } else {
    where = medium ? `Other: ${medium}` : 'Not known';
  }
  return tags.utm_campaign ? `${where} (campaign ${tags.utm_campaign})` : where;
}

// ── Browser helpers ───────────────────────────────────────────────────────────

function readStored(): UtmTags {
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? pickUtm(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

/**
 * Store the current URL's tags if this is the first tagged landing of the
 * session, and return the session's tags (stored first touch, else the current
 * URL's). Safe to call on every page load.
 */
export function rememberUtm(): UtmTags {
  let current: UtmTags = {};
  try {
    current = pickUtm(new URLSearchParams(window.location.search));
  } catch {
    current = {};
  }
  const stored = readStored();
  if (hasUtm(stored)) return stored;
  if (hasUtm(current)) {
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // storage blocked: the tags still reach the form on this page
    }
  }
  return current;
}

/** Copy the session's tags into the form's hidden inputs (name = utm key). */
export function fillUtmFields(form: HTMLFormElement | null): UtmTags {
  const tags = rememberUtm();
  if (!form) return tags;
  for (const key of UTM_KEYS) {
    const input = form.querySelector<HTMLInputElement>(`input[type="hidden"][name="${key}"]`);
    if (input) input.value = tags[key] ?? '';
  }
  return tags;
}
