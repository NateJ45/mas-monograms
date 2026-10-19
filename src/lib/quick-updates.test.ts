// Quick update's notices are whole, valid announcements (src/lib/quick-updates.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAwayNotice, buildNotice, endOfDay, noticeName } from './quick-updates.ts';

test('a notice shows until the very end of its last day', () => {
  const end = new Date(endOfDay('2026-12-01'));
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getDate(), 1);
});

test('"Put up a notice" makes a whole notice, switched on, good news by default', () => {
  const doc = buildNotice({
    message: '  Order by December 1 for Christmas.  ',
    lastDay: '2026-12-01',
  });
  assert.equal(doc._type, 'announcement');
  assert.equal(doc.message, 'Order by December 1 for Christmas.');
  assert.equal(doc.enabled, true);
  assert.equal(doc.style, 'highlight');
  assert.ok(doc.internalTitle.endsWith('(until 2026-12-01)'));
  assert.equal(doc.link, undefined);
  assert.deepEqual(
    buildNotice({
      message: 'x',
      lastDay: '2026-12-01',
      link: 'https://mas-monograms.com/clearance/',
    }).link,
    { label: 'Find out more', url: 'https://mas-monograms.com/clearance/' },
  );
});

test('"I am away" is important, starts on its first day and says when she is back', () => {
  const doc = buildAwayNotice({ firstDay: '2026-12-20', lastDay: '2027-01-04' });
  assert.equal(doc.style, 'urgent');
  assert.match(doc.message, /^I am away until January 4\. /);
  assert.ok(doc.startDate && new Date(doc.startDate).getDate() === 20);
  assert.equal(
    buildAwayNotice({ lastDay: '2027-01-04', message: 'Closed for the holidays.' }).message,
    'Closed for the holidays.',
  );
});

test('the name in her list stays short', () => {
  const long = noticeName('a'.repeat(80), '2026-12-01');
  assert.ok(long.length < 70);
});

test('no notice word has an em-dash', () => {
  const doc = buildAwayNotice({ lastDay: '2027-01-04' });
  assert.ok(!JSON.stringify(doc).includes('\u2014'));
});
