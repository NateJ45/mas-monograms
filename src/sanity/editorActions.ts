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
// =============================================================================

import type { DocumentActionComponent } from 'sanity';
import { UndoAction, RedoAction } from './components/UndoRedo';
import { withPublishNote } from './components/publishNote';

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
  const base = SINGLETON_TYPES.has(schemaType)
    ? actions.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''))
    : actions;
  const withNote = base.map((a) => (a.action === 'publish' ? withPublishNote(a) : a));
  return NO_UNDO.has(schemaType) ? withNote : [...withNote, UndoAction, RedoAction];
}
