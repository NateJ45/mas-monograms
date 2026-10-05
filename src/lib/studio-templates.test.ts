// =============================================================================
// "+ New" starting points: every template matches the schema it fills
// =============================================================================
// Pattern from ReidDesignAstro/reid-design-site src/lib/templates.test.ts,
// adapted for bare Node: the schema is read as TEXT (importing it would pull in
// Sanity and React), the same way src/lib/page-fields.test.ts reads it.
//
// A template is plain data, so nothing checks it until Mary Ann clicks it. A
// renamed field would give her a new photo with an "Unknown field found" box
// on day one, which is exactly the kind of scary thing this Studio promises not
// to show her.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { STARTING_TEMPLATES } from '../sanity/templates.ts';
import { BRACKETS_LEFT, bracketsLeft } from '../sanity/schemaTypes/_copy.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

/** The top-level field names a schema file declares (4-space indent). */
function topLevelFields(source: string): Set<string> {
  const inline = [...source.matchAll(/^ {4}defineField\(\{ name: '(\w+)'/gm)].map((m) => m[1]);
  const wrapped = [...source.matchAll(/^ {4}defineField\(\{\n {6}name: '(\w+)',/gm)].map(
    (m) => m[1],
  );
  return new Set([...inline, ...wrapped]);
}

/** Boxes she types words into, as opposed to choices. */
const FREE_TEXT = new Set(['name', 'description', 'question', 'title']);

const valueOf = (t: (typeof STARTING_TEMPLATES)[number]): Record<string, unknown> =>
  (typeof t.value === 'function' ? (t.value as () => unknown)() : t.value) as Record<
    string,
    unknown
  >;

test('templates have unique ids and target registered document types', () => {
  const ids = STARTING_TEMPLATES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  const index = read('../sanity/schemaTypes/index.ts');
  for (const t of STARTING_TEMPLATES) {
    assert.ok(
      index.includes(`from './${t.schemaType}'`),
      `${t.id}: ${t.schemaType} is not registered`,
    );
    assert.match(read(`../sanity/schemaTypes/${t.schemaType}.ts`), /type: 'document'/);
  }
});

test('templates only set boxes the document actually has', () => {
  for (const t of STARTING_TEMPLATES) {
    const fields = topLevelFields(read(`../sanity/schemaTypes/${t.schemaType}.ts`));
    assert.ok(fields.size > 3, `${t.schemaType}: the parser found its fields`);
    for (const key of Object.keys(valueOf(t))) {
      assert.ok(fields.has(key), `${t.id}.${key} is not a field of ${t.schemaType}`);
    }
  }
});

test('the three jobs she does most each have a starting point', () => {
  const byType = new Map(STARTING_TEMPLATES.map((t) => [t.schemaType, t]));
  assert.equal(byType.get('galleryItem')?.id, 'new-photo');
  assert.equal(byType.get('clearanceItem')?.id, 'new-clearance-item');
  assert.equal(byType.get('faqItem')?.id, 'new-question');
});

test('free-text prompts are bracketed, in her voice, with no em-dashes', () => {
  const text = JSON.stringify(STARTING_TEMPLATES.map(valueOf));
  assert.ok(!text.includes('—'), 'a template contains an em-dash');
  for (const t of STARTING_TEMPLATES) {
    for (const [key, value] of Object.entries(valueOf(t))) {
      // The free-text boxes. Choices (hoopFit: 'good') are values, not prompts.
      if (typeof value === 'string' && FREE_TEXT.has(key)) {
        assert.match(value, /^\[.+\]$/, `${t.id}.${key} should be a [bracketed prompt]`);
      }
    }
  }
  for (const banned of ['curated', 'elevated', 'bespoke', 'seamless', 'lorem']) {
    assert.ok(!text.toLowerCase().includes(banned), `templates say "${banned}"`);
  }
});

test('a new photo never starts with a picture or words inside it', () => {
  const photo = valueOf(STARTING_TEMPLATES.find((t) => t.id === 'new-photo')!);
  assert.equal(photo.image, undefined);
  assert.equal(photo.hoopFit, 'good');
});

test('a new question shows somewhere straight away', () => {
  const q = valueOf(STARTING_TEMPLATES.find((t) => t.id === 'new-question')!);
  assert.ok(q.showOnHowItWorks === true || q.showOnPricing === true);
});

test('a prompt left in a box is caught before Publish, gently', () => {
  assert.equal(bracketsLeft('[What it is]'), BRACKETS_LEFT);
  assert.equal(bracketsLeft('Set of 4 napkins, JKL'), true);
  assert.equal(bracketsLeft(undefined), true);
  const answer = valueOf(STARTING_TEMPLATES.find((t) => t.id === 'new-question')!).answer;
  assert.equal(bracketsLeft(answer), BRACKETS_LEFT);
  assert.equal(
    bracketsLeft([{ _type: 'block', children: [{ _type: 'span', text: 'A real answer.' }] }]),
    true,
  );
});
