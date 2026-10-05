// Foundation, edit with care
// =============================================================================
// editorActions: Mary Ann's document actions, in one place (2026-10-05)
// =============================================================================
// Pattern from ReidDesignAstro/reid-design-site src/sanity/editorActions.ts:
// the resolver in sanity.config.ts stays about the singleton rules, and the
// editor helpers are added here.
//
// What this does, per document:
//   - SINGLETONS (one page, one settings document): no Unpublish, Delete or
//     Duplicate. There is exactly one Home page and it must stay that way.
//   - PUBLISH gets a friendly toast once it has landed: "Published. Your change
//     will be on your website in about 2 to 3 minutes." (components/publishNote.tsx).
//     Nothing else about Publish changes.
//   - UNDO and REDO ("Undo last change", "Redo") are added to every type she
//     edits (PORTS.md card 27, PORTABLE components/UndoRedo.tsx + undoRedo.ts).
//     They sit in the three-dots menu beside Publish; Ctrl+Z / Ctrl+Shift+Z do
//     the same outside a text box, through the undoRedoShortcuts plugin
//     registered in sanity.config.ts.
//   - TRASH (Phase D, 2026-10-05): on the everyday lists (ARCHIVABLE_TYPES in
//     lib/trash.ts) the stock Delete is replaced by "Move to Trash"
//     (actions/trash.tsx); a trashedItem gets only "Bring it back" and
//     "Delete forever". Shop categories and pages are not in the list.
//   - SHARE LINK (Phase D, PORTS card 19): "Copy a link so someone can see this
//     before it is on your website" (actions/shareLink.tsx), only where the
//     preview route can draw the page (Reid's shareWhenPreviewable rule).
// =============================================================================

import type { DocumentActionComponent } from 'sanity';
import { UndoAction, RedoAction } from './components/UndoRedo';
import { withPublishNote } from './components/publishNote';
import { DeleteForeverAction, MoveToTrashAction, RestoreAction } from './actions/trash';
import { ShareLinkAction } from './actions/shareLink';
import { ARCHIVABLE_TYPES, TRASH_TYPE } from './lib/trash';

/** One document each, opened from the desk by its fixed id. */
export const SINGLETON_TYPES = new Set<string>([
  'siteSettings',
  'homePage',
  'howItWorksPage',
  'pricingPage',
  'aboutPage',
  'requestAQuotePage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
  'thankYouPage',
  'notFoundPage',
  'atelierSettings',
  'studioGuide',
  'studioNotes',
  'studioPlaybook',
]);

/**
 * The Studio's own help documents (the older Start Here guides). Undo is not
 * offered there: they are reference pages Nathan maintains, not website words.
 */
const NO_UNDO = new Set<string>(['studioGuide', 'studioNotes', 'studioPlaybook']);

export function withEditorActions(
  schemaType: string,
  actions: DocumentActionComponent[],
): DocumentActionComponent[] {
  // Phase D: something in the Trash can only come back or go for good.
  if (schemaType === TRASH_TYPE) return [RestoreAction, DeleteForeverAction];
  const base = SINGLETON_TYPES.has(schemaType)
    ? actions.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''))
    : ARCHIVABLE_TYPES.has(schemaType)
      ? // Phase D: Delete becomes "Move to Trash" (actions/trash.tsx).
        [...actions.filter(({ action }) => action !== 'delete'), MoveToTrashAction]
      : actions;
  const withNote = base.map((a) => (a.action === 'publish' ? withPublishNote(a) : a));
  // Phase D: "Copy a link so someone can see this..." on anything with a page
  // the preview can draw (actions/shareLink.tsx returns null everywhere else).
  return NO_UNDO.has(schemaType)
    ? withNote
    : [...withNote, UndoAction, RedoAction, ShareLinkAction];
}
