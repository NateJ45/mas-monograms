// Safe to edit by hand
// =============================================================================
// studioTargets: where Mary Ann's Studio links go, as plain data (2026-10-05)
// =============================================================================
// The pure half of the Studio's deep links, kept free of React and Sanity
// imports so `npm run test:unit` (bare Node) can check it:
//
//   - DESK: every pane id the desk (structure.ts) defines and anything links
//     to. The Welcome cards, the help pane and the tests all read ids from here,
//     so a renamed pane cannot quietly turn a card into a dead link.
//   - studioTargetPath(): the Studio path for "this document", "this pane",
//     "a new one of these" or "that tool". studioLink.ts turns it into a click
//     that goes through the router (the embedded Studio is hash-routed).
//   - shouldOpenWelcome(): whether the desk is empty and should open Welcome.
//
// THE ID LESSON (Stone Steps, 2026-09-12): a desk item with no explicit
// `.id()` gets one derived from its TITLE, so "Race day (date, times, fees)"
// became `raceDayDateTimesFees` and every link to it opened the parent list
// instead. Every pane here has an explicit id, and a title can be reworded
// without breaking a single link.
// =============================================================================

/** Pane ids, exactly as structure.ts sets them with `.id()`. */
export const DESK = {
  welcome: 'welcome',
  help: 'help',
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

/**
 * Should the Studio open the Welcome pane? True when the desk tool is showing
 * nothing but its menu: no pane open, no edit link being resolved.
 *
 * Sanity 6.9 scopes each tool's router state under the tool's name
 * (WorkspaceLoader: `route.scope(tool.name, "/", tool.router)`), and the desk
 * keeps its open panes in `panes` (structureTool: `route.create("/:panes")`).
 * An intent link (`/intent/edit/...`) arrives with `intent` set instead, and
 * must be left alone so the link can open its document.
 */
export function shouldOpenWelcome(state: unknown, toolName = 'structure'): boolean {
  const s = (state ?? {}) as Record<string, unknown>;
  if (s.tool !== toolName) return false;
  if (s.intent) return false;
  const scoped = (s[toolName] ?? {}) as Record<string, unknown>;
  if (scoped.intent || scoped.editDocumentId || scoped.legacyEditDocumentId) return false;
  const panes = scoped.panes;
  return !Array.isArray(panes) || panes.length === 0;
}
