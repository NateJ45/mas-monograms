// The notice across the top: which one shows (src/lib/notices.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inWindow, MAX_NOTICES, NOTICE_SCRIPT, placeNotices } from './notices.ts';

const NOW = Date.parse('2026-11-20T12:00:00Z');

test('a notice with no dates is always inside them', () => {
  assert.equal(inWindow({ message: 'Hi' }, NOW), true);
});

test('a notice before its first day or after its last is not', () => {
  assert.equal(inWindow({ startDate: '2026-11-21T00:00:00Z' }, NOW), false);
  assert.equal(inWindow({ endDate: '2026-11-20T11:59:00Z' }, NOW), false);
  assert.equal(
    inWindow({ startDate: '2026-11-01T00:00:00Z', endDate: '2026-12-01T00:00:00Z' }, NOW),
    true,
  );
});

test('ended and empty notices are dropped; the most important shows first', () => {
  const placed = placeNotices(
    [
      { message: 'Calm one', style: 'info' },
      { message: 'Old', style: 'urgent', endDate: '2026-11-01T00:00:00Z' },
      { message: '   ', style: 'urgent' },
      { message: 'Good news', style: 'highlight' },
    ],
    NOW,
  );
  assert.deepEqual(
    placed.map((n) => [n.message, n.visible]),
    [
      ['Good news', true],
      ['Calm one', false],
    ],
  );
});

test('an upcoming important notice is drawn hidden, and the calm one shows until it starts', () => {
  const placed = placeNotices(
    [
      { message: 'Away from Dec 20', style: 'urgent', startDate: '2026-12-20T00:00:00Z' },
      { message: 'Order by Dec 1', style: 'info' },
    ],
    NOW,
  );
  assert.deepEqual(
    placed.map((n) => [n.message, n.visible]),
    [
      ['Away from Dec 20', false],
      ['Order by Dec 1', true],
    ],
  );
});

test('at most a few notices go into every page', () => {
  const many = Array.from({ length: 8 }, (_, i) => ({ message: `n${i}` }));
  assert.equal(placeNotices(many, NOW).length, MAX_NOTICES);
  assert.deepEqual(placeNotices(null, NOW), []);
});

test('the browser script shows the first notice inside its dates and hides the rest', () => {
  const els = [
    { attrs: { 'data-from': '2026-12-20T00:00:00Z' }, hidden: true },
    { attrs: { 'data-until': '2026-11-19T00:00:00Z' }, hidden: false },
    { attrs: {}, hidden: true },
    { attrs: {}, hidden: false },
  ].map((e) => ({
    ...e,
    getAttribute: (k: string) => (e.attrs as Record<string, string>)[k] ?? null,
  }));
  const doc = { querySelectorAll: () => els };
  const realNow = Date.now;
  Date.now = () => NOW;
  try {
    new Function('document', NOTICE_SCRIPT)(doc);
  } finally {
    Date.now = realNow;
  }
  assert.deepEqual(
    els.map((e) => e.hidden),
    [true, true, false, true],
  );
});
