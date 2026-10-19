// Quick update's notices are whole, valid announcements (src/lib/quick-updates.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAwayNotice,
  buildDeadlineNotice,
  buildNotice,
  buildQuestion,
  buildWorkPhoto,
  endOfDay,
  noticeName,
  paragraphs,
  rankAfter,
} from './quick-updates.ts';

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

test('"Order deadline" words the notice from the occasion and the day', () => {
  const doc = buildDeadlineNotice({ occasion: 'Christmas.', lastOrderDay: '2026-12-01' });
  assert.equal(doc.message, 'Order by December 1 to have it in time for Christmas.');
  assert.equal(doc.style, 'highlight');
  assert.equal(new Date(doc.endDate).getDate(), 1);
  assert.equal(
    buildDeadlineNotice({ occasion: 'x', lastOrderDay: '2026-12-01', message: ' Mine. ' }).message,
    'Mine.',
  );
  assert.doesNotMatch(doc.message, /—/);
});

test('a new question is whole: rich-text answer, on How It Works, at the end of the list', () => {
  const doc = buildQuestion(
    { question: ' Can you stitch on a hat? ', answer: 'Yes.\n\nMost caps work.\nBring it by.' },
    '0|i0000o:',
  );
  assert.equal(doc._type, 'faqItem');
  assert.equal(doc.question, 'Can you stitch on a hat?');
  assert.equal(doc.answer.length, 2);
  assert.equal(doc.answer[1].children[0].text, 'Most caps work. Bring it by.');
  assert.equal(new Set(doc.answer.flatMap((b) => [b._key, b.children[0]._key])).size, 4);
  assert.equal(doc.showOnHowItWorks, true);
  assert.ok((doc.orderRank ?? '') > '0|i0000o:');
  assert.ok((doc.orderRank ?? '') < '0|i0000p:');
});

test('rankAfter starts a list in the middle and ignores a rank it cannot read', () => {
  assert.equal(rankAfter(null), '0|hzzzzz:');
  assert.equal(rankAfter('nonsense'), '0|hzzzzz:');
  assert.equal(rankAfter('0|hzzzzz:'), '0|hzzzzz:i');
  assert.deepEqual(paragraphs('  a \n b\n\n\n c '), ['a b', 'c']);
});

test('a work photo from the phone is a whole gallery photo; the title stands in for a caption', () => {
  const image = { _type: 'image', asset: { _type: 'reference', _ref: 'image-abc-10x10-jpg' } };
  const doc = buildWorkPhoto({
    title: 'Baby blanket',
    alt: ' Pink name on a blanket ',
    caption: '',
    image,
  });
  assert.equal(doc._type, 'galleryItem');
  assert.deepEqual(doc.image, { ...image, alt: 'Pink name on a blanket', caption: 'Baby blanket' });
  assert.equal(doc.hoopFit, 'good');
  const own = buildWorkPhoto({ title: 'T', alt: 'Alt words', caption: 'Mine', image });
  assert.equal((own.image as { caption: string }).caption, 'Mine');
  const none = buildWorkPhoto({
    title: ' ',
    alt: 'Alt words',
    caption: '',
    image: { ...image, caption: 'x' },
  });
  assert.equal('caption' in (none.image as object), false);
});
