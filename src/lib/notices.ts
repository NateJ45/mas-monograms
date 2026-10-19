// Safe to edit by hand
// =============================================================================
// Notices across the top: which one shows, and when (2026-10-18)
// =============================================================================
// Pure, so src/lib/notices.test.ts can check it in bare Node. The query is
// getActiveNotices() in src/lib/queries.ts; BaseLayout draws the result.
//
// The site is built ahead of time, so a notice's dates are honoured twice:
//   1. At BUILD time: every switched-on notice that has not ended yet is
//      drawn, most important first (urgent, then good news, then calm), and
//      only the first one inside its dates is visible; the rest carry
//      `hidden`. With JavaScript off this is what visitors see.
//   2. In the BROWSER: a few lines in BaseLayout (NOTICE_SCRIPT below) show
//      the first notice inside its dates by the visitor's clock and hide the
//      rest, so a notice appears on its first day and comes down after its
//      last without waiting for a rebuild.
// =============================================================================

export type NoticeStyle = 'info' | 'highlight' | 'urgent';

export interface Notice {
  message?: string | null;
  style?: NoticeStyle | null;
  link?: { url?: string | null; label?: string | null } | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PlacedNotice extends Notice {
  /** Inside its dates at build time; the first such notice is the one shown. */
  visible: boolean;
}

/** Most important first. */
export const NOTICE_RANK: Record<NoticeStyle, number> = { urgent: 0, highlight: 1, info: 2 };

/** At most this many notices go into the page (one shows at a time). */
export const MAX_NOTICES = 3;

const time = (v?: string | null) => (v ? Date.parse(v) : NaN);

/** Is the notice inside its dates at `now`? A missing start or end is open. */
export function inWindow(n: Notice, now: number): boolean {
  const start = time(n.startDate);
  const end = time(n.endDate);
  if (!Number.isNaN(start) && start > now) return false;
  if (!Number.isNaN(end) && end <= now) return false;
  return true;
}

/**
 * The notices to draw, in order, with only the first one inside its dates
 * marked visible. Notices with no words, or already ended, are dropped.
 */
export function placeNotices(list: Notice[] | null | undefined, now: number): PlacedNotice[] {
  const live = (list ?? [])
    .filter((n) => typeof n?.message === 'string' && n.message.trim() !== '')
    .filter((n) => {
      const end = time(n.endDate);
      return Number.isNaN(end) || end > now;
    })
    .sort((a, b) => {
      const r = NOTICE_RANK[a.style ?? 'info'] - NOTICE_RANK[b.style ?? 'info'];
      if (r) return r;
      const sa = time(a.startDate);
      const sb = time(b.startDate);
      return (Number.isNaN(sa) ? 0 : sa) - (Number.isNaN(sb) ? 0 : sb);
    })
    .slice(0, MAX_NOTICES);
  let shown = false;
  return live.map((n) => {
    const visible = !shown && inWindow(n, now);
    if (visible) shown = true;
    return { ...n, visible };
  });
}

/**
 * The browser half, inlined by BaseLayout after the notices. Each notice is a
 * `[data-notice]` element with optional `data-from` / `data-until` (ISO). The
 * first one inside its dates is shown, every other one hidden.
 */
export const NOTICE_SCRIPT = `(function(){var now=Date.now(),shown=false;document.querySelectorAll('[data-notice]').forEach(function(el){var f=Date.parse(el.getAttribute('data-from')||''),u=Date.parse(el.getAttribute('data-until')||'');var ok=!(f>now)&&!(u<=now);if(ok&&!shown){el.hidden=false;shown=true;}else{el.hidden=true;}});})();`;
