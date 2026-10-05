// Picking photos for the round hoops (HoopFrame), 2026-10-04.
//
// Some gallery photos cannot make a good circular crop (two items side by
// side, a small design in a tall photo, a close-up that fills the circle).
// Mary Ann marks those with galleryItem.hoopFit = "poor" in the Studio. The
// IMG_HOOP projection in src/lib/queries.ts copies that flag onto every
// category photo that reuses the same picture, so these helpers only ever
// need to read `image.hoopFit`.
//
// Rule: a poor fit never goes in a hoop while a good photo of the same
// category exists. Square views (gallery swatches, the lightbox) ignore the flag.

export interface HoopImage {
  asset?: { _ref?: string; _id?: string } | null;
  hoopFit?: string | null;
  [key: string]: unknown;
}

/** A hotspot no wider or taller than this (0..1 of the photo) sits well in a circle. */
const COMPACT_HOTSPOT = 0.75;

const assetId = (img: HoopImage | null | undefined): string | undefined =>
  img?.asset?._id ?? img?.asset?._ref ?? undefined;

/** True when the photo is marked "keep it out of round hoops". */
export function isPoorHoopFit(img: HoopImage | null | undefined): boolean {
  return img?.hoopFit === 'poor';
}

/** True when the photo has an asset and is not marked poor. */
export function isGoodHoopImage(img: HoopImage | null | undefined): img is HoopImage {
  return !!assetId(img) && !isPoorHoopFit(img);
}

/**
 * The photos for a category page's hoop cluster (lead + small hoops).
 * Good hero photos first, in Mary Ann's order. Every poor one dropped is
 * replaced by a good photo from the category's own gallery (`fallbacks`, in
 * gallery order, never repeating a picture), so the cluster keeps its size.
 * If nothing good exists at all, the original hero photos are used rather
 * than leaving the hoops empty.
 */
export function pickHoopImages<T extends HoopImage>(
  heroImages: T[] | null | undefined,
  fallbacks: T[] | null | undefined = [],
): T[] {
  // Sanity sends null for an empty list, so both lists are optional.
  const heroes = (heroImages ?? []).filter((img) => !!assetId(img));
  const good = heroes.filter(isGoodHoopImage);
  const wanted = heroes.length;
  const used = new Set(good.map(assetId));
  // A stand-in whose hotspot fits well inside a circle is tried first (a wide
  // hotspot, like a long name, loses its ends in the round crop); the original
  // gallery order is kept within each group.
  const compact = (img: T) => {
    const h = img.hotspot as { width?: number; height?: number } | null | undefined;
    return !h || Math.max(h.width ?? 0, h.height ?? 0) <= COMPACT_HOTSPOT;
  };
  const list = fallbacks ?? [];
  const ordered = [...list.filter(compact), ...list.filter((img) => !compact(img))];
  for (const img of ordered) {
    if (good.length >= wanted) break;
    const id = assetId(img);
    if (!isGoodHoopImage(img) || !id || used.has(id)) continue;
    used.add(id);
    good.push(img);
  }
  return good.length ? good : heroes;
}

/**
 * The one photo for a category's hoop card: the card photo, unless it is a
 * poor fit, then the first good hero photo, then the card photo anyway.
 */
export function pickCardImage<T extends HoopImage>(
  cardImage: T | null | undefined,
  heroImages: T[] | null | undefined = [],
): T | null {
  if (isGoodHoopImage(cardImage)) return cardImage;
  const hero = (heroImages ?? []).find(isGoodHoopImage);
  if (hero) return hero;
  return cardImage && assetId(cardImage) ? cardImage : null;
}
