// Safe to edit by hand
// =============================================================================
// studioTargets: where Mary Ann's Studio links go, as plain data (2026-10-05)
// =============================================================================
// The pure half of the Studio's deep links, kept free of React and Sanity
// imports so `npm run test:unit` (bare Node) can check it:
//
//   - DESK: every pane id the desk (structure.ts) defines and anything links
//     to. Home (kit.config.ts), the guides and the tests all read ids from here,
//     so a renamed pane cannot quietly turn a card into a dead link.
//   - studioTargetPath(): the Studio path for "this document", "this pane",
//     "a new one of these" or "that tool". studioLink.ts turns it into a click
//     that goes through the router (the embedded Studio is hash-routed).
//   (Since 2026-10-18 the Studio opens on the kit's Home tool, so the old
//   shouldOpenWelcome() rule is gone.)
//
// THE ID LESSON (Stone Steps, 2026-09-12): a desk item with no explicit
// `.id()` gets one derived from its TITLE, so "Race day (date, times, fees)"
// became `raceDayDateTimesFees` and every link to it opened the parent list
// instead. Every pane here has an explicit id, and a title can be reworded
// without breaking a single link.
// =============================================================================

/** Pane ids, exactly as structure.ts sets them with `.id()`. */
export const DESK = {
  /** Her notes and Nathan's ideas (was under Help until 2026-10-18). */
  notesAndIdeas: 'notes-and-ideas',
  /** Mary Ann's own notes (the studioNotes page), inside notesAndIdeas. */
  notes: 'studioNotes',
  business: 'siteSettings',
  pages: 'pages',
  legal: 'legal-pages',
  photos: 'photos',
  clearance: 'clearance-and-prices',
  clearanceItems: 'clearance-items',
  priceTags: 'price-tags',
  reference: 'fonts-threads-categories',
  fonts: 'fonts',
  threads: 'threads',
  categories: 'categories',
  questions: 'questions',
  /** Phase E: "Make a QR code", also a top-bar tool with the same name. */
  qrCodes: 'qr-codes',
  /** Phase D: "Trash (bring things back)", what "Move to Trash" keeps. */
  trash: 'trash',
  /** Phase F: "My brand kit", also a top-bar tool with the same name. */
  brandKit: 'brand-kit',
} as const;

/** Where a link in the Studio can go. */
export type StudioTarget =
  /**
   * A document's editor, by id. `type` defaults to the id (the singleton
   * convention: the Home page's id is `homePage`). `field` scrolls to and
   * focuses one box once the form opens, so "change my phone number" lands on
   * the phone number rather than on the top of a long form.
   */
  | { doc: string; type?: string; field?: string }
  /** A desk pane by its id path, ';'-separated for nesting (ids from DESK). */
  | { pane: string }
  /** A brand-new document of a type, optionally from a starting template. */
  | { create: string; template?: string }
  /** Another tool in the top bar, by its name (for example 'presentation'). */
  | { tool: string };

/**
 * The Studio path (without any hash) for a target, under `basePath` (the
 * workspace base path, "/studio" here). Sanity's intent URLs carry their
 * parameters as `key=value` pairs separated by semicolons.
 */
export function studioTargetPath(basePath: string, target: StudioTarget): string {
  const base = basePath.replace(/\/+$/, '');
  if ('doc' in target) {
    return (
      `${base}/intent/edit/id=${target.doc};type=${target.type ?? target.doc}` +
      (target.field ? `;path=${encodeURIComponent(target.field)}` : '')
    );
  }
  if ('create' in target) {
    return (
      `${base}/intent/create/type=${target.create}` +
      (target.template ? `;template=${target.template}` : '')
    );
  }
  if ('tool' in target) return `${base}/${target.tool}`;
  return `${base}/structure/${target.pane}`;
}
