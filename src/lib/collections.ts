// Safe to edit by hand
// =============================================================================
// Gift guides and season pages: which photos show (2026-10-18)
// =============================================================================
// Pure, so src/lib/collections.test.ts can check it in bare Node. Derived at
// build time from the photos of her work, never retyped: the photos she picked
// by hand first (in her order), then every other photo carrying one of the
// page's tags, in the Style Gallery's own order. Tags compare without case or
// extra spaces ("Christmas " finds "christmas").
// =============================================================================

export interface GalleryLike {
  _id: string;
  image?: { asset?: unknown } | null;
  tags?: string[] | null;
}

export interface CollectionLike {
  photoTags?: string[] | null;
  pickedIds?: (string | null)[] | null;
  categories?: { slug?: { current?: string } | null }[] | null;
}

/** At most this many photos on one page (two to four rows of swatches). */
export const MAX_COLLECTION_PHOTOS = 16;

const norm = (t: string) => t.trim().toLowerCase();

export function collectionPhotos<T extends GalleryLike>(
  collection: CollectionLike | null | undefined,
  allGallery: T[] | null | undefined,
  max = MAX_COLLECTION_PHOTOS,
): T[] {
  const gallery = (allGallery ?? []).filter((g) => g?.image?.asset);
  const byId = new Map(gallery.map((g) => [g._id, g]));
  const out: T[] = [];
  const seen = new Set<string>();
  const add = (g: T | undefined) => {
    if (!g || seen.has(g._id) || out.length >= max) return;
    seen.add(g._id);
    out.push(g);
  };
  for (const id of collection?.pickedIds ?? [])
    if (id) add(byId.get(id.replace(/^drafts\./, '')) ?? byId.get(id));
  const tags = new Set((collection?.photoTags ?? []).filter(Boolean).map(norm));
  if (tags.size) {
    for (const g of gallery) if ((g.tags ?? []).some((t) => tags.has(norm(t)))) add(g);
  }
  return out;
}

/**
 * Where the quote button goes: the form, started on the one item when the
 * page names exactly one shop category (the ?item= contract in
 * .claude/rules/site-routes.md).
 */
export function collectionQuoteHref(collection: CollectionLike | null | undefined): string {
  const cats = (collection?.categories ?? []).filter((c) => c?.slug?.current);
  return cats.length === 1
    ? `/request-a-quote/?item=${encodeURIComponent(cats[0].slug!.current!)}`
    : '/request-a-quote/';
}
