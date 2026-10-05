// =============================================================================
// review-link - the "Leave a review" link the site draws (2026-10-05, Get found)
// =============================================================================
// Footer.astro (contact cluster) and /thank-you draw a link to Mary Ann's Google
// review page, ONLY when siteSettings.googleReviewUrl holds a real https
// address. With the field empty (the live state on 2026-10-05) nothing at all
// is drawn, so the page HTML is unchanged (proved by `npm run parity compare`).
// The words come from siteSettings.reviewLinkLabel; the short neutral fallback
// below is used only when she leaves that box empty.
// =============================================================================

export const REVIEW_LABEL_FALLBACK = 'Leave a review';

export interface ReviewLink {
  href: string;
  label: string;
}

/** The link to draw, or null when there is no valid https review address. */
export function reviewLink(
  settings: { googleReviewUrl?: string | null; reviewLinkLabel?: string | null } | null | undefined,
): ReviewLink | null {
  const raw = settings?.googleReviewUrl;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !url.hostname.includes('.')) return null;
  const label = settings?.reviewLinkLabel?.trim() || REVIEW_LABEL_FALLBACK;
  return { href: url.toString(), label };
}
