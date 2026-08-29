// =============================================================================
// page-fields - the registry, and the DRIFT GATE that keeps it honest
// =============================================================================
// src/lib/page-fields.ts duplicates knowledge that lives in the schema, because
// the preview island cannot ask the Studio which fields a page has. The
// duplication is only safe while something checks it, so the first half of this
// file READS THREE SOURCES and fails when they and the registry disagree:
//
//   - src/sanity/schemaTypes/index.ts, for which page singletons are
//     REGISTERED. An unregistered schema is a file, not a page.
//   - each page schema, for which of them declares each line, so `onTypes`
//     cannot drift.
//   - src/pages/preview/[...slug].astro, for whether the preview surface
//     actually renders the line. A card can only hang on an element that
//     exists, and "the schema has the field" is not "the editor sees it".
//
// It also gates the two controls this site deliberately does NOT have. Those
// absences are decisions, not oversights, and a decision that nothing measures
// quietly becomes a bug the day somebody adds a `tone` field.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  EDITABLE_LINES,
  PAGE_TYPES,
  cleanLine,
  overlayControlsForPath,
  resolveTextTarget,
} from './page-fields.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const SCHEMA_INDEX = read('../sanity/schemaTypes/index.ts');
const PREVIEW_ROUTE = read('../pages/preview/[...slug].astro');
const HERO = read('../components/Hero.astro');

/** One page schema's source, cached by type name. */
const sources = new Map<string, string>(
  PAGE_TYPES.map((type) => [type, read(`../sanity/schemaTypes/${type}.ts`)]),
);

/**
 * The TOP-LEVEL field names a page schema declares, in schema order.
 *
 * Top level only, and deliberately: a nested object inside a repeatable array
 * may carry a field of the same name (an array of steps with its own `label`),
 * and a card that matched one of those would write to the document root. The
 * page schemas indent a top-level `defineField` by exactly four spaces, in one
 * of the two shapes below.
 */
function topLevelFields(source: string): string[] {
  const inline = [...source.matchAll(/^ {4}defineField\(\{ name: '(\w+)'/gm)].map((m) => m[1]);
  const wrapped = [...source.matchAll(/^ {4}defineField\(\{\n {6}name: '(\w+)',/gm)].map(
    (m) => m[1],
  );
  return [...inline, ...wrapped];
}

// Sanity's stega payload is a run of invisible characters appended to a string.
const STEGA_TAIL = '​‌‍﻿​‌';
const encoded = (text: string) => text + STEGA_TAIL;

// =============================================================================
// The drift gate
// =============================================================================

test('the gate parsed the schemas at all', () => {
  assert.ok(topLevelFields(sources.get('homePage')!).includes('heroHeadline'));
  assert.ok(topLevelFields(sources.get('notFoundPage')!).includes('headline'));
});

test('PAGE_TYPES lists exactly the page singletons the Studio registers', () => {
  // The registered list is the block between the two section comments in
  // schemaTypes/index.ts. Anything outside it is a collection or a helper doc.
  const block = SCHEMA_INDEX.slice(
    SCHEMA_INDEX.indexOf('Singleton pages'),
    SCHEMA_INDEX.indexOf('Collections'),
  );
  const registered = [...block.matchAll(/^ {2}(\w+),$/gm)]
    .map((m) => m[1])
    .filter((name) => name !== 'siteSettings');
  assert.deepEqual([...PAGE_TYPES], registered);
});

test('every line in the registry is declared by exactly the types it claims', () => {
  for (const line of EDITABLE_LINES) {
    const declaring = PAGE_TYPES.filter((type) =>
      topLevelFields(sources.get(type)!).includes(line.name),
    );
    assert.deepEqual(
      [...line.onTypes].sort(),
      declaring.sort(),
      `${line.name}: onTypes does not match the schemas that declare it`,
    );
  }
});

test('every line in the registry is one the preview surface renders', () => {
  // The preview route reads each of these off the document. A line the route
  // stopped rendering would leave a card with no element to hang on.
  for (const line of EDITABLE_LINES) {
    assert.ok(
      PREVIEW_ROUTE.includes(`doc.${line.name}`),
      `${line.name}: the preview route does not render it`,
    );
  }
});

test('ctaEyebrow is deliberately absent: the preview banner does not draw it', () => {
  // The field is real and CtaBanner renders it on the live site, but the
  // preview's closing band is headline / subhead / button only. Add the line to
  // the registry on the day the band grows an eyebrow, and not before.
  const declaring = PAGE_TYPES.filter((type) =>
    topLevelFields(sources.get(type)!).includes('ctaEyebrow'),
  );
  assert.ok(declaring.length > 0, 'ctaEyebrow has gone from the schemas');
  assert.ok(!PREVIEW_ROUTE.includes('doc.ctaEyebrow'));
  assert.equal(overlayControlsForPath('ctaEyebrow').length, 0);
});

test('finalCtaHeadline is deliberately absent: no registered page declares it', () => {
  // The preview route coalesces it, which is starter inheritance rather than a
  // field anybody here can edit.
  const declaring = PAGE_TYPES.filter((type) =>
    topLevelFields(sources.get(type)!).includes('finalCtaHeadline'),
  );
  assert.deepEqual(declaring, []);
  assert.equal(overlayControlsForPath('finalCtaHeadline').length, 0);
});

test('there is no band colour to offer: no page declares a surface field', () => {
  // The reason this layer has no colour card. If one of these ever appears, the
  // decision about whether an editor may set it has to be made on purpose.
  for (const type of PAGE_TYPES) {
    const fields = topLevelFields(sources.get(type)!);
    for (const banned of ['background', 'backgroundColor', 'tone', 'surface', 'theme']) {
      assert.ok(!fields.includes(banned), `${type} now declares '${banned}'`);
    }
  }
});

test('there is no accent word to pick: no page feeds splitScriptAccent', () => {
  // SectionHeading has a `.font-script` branch, but Hero declares no
  // `scriptAccent` prop and no page schema declares the field, so nothing can
  // reach it. A pick-a-word control would promise a flourish nothing draws.
  for (const type of PAGE_TYPES) {
    const fields = topLevelFields(sources.get(type)!);
    assert.ok(!fields.includes('scriptAccent'), `${type} now declares 'scriptAccent'`);
    assert.ok(!fields.includes('heroScriptAccent'), `${type} now declares 'heroScriptAccent'`);
  }
  assert.ok(!HERO.includes('scriptAccent'), 'Hero.astro now takes a scriptAccent prop');
});

test('heroItalicWord is APPENDED, not matched inside the headline', () => {
  // Why it gets a plain text card rather than a pick-a-word picker: Hero writes
  // the headline, then a space, then the word in italics. It is a suffix.
  assert.ok(
    HERO.includes('{headline}{headlineItalicSuffix && <>{\' \'}<em class="italic">'),
    'Hero no longer appends the italic word; re-decide what control it gets',
  );
});

// =============================================================================
// The lookups
// =============================================================================

test('overlayControlsForPath offers the text card on a registry field', () => {
  assert.deepEqual(overlayControlsForPath('heroHeadline'), ['text']);
  assert.deepEqual(overlayControlsForPath('ctaLabel'), ['text']);
  assert.deepEqual(overlayControlsForPath('heroItalicWord'), ['text']);
});

test('overlayControlsForPath leaves everything else to the host overlay', () => {
  assert.deepEqual(overlayControlsForPath('seoTitle'), []);
  assert.deepEqual(overlayControlsForPath('heroImages'), []);
  assert.deepEqual(overlayControlsForPath('processSteps[_key=="a"].title'), []);
  assert.deepEqual(overlayControlsForPath('hero.heroHeadline'), []);
  assert.deepEqual(overlayControlsForPath(''), []);
  assert.deepEqual(overlayControlsForPath(undefined), []);
});

test('never offers two controls on one element, which would stack them', () => {
  for (const line of EDITABLE_LINES) {
    assert.equal(overlayControlsForPath(line.name).length, 1);
  }
});

test('resolveTextTarget points the card at the field and seeds it', () => {
  const doc = { _type: 'homePage', heroHeadline: 'Made just for you' };
  assert.deepEqual(resolveTextTarget(doc, 'heroHeadline'), {
    path: ['heroHeadline'],
    text: 'Made just for you',
    label: 'Headline',
    rows: 2,
  });
});

test('resolveTextTarget refuses a field this page type does not carry', () => {
  // The per-instance gate. Only the home page has a word to slant.
  assert.ok(resolveTextTarget({ _type: 'homePage', heroItalicWord: 'you' }, 'heroItalicWord'));
  assert.equal(
    resolveTextTarget({ _type: 'aboutPage', heroItalicWord: 'you' }, 'heroItalicWord'),
    null,
  );
  assert.equal(resolveTextTarget({ _type: 'notFoundPage' }, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({ _type: 'homePage' }, 'headline'), null);
});

test('resolveTextTarget refuses a document it cannot identify', () => {
  assert.equal(resolveTextTarget(null, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({}, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({ _type: 'homePage' }, 'nothingLikeThis'), null);
});

test('an empty field opens an empty box rather than refusing', () => {
  // A page that has never had a banner headline typed into it is exactly when
  // the card is most useful.
  assert.deepEqual(resolveTextTarget({ _type: 'aboutPage' }, 'ctaHeadline')?.text, '');
});

test('never lets a stega payload into the box', () => {
  const doc = { _type: 'homePage', heroHeadline: encoded('Made just for you') };
  assert.equal(resolveTextTarget(doc, 'heroHeadline')?.text, 'Made just for you');
  assert.equal(cleanLine(encoded('Ask')), 'Ask');
  assert.equal(cleanLine(undefined), '');
  assert.equal(cleanLine(42), '');
});
