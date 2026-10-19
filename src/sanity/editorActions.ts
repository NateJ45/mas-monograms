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
//   - PUBLISH: the note after Publish ("Published. The website updates itself
//     in a few minutes.") is the shared Studio kit's since 2026-10-18
//     (src/sanity/kit/publishNote.tsx), with the countdown in the status line.
//   - UNDO and REDO ("Undo last change", "Redo") are added to every type she
//     edits (PORTS.md card 27, PORTABLE components/UndoRedo.tsx + undoRedo.ts).
//     They sit in the three-dots menu beside Publish; Ctrl+Z / Ctrl+Shift+Z do
//     the same outside a text box, through the undoRedoShortcuts plugin
//     registered in sanity.config.ts.
//   - TRASH (Phase D, 2026-10-05; the kit's since 2026-10-18): "Move to Trash"
//     on the everyday lists (kitConfig.trashTypes) and "Bring it back" in the
//     Trash come from src/sanity/kit/trash.tsx, which runs before this file.
//     In the staff view (Mary Ann) there is no Delete at all. Shop categories
//     and pages are not in the list.
//   - SHARE LINK (Phase D, PORTS card 19): "Copy a link so someone can see this
//     before it is on your website" (actions/shareLink.tsx), only where the
//     preview route can draw the page (Reid's shareWhenPreviewable rule).
// =============================================================================

import type { DocumentActionComponent } from 'sanity';
import { UndoAction, RedoAction } from './components/UndoRedo';
import { ShareLinkAction } from './actions/shareLink';
import { TRASH_TYPE } from '../lib/studio-trash';

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
  // The Trash's actions are the kit's ("Bring it back", and "Delete forever"
  // outside the staff view); nothing to add.
  if (schemaType === TRASH_TYPE) return actions;
  const base = SINGLETON_TYPES.has(schemaType)
    ? actions.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''))
    : actions;
  return NO_UNDO.has(schemaType) ? base : [...base, UndoAction, RedoAction, ShareLinkAction];
}
