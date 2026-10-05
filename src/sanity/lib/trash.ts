// Foundation, edit with care
// =============================================================================
// trash: the pure half of "Move to Trash" (2026-10-05, Phase D)
// =============================================================================
// Ported from ReidDesignAstro/reid-design-site src/sanity/lib/trash.ts, adapted
// for Mary Ann's Studio. Kept free of React and the Sanity client so bare-Node
// tests (src/lib/studio-trash.test.ts) can check every rule here.
//
// THE MODEL IS SNAPSHOT-TO-TRASH, NOT AN `archived: true` FLAG (Reid's choice,
// kept on purpose). Moving something to Trash writes a `trashedItem` holding a
// copy of it and DELETES the original, in one transaction. So:
//   - No site query has to remember to filter anything out. The original is
//     genuinely gone, so a trashed photo cannot show on the website whatever a
//     query says, and the next build (the delete fires the "Rebuild live site"
//     webhook) takes it off. A flag would put that promise in the hands of
//     every GROQ query, and the one that forgets publishes deleted work.
//   - The checkup and the guide counts need no change either: they count real
//     documents, and a trashed one is not one any more.
//   - Restore writes the copy back under the SAME id, so its place in a drag
//     list (orderRank) and anything that pointed at it come back with it.
//
// MAS CHANGE FROM REID: the published copy and the unpublished changes are kept
// SEPARATELY. Reid kept `draft || published` and restored it as published,
// which quietly publishes changes she never pressed Publish for (and publishes
// a brand-new item she never finished). Here each copy goes back to where it
// was: the published one to the website id, the unpublished one to its draft.
// =============================================================================

/** The everyday lists whose Delete becomes "Move to Trash". */
export const ARCHIVABLE_TYPES = new Set<string>([
  'galleryItem',
  'clearanceItem',
  'faqItem',
  'pricingTier',
  'threadColor',
  'font',
]);
// NOT here, on purpose: itemCategory (a category IS a page on the website, and
// adding or removing one is a job for Nathan), legalPage (pages), the page
// singletons (they cannot be deleted at all), and trashedItem itself.

/** The document type that holds a trashed copy. The site never reads it. */
export const TRASH_TYPE = 'trashedItem';

/** What she calls each kind of thing, for the Trash list. */
export const TRASH_KIND: Record<string, string> = {
  galleryItem: 'Photo of my work',
  clearanceItem: 'Clearance item',
  faqItem: 'Question and answer',
  pricingTier: 'Price tag',
  threadColor: 'Thread color',
  font: 'Embroidery font',
};

/** Fields looked at, in order, to give a trashed item a readable name. */
const TITLE_CANDIDATES = ['name', 'label', 'question', 'title'] as const;

type Doc = Record<string, any>;

/** The system fields Sanity recomputes on write (_rev would conflict on restore). */
const SYSTEM_FIELDS = ['_rev', '_createdAt', '_updatedAt', '_system', '_originalId'];

/** Strip the `drafts.` prefix so ids always name the published document. */
export function publishedId(id: string): string {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id;
}

/**
 * A readable name for the Trash row. A photo is named by its words; anything
 * else by its name, label or question. Never blank.
 */
export function trashTitle(doc: Doc | null | undefined): string {
  if (!doc) return 'Something with no name';
  const alt = doc.image?.alt;
  if (typeof alt === 'string' && alt.trim()) return alt.trim();
  for (const field of TITLE_CANDIDATES) {
    const value = doc[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  const kind = TRASH_KIND[doc._type as string];
  return kind ? `${kind} with no name` : 'Something with no name';
}

/** A copy of a document with the system fields removed and its id pinned. */
export function snapshot(doc: Doc, id: string): Doc {
  const out: Doc = {};
  for (const [k, v] of Object.entries(doc)) {
    if (!SYSTEM_FIELDS.includes(k)) out[k] = v;
  }
  out._id = id;
  out._type = doc._type;
  return out;
}

/** What a trashedItem stores in its `payload` box (as text). */
export interface TrashPayload {
  /** The copy that was on the website, if it had been published. */
  published: Doc | null;
  /** Changes that had not been published yet, if there were any. */
  draft: Doc | null;
}

/**
 * The trashedItem to write for a document, from its published copy and its
 * unpublished changes (either may be missing, not both). `now` is an ISO time.
 */
export function buildTrashRecord(
  type: string,
  id: string,
  published: Doc | null | undefined,
  draft: Doc | null | undefined,
  now: string,
): Doc {
  if (!published && !draft) throw new Error('There is nothing to move to the Trash.');
  const pub = publishedId(id);
  const payload: TrashPayload = {
    published: published ? snapshot(published, pub) : null,
    draft: draft ? snapshot(draft, `drafts.${pub}`) : null,
  };
  return {
    _type: TRASH_TYPE,
    title: trashTitle(draft ?? published),
    kind: TRASH_KIND[type] ?? type,
    originalType: type,
    originalId: pub,
    deletedAt: now,
    wasPublished: Boolean(published),
    payload: JSON.stringify(payload),
  };
}

/**
 * Read a trashedItem's payload back. Defensive: system fields are stripped
 * again and the ids are re-pinned from `originalId`, never trusted from the
 * text. Also reads Reid's older single-copy shape (a plain document), which it
 * treats as the published copy.
 */
export function parseTrashPayload(payload: string, originalId: string): TrashPayload {
  const raw = JSON.parse(payload) as Doc;
  const pub = publishedId(originalId);
  const isSplit = raw && typeof raw === 'object' && ('published' in raw || 'draft' in raw);
  const published = isSplit ? raw.published : raw;
  const draft = isSplit ? raw.draft : null;
  return {
    published: published && typeof published === 'object' ? snapshot(published, pub) : null,
    draft: draft && typeof draft === 'object' ? snapshot(draft, `drafts.${pub}`) : null,
  };
}

/** The documents Restore writes back, published first. */
export function restoreDocs(payload: TrashPayload): Doc[] {
  return [payload.published, payload.draft].filter((d): d is Doc => Boolean(d));
}

/** The references query: who still points at this document (not itself, not the Trash). */
export const REFERRERS_QUERY = `*[references($id) && !(_id in [$id, $draftId]) && _type != "${TRASH_TYPE}"]{ _id, _type, "name": coalesce(name, label, question, title, image.alt) }`;

/** Her words for "these still use it", or null when nothing does. */
export function referrersMessage(
  rows: Array<{ _id: string; _type: string; name?: string | null }>,
): string | null {
  if (!rows.length) return null;
  const names = [
    ...new Set(rows.map((r) => r.name?.trim() || TRASH_KIND[r._type] || 'one other item')),
  ];
  const shown =
    names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : '');
  const what =
    rows.length === 1 ? 'Another item uses this one' : `${rows.length} other items use this one`;
  return `${what}: ${shown}. Change ${rows.length === 1 ? 'it' : 'them'} first, so nothing on your website is left with a gap, then try again.`;
}
