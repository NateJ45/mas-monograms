// =============================================================================
// Mary Ann's Studio: her panes' colours, and the larger type
// =============================================================================
// The Heirloom Coast colours her own panes paint with (src/sanity/theme.ts:
// the Site Guide's handbook, the QR tool, the brand kit) checked with real WCAG
// maths (src/lib/contrast.ts), and the type ramp that goes into the Studio
// theme (src/sanity/readableTheme.ts). The kit's own theme has its own gate,
// studio-theme.test.ts (PORTABLE).
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AA_BODY_TEXT, AA_NON_TEXT, contrastRatio } from './contrast.ts';
import {
  HEIRLOOM,
  HEADING_SCALE,
  TEXT_SCALE,
  readableFontConfig,
  scaleSize,
} from '../sanity/theme.ts';

test('text colours read at AA on every surface her panes use', () => {
  const pairs: Array<[string, string, string]> = [
    ['ink on paper', HEIRLOOM.ink, HEIRLOOM.paper],
    ['ink on linen', HEIRLOOM.ink, HEIRLOOM.linen],
    ['taupe on paper', HEIRLOOM.taupe, HEIRLOOM.paper],
    ['taupe on linen', HEIRLOOM.taupe, HEIRLOOM.linen],
    ['indigo links on paper', HEIRLOOM.indigo, HEIRLOOM.paper],
    ['paper on indigo', HEIRLOOM.paper, HEIRLOOM.indigo],
    ['paper on the claret button', HEIRLOOM.paper, HEIRLOOM.claret],
    ['brass warning text on paper', HEIRLOOM.brassText, HEIRLOOM.paper],
    ['danger text on paper', HEIRLOOM.danger, HEIRLOOM.paper],
    ['paper on the success colour', HEIRLOOM.paper, HEIRLOOM.success],
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

const size = (fontSize: number, lineHeight: number) => ({
  fontSize,
  lineHeight,
  ascenderHeight: 5,
  descenderHeight: 5,
  iconSize: 21,
  letterSpacing: 0,
});

const SAMPLE = {
  text: { family: 'Inter', sizes: [size(13, 19), size(15, 23)] },
  label: { family: 'Inter', sizes: [size(9.5, 11)] },
  heading: {
    family: 'Inter',
    sizes: [size(21, 29)],
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  code: { family: 'mono', sizes: [] },
};
const FONTS = { display: '"Fraunces Variable", serif', body: '"Mulish Variable", sans-serif' };

test('the type is scaled up: list text about 16px, box text 18px', () => {
  const out = readableFontConfig(SAMPLE, FONTS);
  assert.equal(out.text.sizes[0].fontSize, 15.5); // 13 x 1.2
  assert.equal(out.text.sizes[1].fontSize, 18); // 15 x 1.2
  assert.equal(out.heading.sizes[0].fontSize, 23); // 21 x 1.1
  assert.ok(TEXT_SCALE > 1 && HEADING_SCALE > 1);
});

test('the brand families go in, and everything else is kept', () => {
  const out = readableFontConfig(SAMPLE, FONTS);
  assert.equal(out.text.family, FONTS.body);
  assert.equal(out.label.family, FONTS.body);
  assert.equal(out.heading.family, FONTS.display);
  assert.deepEqual(out.code, SAMPLE.code);
});

test('a one-weight display face is never asked for a faked bold', () => {
  const out = readableFontConfig(SAMPLE, FONTS, 400);
  assert.deepEqual(Object.values(out.heading.weights ?? {}), [400, 400, 400, 400]);
  const variable = readableFontConfig(SAMPLE, FONTS, null);
  assert.equal(variable.heading.weights?.bold, 700);
});

test('the input is never changed in place', () => {
  readableFontConfig(SAMPLE, FONTS, 400);
  assert.equal(SAMPLE.text.sizes[0].fontSize, 13);
  assert.equal(SAMPLE.text.family, 'Inter');
  assert.equal(SAMPLE.heading.weights.bold, 700);
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
