// Gift guides and season pages: which photos show (src/lib/collections.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionPhotos, collectionQuoteHref } from './collections.ts';

const img = { asset: { _ref: 'image-x' } };
const G = [
  { _id: 'a', image: img, tags: ['christmas', 'towel'] },
  { _id: 'b', image: img, tags: ['wedding'] },
  { _id: 'c', image: img, tags: ['Christmas '] },
  { _id: 'd', image: null, tags: ['christmas'] },
  { _id: 'e', image: img, tags: [] },
];

test('picked photos come first, then tag matches in gallery order, never twice', () => {
  const out = collectionPhotos({ pickedIds: ['e', 'c'], photoTags: ['christmas'] }, G);
  assert.deepEqual(
    out.map((g) => g._id),
    ['e', 'c', 'a'],
  );
});

test('a photo with no picture never shows; tags ignore case and spaces', () => {
  const out = collectionPhotos({ photoTags: [' CHRISTMAS'] }, G);
  assert.deepEqual(
    out.map((g) => g._id),
    ['a', 'c'],
  );
});

test('no tags and no picks: no photos; and the list is capped', () => {
  assert.deepEqual(collectionPhotos({}, G), []);
  assert.deepEqual(collectionPhotos(null, null), []);
  const many = Array.from({ length: 30 }, (_, i) => ({ _id: `p${i}`, image: img, tags: ['x'] }));
  assert.equal(collectionPhotos({ photoTags: ['x'] }, many, 5).length, 5);
});

test('a draft id in the picks still finds its published photo', () => {
  assert.deepEqual(
    collectionPhotos({ pickedIds: ['drafts.b'] }, G).map((g) => g._id),
    ['b'],
  );
});

test('the quote button starts on the item only when the page names exactly one', () => {
  assert.equal(
    collectionQuoteHref({ categories: [{ slug: { current: 'tote-bags' } }] }),
    '/request-a-quote/?item=tote-bags',
  );
  assert.equal(
    collectionQuoteHref({
      categories: [{ slug: { current: 'tote-bags' } }, { slug: { current: 'hats-caps' } }],
    }),
    '/request-a-quote/',
  );
  assert.equal(collectionQuoteHref(null), '/request-a-quote/');
});
