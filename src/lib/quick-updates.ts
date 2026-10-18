// Safe to edit by hand
// =============================================================================
// Quick update: the notices Mary Ann puts up from her phone (2026-10-18)
// =============================================================================
// The kit's Quick update tool (src/sanity/kit/QuickUpdateTool.tsx, starter
// card 111) opens one short form at a time and PUBLISHES what `build` returns
// straight away, skipping the Studio's own checks, so every builder here must
// return a whole, valid `announcement` (schemaTypes/announcement.ts). Pure, so
// src/lib/quick-updates.test.ts checks them in bare Node.
// =============================================================================

export type NoticeDoc = {
  _type: 'announcement';
  internalTitle: string;
  message: string;
  style: 'info' | 'highlight' | 'urgent';
  enabled: true;
  startDate?: string;
  endDate: string;
  link?: { label: string; url: string };
};

/** The end of a local day ("2026-12-01" -> 23:59 that evening, as ISO). */
export function endOfDay(date: string): string {
  return new Date(`${date}T23:59:00`).toISOString();
}

/** The start of a local day ("2026-12-20" -> 00:00 that morning, as ISO). */
export function startOfDay(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

/** The name she sees in the list of notices: its first words and its last day. */
export function noticeName(message: string, lastDay: string): string {
  const words = message.trim().replace(/\s+/g, ' ');
  const short = words.length > 40 ? `${words.slice(0, 40).trimEnd()}...` : words;
  return `${short} (until ${lastDay})`;
}

/** "Put up a notice": shows from now until the end of `lastDay`. */
export function buildNotice(
  v: { message: string; lastDay: string; link?: string },
  style: NoticeDoc['style'] = 'highlight',
): NoticeDoc {
  const doc: NoticeDoc = {
    _type: 'announcement',
    internalTitle: noticeName(v.message, v.lastDay),
    message: v.message.trim(),
    style,
    enabled: true,
    endDate: endOfDay(v.lastDay),
  };
  if (v.link) doc.link = { label: 'Find out more', url: v.link };
  return doc;
}

/** "I am away": shows from the first day (or now) until the end of the last day. */
export function buildAwayNotice(v: {
  firstDay?: string;
  lastDay: string;
  message?: string;
}): NoticeDoc {
  const message =
    v.message?.trim() ||
    `I am away until ${new Date(`${v.lastDay}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Quote requests will be answered when I am back.`;
  const doc: NoticeDoc = {
    _type: 'announcement',
    internalTitle: noticeName(message, v.lastDay),
    message,
    style: 'urgent',
    enabled: true,
    endDate: endOfDay(v.lastDay),
  };
  if (v.firstDay) doc.startDate = startOfDay(v.firstDay);
  return doc;
}
