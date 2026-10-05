// =============================================================================
// Stega safety of the real pages in the canvas (2026-10-05, Phase C)
// =============================================================================
// Since the canvas renders the REAL page files, every value those pages use in
// logic arrives through the preview client. These tests pin the three layers
// that keep a stega marker out of logic and out of addresses:
//
//   1. preview-stega-filter: which fields never get a marker at all;
//   2. stega-text: cutting a headline without cutting its marker;
//   3. edit-target: the photo and list click targets never reach the live site.
//
// Plus a scan of the page files for the patterns that break on a marker, so a
// new one cannot slip in unnoticed.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { keepClean, lastFieldName, NON_STEGA_FIELDS } from './preview-stega-filter.ts';
import { splitKeep, takeRun, trimKeep } from './stega-text.ts';
import { stegaSource } from './preview-stega.ts';
import { editField, editItem, editOther, morphKeep } from './edit-target.ts';
import { swashSplit } from '../components/home/swashSplit.ts';
import { splitSwash } from '../components/gallery/swash.ts';
import { isPoorHoopFit } from './hoop.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

// A real modern stega run (4-char U+200B prefix, then base-4 digits), built
// from a payload so the decode round trip can be checked. Ends in U+FEFF on
// purpose: that is the digit `\s` and `.trim()` eat.
function run(path: string): string {
  const json = JSON.stringify({
    origin: 'sanity.io',
    href: `/studio/intent/edit/id=homePage;type=homePage;path=${path}?id=homePage&type=homePage&path=${encodeURIComponent(path)}`,
  });
  const digits = ['​', '‌', '‍', '﻿'];
  let out = digits[0].repeat(4);
  for (const byte of new TextEncoder().encode(json)) {
    out +=
      digits[(byte >> 6) & 3] +
      digits[(byte >> 4) & 3] +
      digits[(byte >> 2) & 3] +
      digits[byte & 3];
  }
  // Pad with a final byte whose low digit is U+FEFF (value 3) if needed.
  return out;
}
const RUN = run('heroHeadline');
const withRun = (text: string) => text + RUN;

// -----------------------------------------------------------------------------
// 1. The filter
// -----------------------------------------------------------------------------

test('the values the page code compares, parses or links never carry a marker', () => {
  for (const name of [
    'hexColor', // thread chart + Atelier parse it as a colour
    'hoopFit', // 'poor' keeps a photo out of round hoops
    'atelierStyle', // the font guide's try-it link carries it
    'tags', // the gallery filter matches them exactly
    'colorFamily',
    'styleTag',
    'linkType',
    'category',
  ]) {
    assert.ok(NON_STEGA_FIELDS.has(name), name);
    assert.ok(keepClean([name]), name);
  }
});

test('address fields stay clean by their name', () => {
  for (const name of ['ctaHref', 'heroPrimaryCtaHref', 'stripePaymentLink', 'footerCreditUrl']) {
    assert.ok(keepClean([name]), name);
  }
  // ...but the words ON a button are display text and keep click-to-edit.
  for (const name of ['ctaLabel', 'heroPrimaryCtaLabel', 'buyButtonLabel']) {
    assert.ok(!keepClean([name]), name);
  }
});

test('a list of plain words is judged by the list name, not the index', () => {
  assert.equal(lastFieldName(['tags', 2]), 'tags');
  assert.ok(keepClean(['tags', 2]));
  assert.ok(keepClean(['styles', 0, 'style']));
  assert.ok(!keepClean(['makerFacts', 1]));
  assert.ok(!keepClean(['processSteps', { _key: 'a' }, 'label']));
  assert.equal(lastFieldName([]), undefined);
});

test('the words Mary Ann reads keep their markers', () => {
  for (const name of ['heroHeadline', 'heroSubhead', 'makerQuote', 'name', 'label', 'body']) {
    assert.ok(!keepClean([name]), name);
  }
});

test('the preview client actually uses the filter', () => {
  const client = read('./cms-preview.ts');
  assert.match(client, /keepClean\(props\.sourcePath\)/);
});

// -----------------------------------------------------------------------------
// 2. Cutting text without cutting the marker
// -----------------------------------------------------------------------------

test('the test run decodes, so the checks below mean something', () => {
  assert.equal(stegaSource('x' + RUN)?.path, 'heroHeadline');
});

test('takeRun separates the words from the marker, and is a no-op on the live site', () => {
  assert.deepEqual(takeRun(withRun('Simple pricing')), { text: 'Simple pricing', run: RUN });
  assert.deepEqual(takeRun('Simple pricing'), { text: 'Simple pricing', run: '' });
  assert.deepEqual(takeRun(null), { text: '', run: '' });
});

test('trimKeep and splitKeep keep the marker whole', () => {
  assert.equal(trimKeep(withRun('  Hello  ')), 'Hello' + RUN);
  assert.equal(trimKeep('  Hello  '), 'Hello');
  const facts = splitKeep(withRun('Handmade · Local · One maker'), /\s*[·•|]\s*/);
  assert.deepEqual(facts, ['Handmade', 'Local', 'One maker' + RUN]);
  assert.equal(stegaSource(facts[2])?.path, 'heroHeadline');
  assert.deepEqual(splitKeep('a · b', /\s*·\s*/), ['a', 'b']);
});

test('swashSplit: same answer as before on plain text, marker intact in the canvas', () => {
  assert.deepEqual(swashSplit('Made just for you'), { before: 'Made just for ', swash: 'you' });
  assert.deepEqual(swashSplit('Made just for you', 2), { before: 'Made just ', swash: 'for you' });
  assert.deepEqual(swashSplit('Hello'), { before: '', swash: 'Hello' });
  assert.deepEqual(swashSplit(''), { before: '', swash: '' });
  const split = swashSplit(withRun('Made just for you'));
  assert.equal(split.before, 'Made just for ');
  assert.equal(split.swash, 'you' + RUN);
  assert.equal(stegaSource(split.swash)?.path, 'heroHeadline');
});

test('splitSwash: same answer as before on plain text, marker intact in the canvas', () => {
  assert.deepEqual(splitSwash('Ready to ship, no quote needed'), {
    before: 'Ready to ship, ',
    word: 'no quote needed',
    after: '',
  });
  assert.deepEqual(splitSwash('Towels & Linens.'), {
    before: 'Towels & ',
    word: 'Linens',
    after: '.',
  });
  const plain = splitSwash('Towels & Linens.');
  const marked = splitSwash(withRun('Towels & Linens.'));
  assert.equal(marked.before, plain.before);
  assert.equal(marked.word, plain.word);
  assert.equal(marked.after, '.' + RUN);
  assert.equal(stegaSource(marked.after)?.path, 'heroHeadline');
});

test('a clean hoopFit still keeps a poor photo out of the hoops', () => {
  assert.equal(isPoorHoopFit({ hoopFit: 'poor' }), true);
  assert.equal(isPoorHoopFit({ hoopFit: 'good' }), false);
});

// -----------------------------------------------------------------------------
// 3. Click targets never reach the live site
// -----------------------------------------------------------------------------

test('every click-target helper renders NOTHING without an edit target', () => {
  assert.equal(editField(undefined, 'aboutPhoto'), undefined);
  assert.equal(editField(null, 'aboutPhoto'), undefined);
  assert.equal(editItem(undefined, 'processSteps', { _key: 'a' }, 0), undefined);
  assert.equal(editOther(undefined, 'abc', 'galleryItem', 'image'), undefined);
  assert.equal(morphKeep(undefined), undefined);
});

test('in the canvas the targets point at the right document and item', () => {
  const edit = { id: 'drafts.homePage', type: 'homePage' };
  assert.match(editField(edit, 'aboutPhoto')!, /id=homePage;type=homePage;path=aboutPhoto/);
  assert.match(editItem(edit, 'processSteps', { _key: 'k1' }, 3)!, /path=processSteps:k1;/);
  // A list of plain words has no keys: its position is the address.
  assert.match(editItem(edit, 'trustItems', null, 2)!, /path=trustItems:2;/);
  assert.match(
    editOther(edit, 'gallery-1', 'galleryItem', 'image')!,
    /id=gallery-1;type=galleryItem/,
  );
  assert.equal(editOther(edit, undefined, 'galleryItem', 'image'), undefined);
});

// -----------------------------------------------------------------------------
// 4. The page files: no new marker-breaking pattern
// -----------------------------------------------------------------------------

const PAGE_FILES = [
  '../pages/index.astro',
  '../pages/how-it-works.astro',
  '../pages/pricing.astro',
  '../pages/about.astro',
  '../pages/request-a-quote.astro',
  '../pages/shop-by-item.astro',
  '../pages/style-gallery.astro',
  '../pages/font-lettering-guide.astro',
  '../pages/thread-color-chart.astro',
  '../pages/clearance.astro',
  '../pages/thank-you.astro',
  '../pages/[slug].astro',
  '../components/pages/NotFoundBody.astro',
];

test('page code never splits Sanity words on whitespace without taking the marker off', () => {
  // `\s` matches U+FEFF, a stega digit, so `x.split(/\s+/)` chops the marker
  // into pieces. Every such split must go through stega-text (takeRun /
  // splitKeep) or a stega-safe helper (swashSplit, splitSwash).
  for (const file of PAGE_FILES) {
    const src = read(file);
    for (const match of src.matchAll(/^.*\.split\(\/\\s.*$/gm)) {
      const line = match[0];
      assert.ok(
        /hText|visible|cleaned|\.text\b/.test(line) || /takeRun|splitKeep/.test(src),
        `${file}: a whitespace split on Sanity words without takeRun: ${line.trim()}`,
      );
    }
  }
});

test('every page renders itself in the canvas: the preview prop is honoured', () => {
  for (const file of PAGE_FILES.filter((f) => f.startsWith('../pages/'))) {
    const src = read(file);
    assert.match(src, /const \{ preview \} = Astro\.props as PageProps</, file);
    assert.match(src, /preview\?\.layout \?\? BaseLayout/, file);
    assert.match(src, /\{\.\.\.preview\?\.layoutProps\}/, file);
  }
});
