// Theme-token contrast gate (added 2026-08-27 alongside src/lib/contrast.ts;
// PORTS.md card 9 in ncs-astro-sanity-starter). Site-local: the pair list below
// encodes Heirloom Coast, not the starter's palette, so this file is deliberately
// NOT marked PORTABLE — only contrast.ts is shared.
//
// WHY: the Heirloom Coast palette lives as hand-written hex in the @theme block
// of globals.css, with the measured ratio for each token in a trailing comment.
// Those comments are the only thing holding the palette accountable, and a
// comment cannot fail a build. Nothing else in the gate chain catches a token
// that drifts under 4.5:1 either: axe audits the resting DOM of a built page and
// has no rule for token pairs, and Lighthouse sat at 100 in the WCP repo while a
// focus ring was invisible. This test reads the REAL hex out of globals.css and
// asserts the pairs the design system actually puts on screen, so an edit to the
// palette (or a future `npm run apply-brand` run) fails `npm test` before anyone
// looks at a screenshot.
//
// SCOPE: the @theme block only, which is the whole brand palette here — this
// project has NO dark mode by decision (see CLAUDE.md), so there is no second
// resting DOM to check. The shadcn :root tokens are oklch aliases that resolve
// back to these same hex values through @theme inline.
//
// DELIBERATELY NOT ASSERTED, because they would be asserted at the wrong
// threshold and the failure would teach the wrong lesson:
//   --color-secondary (#b98a3e Brass Decorative, 2.69:1 on Linen) - hoop-ring
//     frames and hairline rules. globals.css already says DECORATIVE ONLY. If it
//     ever becomes text or a control edge, add it here with AA_NON_TEXT and it
//     will fail, which is the point.
//   --color-border-soft (1.34:1 on Linen) and --color-error-border - faint
//     dividers and an alert hairline, not component boundaries.
//   --color-gold-script on Linen (1.75:1) - the palette forbids exactly this
//     pairing; the gold kicker is asserted below on its real indigo/ink grounds.
//
// Any token that becomes a FOCUS RING or the visible edge of a control must be
// added here with AA_NON_TEXT.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contrastRatio,
  hexToRgb,
  relativeLuminance,
  flatten,
  rgbToHex,
  AA_BODY_TEXT,
  AA_LARGE_TEXT,
  AA_NON_TEXT,
} from './contrast.ts';

const CSS = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles', 'globals.css');

/** Pull the hex `--color-*` declarations out of globals.css (all 22 live in @theme). */
function readTokens(): Record<string, string> {
  const css = readFileSync(CSS, 'utf8');
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/--(color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const tokens = readTokens();

/** Read a token, failing loudly rather than silently skipping a pair. */
function token(name: string): string {
  const value = tokens[name];
  assert.ok(value, `globals.css @theme is missing --${name}`);
  return value;
}

test('the @theme palette was actually found', () => {
  // Guards the regex itself: if globals.css is restructured so the hex tokens
  // stop matching, every pair below would silently pass on an empty map.
  assert.ok(Object.keys(tokens).length >= 20, `only ${Object.keys(tokens).length} hex tokens read`);
});

test('contrast math matches the WCAG reference points', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
  // Shorthand hex expands.
  assert.equal(contrastRatio('#fff', '#000'), 21);
  // Luminance is symmetric in the ratio, order must not matter.
  assert.equal(contrastRatio('#26312e', '#f4eee3'), contrastRatio('#f4eee3', '#26312e'));
  assert.throws(() => hexToRgb('not-a-colour'));
  assert.ok(relativeLuminance(hexToRgb('#ffffff')) > relativeLuminance(hexToRgb('#000000')));
});

test('flatten composites a translucent colour over its backdrop', () => {
  // Not used by the pairs below (this palette is fully opaque), but the helper is
  // shared and a broken flatten() would make a future alpha token pass wrongly.
  const composited = flatten(hexToRgb('#ffffff'), 0.12, hexToRgb('#000000'));
  assert.equal(rgbToHex(composited), '#1f1f1f');
  assert.deepEqual(flatten(hexToRgb('#26312e'), 1, hexToRgb('#f4eee3')), hexToRgb('#26312e'));
});

// --- Text on the two light surfaces ----------------------------------------
// Every token this project uses for prose, links, captions or figures, on both
// Linen (--color-bg) and the Sage alternating band (--color-bg-soft). The band
// is the tighter of the two and is the one that actually catches drift.
const TEXT_ON_SURFACE: Array<[string, string]> = [
  ['color-accent', 'color-bg'], // Heirloom Ink - default body + headings
  ['color-accent', 'color-bg-soft'],
  ['color-accent-dark', 'color-bg'],
  ['color-accent-dark', 'color-bg-soft'],
  ['color-primary', 'color-bg'], // Heritage Indigo - links and nav
  ['color-primary', 'color-bg-soft'],
  ['color-primary-dark', 'color-bg'], // Indigo Deep - link hover
  ['color-primary-dark', 'color-bg-soft'],
  ['color-muted-text', 'color-bg'],
  ['color-muted-text', 'color-bg-soft'],
  ['color-text-secondary', 'color-bg'],
  ['color-text-secondary', 'color-bg-soft'],
  ['color-text-tertiary', 'color-bg'], // caption text
  ['color-text-tertiary', 'color-bg-soft'],
  ['color-brass-text', 'color-bg'], // pricing figures + meta
  ['color-brass-text', 'color-bg-soft'],
  ['color-rust-decorative', 'color-bg'], // Claret display text
  ['color-rust-decorative', 'color-bg-soft'],
  ['color-error-text', 'color-bg'], // required asterisks + field errors
  ['color-error-text', 'color-error-surface'], // the same copy inside the alert wash
];

for (const [fg, bg] of TEXT_ON_SURFACE) {
  test(`--${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// --- Reversed out of the drench surfaces -----------------------------------
// Direction C (2026-07-03) turned Heritage Indigo into a full-bleed surface (home
// hero band, bottom CTA band) carrying Linen/Paper type, and the primary button on
// any dark surface is paper-bg + ink text. Claret is a CTA background with white
// on it. Both the white and the Linen case are asserted: CtaLink and the bands use
// Linen, not pure white, and Linen is the darker of the two.
const REVERSED: Array<[string, string]> = [
  ['color-white-pure', 'color-primary'],
  ['color-white-pure', 'color-primary-dark'],
  ['color-white-pure', 'color-accent'],
  ['color-white-pure', 'color-accent-dark'],
  ['color-white-pure', 'color-rust-cta'], // white on the Claret CTA
  ['color-white-pure', 'color-rust-cta-hover'],
  ['color-bg', 'color-primary'], // Linen type on the indigo drench band
  ['color-bg', 'color-primary-dark'],
  ['color-bg', 'color-accent'],
  ['color-bg', 'color-accent-dark'], // the HeroBackground photo scrim
  ['color-bg', 'color-rust-cta'],
];

for (const [fg, bg] of REVERSED) {
  test(`--${fg} reversed out of --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// --- The gold script kicker ------------------------------------------------
// --color-gold-script is allowed on indigo/dark grounds ONLY, and only at the
// ScriptKicker's >=2.75rem clamp floor, so AA_LARGE_TEXT is the honest threshold.
// It clears AA body text on all three today; asserting the large-text bar is what
// the token is licensed for, and the pairing rule is enforced by omitting Linen.
const GOLD_GROUNDS = ['color-primary', 'color-primary-dark', 'color-accent'];

for (const bg of GOLD_GROUNDS) {
  test(`--color-gold-script on --${bg} meets AA large text`, () => {
    const ratio = contrastRatio(token('color-gold-script'), token(bg));
    assert.ok(
      ratio >= AA_LARGE_TEXT,
      `gold script on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_LARGE_TEXT}:1`,
    );
  });
}

// --- Non-text: the only visible affordance a form field has ----------------
// A text input's border IS its affordance, so it is an SC 1.4.11 UI component
// boundary at 3:1, not a decorative hairline. It sits on Linen today and on the
// Sage band wherever a form renders inside an alternating section.
const NON_TEXT: Array<[string, string]> = [
  ['color-border-interactive', 'color-bg'],
  ['color-border-interactive', 'color-bg-soft'],
];

for (const [fg, bg] of NON_TEXT) {
  test(`--${fg} on --${bg} meets the AA non-text threshold`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_NON_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_NON_TEXT}:1`,
    );
  });
}
