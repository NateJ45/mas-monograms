// Unit tests for the pure halves of scripts/audit-studio.mjs (the parts that
// need no dataset): which schema files it reads, which strings it treats as
// editor-facing, and the banned words. Importing the script does not run it:
// main() only runs when the file is executed directly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JARGON, editorStrings, registeredFiles } from '../audit-studio.mjs';

const banned = (text) => JARGON.find((j) => j.re.test(text))?.why ?? null;

test('registeredFiles reads the relative imports of an index file', () => {
  const src = `import { a } from './homePage';\nimport { b } from 'sanity';\nimport { c } from './_copy';`;
  assert.deepEqual(registeredFiles(src), ['homePage.ts', '_copy.ts']);
});

test('editorStrings finds titles, descriptions and validation messages', () => {
  const src = [
    "  title: 'Headline',",
    '  description: "The big heading",',
    "  validation: (R) => R.required().error('Please type a headline.'),",
    "  name: 'heroHeadline',",
  ].join('\n');
  const texts = editorStrings(src).map((s) => s.text);
  assert.deepEqual(texts.sort(), ['Headline', 'Please type a headline.', 'The big heading'].sort());
});

test('the banned words catch what she should never read', () => {
  assert.equal(banned('Google & sharing — rarely needed'), 'em-dash');
  assert.equal(banned('Use <em> syntax for italic'), 'HTML tag');
  assert.equal(banned('The URL slug for this page'), '"slug"');
  assert.equal(banned('Name field label'), '"field"');
  assert.equal(banned('Used in JSON-LD'), 'tech word');
  assert.equal(banned('Words on the banner button'), null);
  assert.equal(banned('Describe the photo in a few words'), null);
});
