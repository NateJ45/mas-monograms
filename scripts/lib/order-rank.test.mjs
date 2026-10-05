// The drag-order backfill (scripts/backfill-order-rank.mjs), without Sanity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LexoRank } from 'lexorank';
import { isValidRank, nextRanks, planRanks, siteOrder } from './order-rank.mjs';

test('ranks are what the plugin itself makes, and every one parses', () => {
  // @sanity/orderable-document-list 2.0.9 "Reset Order": LexoRank.min() then
  // genNext().genNext() per item.
  let r = LexoRank.min();
  const plugin = Array.from({ length: 70 }, () => (r = r.genNext().genNext()).toString());
  const ours = nextRanks(70);
  assert.deepEqual(ours, plugin);
  for (const rank of ours) assert.ok(isValidRank(rank), rank);
  // Strictly increasing as plain strings: GROQ's `order(orderRank asc)` and the
  // plugin's own lexicographic sort agree.
  for (let i = 1; i < ours.length; i++) assert.ok(ours[i - 1] < ours[i]);
});

test('hand-written seeds like Stone Steps\' "a0" are not valid ranks', () => {
  for (const bad of ['a0', 'a1', '', null, 3]) assert.ok(!isValidRank(bad), String(bad));
});

test('site order is displayOrder, then _id, with missing numbers last', () => {
  const docs = [
    { _id: 'font-pillow', displayOrder: 1 },
    { _id: 'font-z', displayOrder: undefined },
    { _id: 'font-meadow', displayOrder: 1 },
    { _id: 'font-classic', displayOrder: 7 },
  ];
  assert.deepEqual(
    siteOrder(docs).map((d) => d._id),
    ['font-meadow', 'font-pillow', 'font-classic', 'font-z'],
  );
});

test('the backfill preserves the live order and is idempotent', () => {
  const docs = [
    { _id: 'b', displayOrder: 2 },
    { _id: 'a', displayOrder: 1 },
    { _id: 'c', displayOrder: 3 },
  ];
  const plan = planRanks(docs);
  assert.deepEqual(
    plan.map((p) => p._id),
    ['a', 'b', 'c'],
  );
  const ranked = docs.map((d) => ({
    ...d,
    orderRank: plan.find((p) => p._id === d._id).orderRank,
  }));
  assert.deepEqual(
    [...ranked].sort((x, y) => (x.orderRank < y.orderRank ? -1 : 1)).map((d) => d._id),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(planRanks(ranked), []); // second run: 0 changes
});

test('a dragged rank is never renumbered; new ones go after it', () => {
  const docs = [
    { _id: 'a', displayOrder: 1, orderRank: '0|10000o:' },
    { _id: 'b', displayOrder: 2 },
    { _id: 'c', displayOrder: 0 },
  ];
  const plan = planRanks(docs);
  assert.deepEqual(
    plan.map((p) => p._id),
    ['c', 'b'],
  );
  for (const p of plan) assert.ok(p.orderRank > '0|10000o:', p.orderRank);
});
