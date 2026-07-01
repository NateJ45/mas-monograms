import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  galleryItemId,
  fontId,
  threadColorId,
  filenameFromUrl,
  buildGalleryItemDoc,
  buildFontDoc,
  buildThreadColorDoc,
  buildCategoryImagePatch,
} from './imageImportHelpers.mjs';

test('galleryItemId derives a deterministic id from a filename', () => {
  assert.equal(galleryItemId('monogram-32'), 'galleryItem-monogram-32');
  assert.equal(galleryItemId('Bunny Wreath Sash'), 'galleryItem-bunny-wreath-sash');
});

test('galleryItemId is stable across repeated calls (idempotency)', () => {
  assert.equal(galleryItemId('design-24'), galleryItemId('design-24'));
});

test('fontId derives a deterministic id from a font name', () => {
  assert.equal(fontId('Pillow'), 'font-pillow');
  assert.equal(fontId('CA Liberty'), 'font-ca-liberty');
});

test('threadColorId derives a deterministic id from a color name', () => {
  assert.equal(threadColorId('Navy'), 'threadColor-navy');
  assert.equal(threadColorId('Dusty Rose'), 'threadColor-dusty-rose');
});

test('filenameFromUrl extracts and decodes the basename', () => {
  assert.equal(
    filenameFromUrl('https://images.squarespace-cdn.com/content/v1/x/y/monogram-32.jpg'),
    'monogram-32.jpg',
  );
  assert.equal(
    filenameFromUrl('https://images.squarespace-cdn.com/content/69933a78/a7824a28/Pillow+%281%29.jpg?content-type=image%2Fjpeg'),
    'Pillow (1).jpg',
  );
});

test('buildGalleryItemDoc shapes a complete document with a category reference', () => {
  const doc = buildGalleryItemDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/v1/x/y/monogram-32.jpg',
    alt: 'Navy block monogram on a white bath towel',
    caption: null,
    relatedCategorySlug: 'towels-linens',
    relatedFontSlug: null,
    tags: ['monogram', 'towel'],
    featured: false,
    displayOrder: 1,
  }, 'sanity-asset-id-abc123');

  assert.equal(doc._id, 'galleryItem-monogram-32');
  assert.equal(doc._type, 'galleryItem');
  assert.equal(doc.image.asset._ref, 'sanity-asset-id-abc123');
  assert.equal(doc.image.alt, 'Navy block monogram on a white bath towel');
  assert.equal(doc.relatedCategory._ref, 'category-towels-linens');
  assert.equal(doc.relatedFont, undefined);
  assert.deepEqual(doc.tags, ['monogram', 'towel']);
  assert.equal(doc.featured, false);
  assert.equal(doc.displayOrder, 1);
});

test('buildGalleryItemDoc omits relatedCategory/relatedFont when not provided', () => {
  const doc = buildGalleryItemDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/v1/x/y/design-24.jpg',
    alt: 'Floral appliqué design on a canvas tote',
    caption: null,
    relatedCategorySlug: null,
    relatedFontSlug: null,
    tags: ['appliqué'],
    featured: true,
    displayOrder: 2,
  }, 'sanity-asset-id-xyz789');

  assert.equal('relatedCategory' in doc, false);
  assert.equal('relatedFont' in doc, false);
});

test('buildFontDoc shapes a complete font document', () => {
  const doc = buildFontDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/69933a78/a7824a28/Pillow+%281%29.jpg',
    name: 'Pillow',
    styleTag: 'script',
    alt: 'Pillow font sample — embroidered in cursive script on white fabric',
    displayOrder: 1,
  }, 'sanity-asset-id-font1');

  assert.equal(doc._id, 'font-pillow');
  assert.equal(doc._type, 'font');
  assert.equal(doc.name, 'Pillow');
  assert.equal(doc.slug.current, 'pillow');
  assert.equal(doc.previewImage.asset._ref, 'sanity-asset-id-font1');
  assert.equal(doc.previewImage.alt, 'Pillow font sample — embroidered in cursive script on white fabric');
  assert.equal(doc.styleTag, 'script');
  assert.equal(doc.displayOrder, 1);
});

test('buildThreadColorDoc shapes a text-only document with no image fields', () => {
  const doc = buildThreadColorDoc({
    name: 'Navy',
    hexColor: '#1a2f4d',
    colorFamily: 'blue',
    dmcNumber: null,
    displayOrder: 1,
  });

  assert.equal(doc._id, 'threadColor-navy');
  assert.equal(doc._type, 'threadColor');
  assert.equal(doc.name, 'Navy');
  assert.equal(doc.slug.current, 'navy');
  assert.equal(doc.hexColor, '#1a2f4d');
  assert.equal(doc.colorFamily, 'blue');
  assert.equal('swatchImage' in doc, false);
  assert.equal('dmcNumber' in doc, false);
});

test('buildThreadColorDoc includes dmcNumber when provided', () => {
  const doc = buildThreadColorDoc({
    name: 'Hunter Green',
    hexColor: '#355e3b',
    colorFamily: 'green',
    dmcNumber: '3345',
    displayOrder: 5,
  });
  assert.equal(doc.dmcNumber, '3345');
});

test('buildCategoryImagePatch shapes a patch with cardImage and heroImages', () => {
  const patch = buildCategoryImagePatch({
    cardImageAssetId: 'sanity-asset-card1',
    cardAlt: 'Monogrammed white bath towel folded on a shelf',
    heroImages: [
      { assetId: 'sanity-asset-hero1', alt: 'Stack of monogrammed towels in navy and white' },
    ],
  });

  assert.equal(patch.cardImage.asset._ref, 'sanity-asset-card1');
  assert.equal(patch.cardImage.alt, 'Monogrammed white bath towel folded on a shelf');
  assert.equal(patch.heroImages.length, 1);
  assert.equal(patch.heroImages[0].asset._ref, 'sanity-asset-hero1');
  assert.equal(patch.heroImages[0].alt, 'Stack of monogrammed towels in navy and white');
});
