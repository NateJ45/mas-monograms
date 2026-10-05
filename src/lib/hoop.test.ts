// Photos for the round hoops (src/lib/hoop.ts): a photo marked hoopFit "poor"
// never goes in a hoop while a good photo of the same category exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPoorHoopFit, pickHoopImages, pickCardImage } from './hoop.ts';

const img = (id: string, hoopFit?: string) => ({ asset: { _id: id }, hoopFit: hoopFit ?? null });

test('isPoorHoopFit reads only the "poor" value', () => {
  assert.equal(isPoorHoopFit(img('a', 'poor')), true);
  assert.equal(isPoorHoopFit(img('a', 'good')), false);
  assert.equal(isPoorHoopFit(img('a')), false);
  assert.equal(isPoorHoopFit(null), false);
});

test('pickHoopImages keeps good heroes in order', () => {
  const out = pickHoopImages([img('a'), img('b', 'good'), img('c')]);
  assert.deepEqual(
    out.map((i) => i.asset._id),
    ['a', 'b', 'c'],
  );
});

test('pickHoopImages swaps a poor hero for a good gallery photo of the category', () => {
  const out = pickHoopImages(
    [img('a'), img('b'), img('poor', 'poor')],
    [img('a'), img('also-poor', 'poor'), img('g1'), img('g2')],
  );
  assert.deepEqual(
    out.map((i) => i.asset._id),
    ['a', 'b', 'g1'],
  );
});

test('pickHoopImages prefers a stand-in whose hotspot fits a circle', () => {
  const wide = { ...img('wide'), hotspot: { x: 0.5, y: 0.5, width: 0.9, height: 0.6 } };
  const tight = { ...img('tight'), hotspot: { x: 0.5, y: 0.5, width: 0.4, height: 0.3 } };
  const out = pickHoopImages([img('a'), img('p', 'poor')], [wide, tight]);
  assert.deepEqual(
    out.map((i) => i.asset._id),
    ['a', 'tight'],
  );
  // a wide one is still used when nothing compact is left
  const only = pickHoopImages([img('a'), img('p', 'poor')], [wide]);
  assert.equal(only[1].asset._id, 'wide');
});

test('pickHoopImages never puts a poor photo first when a good one exists', () => {
  const out = pickHoopImages([img('poor', 'poor'), img('b')]);
  assert.equal(out[0].asset._id, 'b');
  assert.ok(out.every((i) => i.hoopFit !== 'poor'));
});

test('pickHoopImages falls back to the heroes when nothing good exists', () => {
  const out = pickHoopImages([img('p1', 'poor'), img('p2', 'poor')], [img('p3', 'poor')]);
  assert.deepEqual(
    out.map((i) => i.asset._id),
    ['p1', 'p2'],
  );
});

test('pickHoopImages ignores entries with no asset', () => {
  const out = pickHoopImages([{ asset: null } as never, img('a')]);
  assert.deepEqual(
    out.map((i) => i.asset._id),
    ['a'],
  );
});

test('null lists from Sanity (a category with no photos) are empty, not a crash', () => {
  assert.deepEqual(pickHoopImages(null, null), []);
  assert.equal(pickCardImage(null, null), null);
  assert.equal(pickCardImage(img('card'), null)?.asset?._id, 'card');
});

test('pickCardImage prefers a good card, then a good hero, then the card anyway', () => {
  assert.equal(pickCardImage(img('card'), [img('h')])?.asset?._id, 'card');
  assert.equal(
    pickCardImage(img('card', 'poor'), [img('h1', 'poor'), img('h2')])?.asset?._id,
    'h2',
  );
  assert.equal(pickCardImage(img('card', 'poor'), [img('h1', 'poor')])?.asset?._id, 'card');
  assert.equal(pickCardImage(null, []), null);
});
