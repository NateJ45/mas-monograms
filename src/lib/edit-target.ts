// =============================================================================
// edit-target - click targets the shared page bodies put on photos and lists
// (2026-10-05, Phase C: "Edit on the page shows the REAL pages")
// =============================================================================
// Stega makes every WORD in the preview clickable. A photo, a card or a list
// item has no words of its own to click, so the bodies mark them with an
// explicit `data-sanity` attribute (src/lib/preview-edit-attr.ts) that opens the
// right field, or gives the in-canvas list controls (add, duplicate, remove,
// drag) on an item.
//
// The bodies are rendered by the LIVE pages too, and the live site must never
// carry these attributes. So every helper here takes the page's `edit` target
// and returns `undefined` when it is unset. Astro leaves an attribute whose
// value is undefined out of the markup entirely, so the static HTML is byte for
// byte what it was before the bodies were shared (`npm run parity compare`).
//
// The live pages never pass `edit`; only src/pages/preview/[...slug].astro
// does.
// =============================================================================
import {
  arrayItemEditAttr,
  docEditAttr,
  fieldEditAttr,
  type EditDoc,
  type EditableArrayField,
} from './preview-edit-attr.ts';

/** The page document the preview is editing, or nothing on the live site. */
export type Edit = EditDoc | null | undefined;

/** A whole field on the page document (a photo, a block of words). */
export function editField(edit: Edit, path: string): string | undefined {
  return edit ? fieldEditAttr(edit, path) : undefined;
}

/**
 * One item of a list on the page document. Uses the item's `_key` when it has
 * one (it survives reordering) and its position otherwise (a list of plain
 * words, like the trust bar, has no keys).
 */
export function editItem(
  edit: Edit,
  field: EditableArrayField,
  item: unknown,
  index: number,
): string | undefined {
  if (!edit) return undefined;
  const key = (item as { _key?: unknown } | null)?._key;
  return arrayItemEditAttr(edit, field, typeof key === 'string' && key ? key : index);
}

/**
 * A field on ANOTHER document shown on this page (a gallery photo, a category
 * card, a price tier). Needs the page's `edit` only as the on switch.
 */
export function editOther(edit: Edit, id: unknown, type: string, path: string): string | undefined {
  if (!edit || typeof id !== 'string' || !id) return undefined;
  return docEditAttr(id, type, path);
}

/**
 * PREVIEW ONLY: keep a client-driven widget as it is across a soft refresh
 * (src/lib/preview-morph.ts honours `data-morph-keep`). For the live stitching
 * stages, whose drawing the server's HTML does not contain.
 */
export function morphKeep(edit: Edit): '' | undefined {
  return edit ? '' : undefined;
}
