// Safe to edit by hand
// =============================================================================
// order-rank.mjs: the pure half of scripts/backfill-order-rank.mjs (Phase D)
// =============================================================================
// Ranks are made with the SAME LexoRank package and the SAME steps that
// @sanity/orderable-document-list 2.0.9 uses itself ("Reset Order" starts at
// LexoRank.min() and takes genNext().genNext() per item; a new item takes
// genNext().genNext() after the last one). Stone Steps once seeded hand-written
// values like "a0", and the plugin warned it "could not parse any seeded sort
// value" and treated them all as the minimum: every drag then landed in the
// wrong place. A rank made here always parses, because the plugin's own parser
// made it.
//
// `lexorank` is the plugin's own dependency (hoisted to the root node_modules).
// =============================================================================
import { LexoRank } from 'lexorank';

/** `n` increasing ranks, starting after `after` (or from the start of the list). */
export function nextRanks(n, after = null) {
  let rank = after ? LexoRank.parse(after) : LexoRank.min();
  const out = [];
  for (let i = 0; i < n; i++) {
    rank = rank.genNext().genNext();
    out.push(rank.toString());
  }
  return out;
}

/** True when the plugin's parser accepts the value. */
export function isValidRank(value) {
  if (typeof value !== 'string') return false;
  try {
    LexoRank.parse(value);
    return true;
  } catch {
    return false;
  }
}

/** The order the live site uses today: displayOrder ascending, ties by _id (GROQ's own tie order). */
export function siteOrder(docs) {
  const num = (v) => (typeof v === 'number' ? v : Number.POSITIVE_INFINITY);
  return [...docs].sort(
    (a, b) =>
      num(a.displayOrder) - num(b.displayOrder) || (a._id < b._id ? -1 : a._id > b._id ? 1 : 0),
  );
}

/**
 * Plan the ranks for one type's PUBLISHED documents.
 *   - Documents that already have a valid rank keep it (setIfMissing, and
 *     never renumbering what she may have dragged).
 *   - The rest get ranks in site order, placed AFTER the highest existing rank,
 *     so they cannot collide with or jump ahead of a dragged item.
 * Returns [{ _id, orderRank }] for the documents that need one, in site order.
 */
export function planRanks(docs) {
  const ranked = docs.filter((d) => isValidRank(d.orderRank));
  const missing = siteOrder(docs.filter((d) => !isValidRank(d.orderRank)));
  if (!missing.length) return [];
  const max =
    ranked
      .map((d) => d.orderRank)
      .sort()
      .at(-1) ?? null;
  const ranks = nextRanks(missing.length, max);
  return missing.map((d, i) => ({ _id: d._id, orderRank: ranks[i] }));
}
