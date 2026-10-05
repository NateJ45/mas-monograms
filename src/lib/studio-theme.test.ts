// =============================================================================
// Mary Ann's Studio theme: real contrast maths, and the larger type
// =============================================================================
// The Heirloom Coast Studio colours (src/sanity/theme.ts) checked with the same
// WCAG maths the site's own token gate uses (src/lib/contrast.ts), rather than
// by eye. And the type ramp: bigger, never smaller, never mutated in place.
// (2026-10-05, Phase A of docs/superpowers/specs/2026-10-05-studio-direction.md.)
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AA_BODY_TEXT, AA_NON_TEXT, contrastRatio } from './contrast.ts';
import { HEIRLOOM, HEADING_SCALE, TEXT_SCALE, readableFonts, scaleSize } from '../sanity/theme.ts';

test('text colours read at AA on every Studio surface', () => {
  const pairs: Array<[string, string, string]> = [
    ['ink on paper', HEIRLOOM.ink, HEIRLOOM.paper],
    ['ink on linen', HEIRLOOM.ink, HEIRLOOM.linen],
    ['taupe on paper', HEIRLOOM.taupe, HEIRLOOM.paper],
    ['taupe on linen', HEIRLOOM.taupe, HEIRLOOM.linen],
    ['indigo links on paper', HEIRLOOM.indigo, HEIRLOOM.paper],
    ['paper on the indigo navbar', HEIRLOOM.paper, HEIRLOOM.indigo],
    ['paper on the claret Publish button', HEIRLOOM.paper, HEIRLOOM.claret],
    ['brass warning text on paper', HEIRLOOM.brassText, HEIRLOOM.paper],
    ['danger text on paper', HEIRLOOM.danger, HEIRLOOM.paper],
    ['paper on the success button', HEIRLOOM.paper, HEIRLOOM.success],
  ];
  for (const [name, fg, bg] of pairs) {
    const ratio = contrastRatio(fg, bg);
    assert.ok(ratio >= AA_BODY_TEXT, `${name}: ${ratio.toFixed(2)} < ${AA_BODY_TEXT}`);
  }
});

test('the focus ring and the chip ring are visible against their grounds', () => {
  assert.ok(contrastRatio(HEIRLOOM.indigo, HEIRLOOM.paper) >= AA_NON_TEXT);
  assert.ok(contrastRatio(HEIRLOOM.claret, HEIRLOOM.linen) >= AA_NON_TEXT);
});

const SAMPLE = {
  fonts: {
    text: {
      family: 'Inter',
      sizes: [
        { fontSize: 13, lineHeight: 19, ascenderHeight: 5, descenderHeight: 5, iconSize: 21 },
        { fontSize: 15, lineHeight: 23, ascenderHeight: 6, descenderHeight: 6, iconSize: 25 },
      ],
    },
    label: {
      family: 'Inter',
      sizes: [
        { fontSize: 9.5, lineHeight: 11, ascenderHeight: 2, descenderHeight: 2, iconSize: 15 },
      ],
    },
    heading: {
      family: 'Inter',
      sizes: [
        { fontSize: 21, lineHeight: 29, ascenderHeight: 7, descenderHeight: 7, iconSize: 33 },
      ],
    },
    code: { family: 'mono', sizes: [] },
  },
  color: { keep: true },
};

test('the type is scaled up: list text about 16px, box text 18px', () => {
  const out = readableFonts(SAMPLE);
  assert.equal(out.fonts.text.sizes[0].fontSize, 15.5); // 13 x 1.2
  assert.equal(out.fonts.text.sizes[1].fontSize, 18); // 15 x 1.2
  assert.equal(out.fonts.heading.sizes[0].fontSize, 23); // 21 x 1.1
  assert.ok(TEXT_SCALE > 1 && HEADING_SCALE > 1);
});

test('the interface is the system sans and everything else is kept', () => {
  const out = readableFonts(SAMPLE);
  assert.match(out.fonts.text.family, /^system-ui/);
  assert.match(out.fonts.label.family, /^system-ui/);
  assert.deepEqual(out.fonts.code, SAMPLE.fonts.code);
  assert.deepEqual(out.color, SAMPLE.color);
});

test('the input theme is never changed in place', () => {
  readableFonts(SAMPLE);
  assert.equal(SAMPLE.fonts.text.sizes[0].fontSize, 13);
  assert.equal(SAMPLE.fonts.text.family, 'Inter');
});

test('every measurement of a size step scales together', () => {
  const s = scaleSize(
    { fontSize: 10, lineHeight: 15, ascenderHeight: 4, descenderHeight: 4, iconSize: 17 },
    1.2,
  );
  assert.deepEqual(
    [s.fontSize, s.lineHeight, s.ascenderHeight, s.descenderHeight, s.iconSize],
    [12, 18, 5, 5, 20.5],
  );
});
