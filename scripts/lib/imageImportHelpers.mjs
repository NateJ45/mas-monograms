// scripts/lib/imageImportHelpers.mjs
//
// Pure, side-effect-free helpers for scripts/import-squarespace-images.mjs.
// No network calls, no Sanity client — everything here is a plain data
// transform, which is what makes it unit-testable without mocking anything.

/**
 * Slugify a string into a lowercase, hyphen-separated form suitable for
 * both Sanity slugs and deterministic document IDs.
 * @param {string} input
 * @returns {string}
 */
function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {string} filenameOrName */
export function galleryItemId(filenameOrName) {
  return `galleryItem-${slugify(filenameOrName)}`;
}

/** @param {string} name */
export function fontId(name) {
  return `font-${slugify(name)}`;
}

/** @param {string} name */
export function threadColorId(name) {
  return `threadColor-${slugify(name)}`;
}

/**
 * Extract and URL-decode the basename (without extension-stripping) from a
 * Squarespace CDN URL, ignoring any query string.
 * @param {string} url
 * @returns {string}
 */
export function filenameFromUrl(url) {
  const withoutQuery = url.split('?')[0];
  const lastSegment = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
  return decodeURIComponent(lastSegment.replace(/\+/g, ' '));
}

/**
 * @param {{
 *   sourceUrl: string,
 *   alt: string,
 *   caption: string | null,
 *   relatedCategorySlug: string | null,
 *   relatedFontSlug: string | null,
 *   tags: string[],
 *   featured: boolean,
 *   displayOrder: number,
 * }} entry
 * @param {string} assetId - the Sanity asset document _id from client.assets.upload()
 */
export function buildGalleryItemDoc(entry, assetId) {
  const filename = filenameFromUrl(entry.sourceUrl).replace(/\.[^.]+$/, '');
  const doc = {
    _id: galleryItemId(filename),
    _type: 'galleryItem',
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: entry.alt,
    },
    tags: entry.tags,
    featured: entry.featured,
    displayOrder: entry.displayOrder,
  };
  if (entry.caption) doc.image.caption = entry.caption;
  if (entry.relatedCategorySlug) {
    doc.relatedCategory = { _type: 'reference', _ref: `category-${entry.relatedCategorySlug}` };
  }
  if (entry.relatedFontSlug) {
    doc.relatedFont = { _type: 'reference', _ref: fontId(entry.relatedFontSlug) };
  }
  return doc;
}

/**
 * @param {{ sourceUrl: string, name: string, styleTag: string, alt: string, displayOrder: number }} entry
 * @param {string} assetId
 */
export function buildFontDoc(entry, assetId) {
  return {
    _id: fontId(entry.name),
    _type: 'font',
    name: entry.name,
    slug: { _type: 'slug', current: slugify(entry.name) },
    previewImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: entry.alt,
    },
    styleTag: entry.styleTag,
    displayOrder: entry.displayOrder,
  };
}

/**
 * @param {{ name: string, hexColor: string, colorFamily: string, dmcNumber: string | null, displayOrder: number }} entry
 */
export function buildThreadColorDoc(entry) {
  const doc = {
    _id: threadColorId(entry.name),
    _type: 'threadColor',
    name: entry.name,
    slug: { _type: 'slug', current: slugify(entry.name) },
    hexColor: entry.hexColor,
    colorFamily: entry.colorFamily,
    displayOrder: entry.displayOrder,
  };
  if (entry.dmcNumber) doc.dmcNumber = entry.dmcNumber;
  return doc;
}

/**
 * @param {{
 *   cardImageAssetId: string,
 *   cardAlt: string,
 *   heroImages: { assetId: string, alt: string }[],
 * }} entry
 */
export function buildCategoryImagePatch(entry) {
  return {
    cardImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: entry.cardImageAssetId },
      alt: entry.cardAlt,
    },
    heroImages: entry.heroImages.map((h) => ({
      _type: 'image',
      asset: { _type: 'reference', _ref: h.assetId },
      alt: h.alt,
    })),
  };
}
