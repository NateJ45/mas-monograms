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

// ── Seasonal order deadlines (2026-10-19, studio-complete) ───────────────────
// Her busy seasons each have a last day to order (Christmas, Mother's Day,
// graduation, wedding season). "Order deadline" asks for the occasion and the
// last day, and writes the notice for her, so she never has to word it.

/** "December 1" from "2026-12-01", in her American date style. */
export function shortDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

/**
 * "Order deadline": "Order by December 1 for Christmas." until the end of the
 * last order day, as a highlight. Her own words win when she types some.
 */
export function buildDeadlineNotice(v: {
  occasion: string;
  lastOrderDay: string;
  message?: string;
}): NoticeDoc {
  const occasion = v.occasion.trim().replace(/[.!]+$/, '');
  const message =
    v.message?.trim() || `Order by ${shortDay(v.lastOrderDay)} to have it in time for ${occasion}.`;
  return buildNotice({ message, lastDay: v.lastOrderDay }, 'highlight');
}

// ── A new question and answer (2026-10-19, studio-complete) ──────────────────
// When a customer asks something twice, the answer belongs on the website.
// The answer is one or more plain paragraphs (a blank line starts a new one),
// turned into the rich text the faqItem `answer` holds.

export type QuestionDoc = {
  _type: 'faqItem';
  question: string;
  answer: {
    _type: 'block';
    _key: string;
    style: 'normal';
    markDefs: [];
    children: { _type: 'span'; _key: string; text: string; marks: [] }[];
  }[];
  showOnHowItWorks: boolean;
  showOnPricing: boolean;
  displayOrder: number;
  orderRank?: string;
};

/**
 * A drag-order rank just after `last` (the list's last LexoRank, such as
 * "0|i0000o:"), so a new question lands at the END of her list, as a question
 * added in the full editor does. LexoRank keeps a decimal part after the colon,
 * and a longer decimal sorts after its own prefix, so adding one character is a
 * valid rank that sorts after `last` and before anything after it. With no
 * list yet, the middle of the range.
 */
export function rankAfter(last: string | null | undefined): string {
  if (!last || !/^\d\|[0-9a-z]+:[0-9a-z]*$/.test(last)) return '0|hzzzzz:';
  return `${last}i`;
}

/** Paragraphs split at blank lines; single line breaks become spaces. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** "Add a question and answer": a whole faqItem for the How It Works page. */
export function buildQuestion(
  v: { question: string; answer: string },
  last?: string | null,
): QuestionDoc {
  const key = (i: number, part: string) => `qa${part}${i}`;
  return {
    _type: 'faqItem',
    question: v.question.trim(),
    answer: paragraphs(v.answer).map((text, i) => ({
      _type: 'block',
      _key: key(i, 'b'),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(i, 's'), text, marks: [] }],
    })),
    showOnHowItWorks: true,
    showOnPricing: false,
    displayOrder: 99,
    orderRank: rankAfter(last),
  };
}

// ── A photo of her work from the phone (2026-10-19, studio-complete) ─────────
// "Post a photo" (kit card 125) on Quick update makes a new galleryItem DRAFT
// from the photo she takes or picks; she presses Publish in the full editor,
// where she can also pick the item kind and the font. The kit's form asks for a
// "title", which a gallery photo does not have: it becomes the caption under
// the photo when someone opens it large, unless she typed a caption too.

export function buildWorkPhoto(input: {
  title: string;
  alt: string;
  caption: string;
  image: Record<string, unknown>;
}): { _type: 'galleryItem' } & Record<string, unknown> {
  const caption = input.caption.trim() || input.title.trim();
  const image: Record<string, unknown> = { ...input.image, alt: input.alt.trim() };
  if (caption) image.caption = caption;
  else delete image.caption;
  return { _type: 'galleryItem', image, featured: false, hoopFit: 'good', displayOrder: 99 };
}
