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
  // 22 Heirloom Coast tokens + 11 Direction D tokens (2026-10-04).
  assert.ok(Object.keys(tokens).length >= 33, `only ${Object.keys(tokens).length} hex tokens read`);
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

// =============================================================================
// Direction D, "The Atelier" (2026-10-04)
// =============================================================================
// New grounds: Midnight (the drench) and Midnight raised (a panel on it), plus
// three light fabric grounds for swatch cards and hang tags (Paper, Kraft,
// Blush, Sage). Dark grounds re-point the text tokens inside .surface-midnight /
// .surface-indigo / .on-dark (globals.css "Ground contexts"); every pair those
// contexts actually put on screen is asserted here. Deliberately NOT asserted:
//   --color-gold-deep (#a9772a) - the shadow stop of the thread-gold gradient
//     and the thread strokes, 4.41:1 on Midnight. DECORATIVE ONLY, never text.
//   --color-gold-script / --color-gold on Linen - gold is a dark-ground colour.

const DARK_GROUNDS = ['color-midnight', 'color-midnight-raised'];
const ALL_DARK_GROUNDS = [...DARK_GROUNDS, 'color-primary', 'color-primary-dark'];

test('Direction D tokens are declared in @theme', () => {
  for (const name of [
    'color-midnight',
    'color-midnight-raised',
    'color-paper',
    'color-on-dark-muted',
    'color-gold-light',
    'color-gold',
    'color-gold-deep',
    'color-kraft',
    'color-blush',
    'color-sage',
    'color-border-on-dark',
  ]) {
    token(name);
  }
});

test('the context overrides never redeclare a --color-* token with a raw hex', () => {
  // readTokens() keeps the LAST hex it finds for each name. A dark context that
  // wrote `--color-text-secondary: #c8c0b0` would silently replace the light
  // value this file asserts on Linen. Overrides must go through var().
  const css = readFileSync(CSS, 'utf8');
  const seen = new Map<string, number>();
  for (const m of css.matchAll(/--(color-[a-z0-9-]+)\s*:\s*#[0-9a-fA-F]{3,8}\s*;/g)) {
    seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
  }
  const dupes = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
  assert.deepEqual(dupes, [], `hex declared more than once: ${dupes.join(', ')}`);
});

// Light text the dark contexts put on screen: --foreground is Linen, cards are
// Paper-on-raised, secondary/tertiary/muted text all map to --color-on-dark-muted,
// links and swash words are gold-light, brass text maps to gold.
const ON_DARK_TEXT = [
  'color-bg',
  'color-paper',
  'color-white-pure',
  'color-on-dark-muted',
  'color-gold-light',
];
for (const bg of ALL_DARK_GROUNDS) {
  for (const fg of ON_DARK_TEXT) {
    test(`--${fg} on dark ground --${bg} meets AA body text`, () => {
      const ratio = contrastRatio(token(fg), token(bg));
      assert.ok(
        ratio >= AA_BODY_TEXT,
        `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
      );
    });
  }
}

// Gold (the eyebrow and brass-text colour in a dark context) at body size on
// Midnight and the raised panel; on Indigo it is held to the large-text bar
// only (see the gold-script tests above: same hex).
for (const bg of DARK_GROUNDS) {
  test(`--color-gold on --${bg} meets AA body text (dark-context eyebrows)`, () => {
    const ratio = contrastRatio(token('color-gold'), token(bg));
    assert.ok(ratio >= AA_BODY_TEXT, `gold on --${bg} is ${ratio}:1`);
  });
}

// Buttons. The primary button on a dark ground is Paper with Ink type, and its
// hover/focus fill is gold-light with Midnight type. On light it is Claret with
// white (asserted above under REVERSED).
const BUTTON_PAIRS: Array<[string, string]> = [
  ['color-accent', 'color-paper'], // Ink on the paper button
  ['color-midnight', 'color-gold-light'], // Midnight on the gold fill
  ['color-accent', 'color-gold-light'],
  ['color-midnight', 'color-bg'], // secondary-on-dark fill: Midnight on Linen
];
for (const [fg, bg] of BUTTON_PAIRS) {
  test(`button pair --${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(ratio >= AA_BODY_TEXT, `--${fg} on --${bg} is ${ratio}:1`);
  });
}

// Light fabric grounds (SwatchCard tones, HangTag kraft/paper). Ink and the
// secondary text token sit on all of them; Claret display text on Kraft and
// Blush. Brass text is NOT allowed on Kraft (3.98:1) and is left out on purpose.
const FABRIC_TEXT: Array<[string, string]> = [
  ['color-accent', 'color-paper'],
  ['color-text-secondary', 'color-paper'],
  ['color-text-tertiary', 'color-paper'],
  ['color-brass-text', 'color-paper'],
  ['color-rust-decorative', 'color-paper'],
  ['color-primary', 'color-paper'],
  ['color-accent', 'color-kraft'],
  ['color-text-secondary', 'color-kraft'],
  ['color-rust-decorative', 'color-kraft'],
  ['color-accent', 'color-blush'],
  ['color-text-secondary', 'color-blush'],
  ['color-rust-decorative', 'color-blush'],
  ['color-accent', 'color-sage'],
  ['color-text-secondary', 'color-sage'],
];
for (const [fg, bg] of FABRIC_TEXT) {
  test(`fabric ground: --${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// Non-text on dark: gold-light is the focus ring (and the swash colour) on
// every dark ground; --color-border-on-dark is a form field's edge there.
const NON_TEXT_DARK: Array<[string, string]> = [
  ...ALL_DARK_GROUNDS.map((bg): [string, string] => ['color-gold-light', bg]),
  ['color-border-on-dark', 'color-midnight'],
  ['color-border-on-dark', 'color-midnight-raised'],
  ['color-primary', 'color-paper'], // the light focus ring on a Paper card
];
for (const [fg, bg] of NON_TEXT_DARK) {
  test(`--${fg} on --${bg} meets the AA non-text threshold (focus ring / field edge)`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(ratio >= AA_NON_TEXT, `--${fg} on --${bg} is ${ratio}:1, needs ${AA_NON_TEXT}:1`);
  });
}

test('gold-deep stays decorative: it is NOT body-text safe on Midnight', () => {
  // A tripwire, not a gate: if someone darkens Midnight or lightens gold-deep
  // until this passes AA, the "decorative only" rule in globals.css should be
  // revisited deliberately rather than drift into use as text.
  const ratio = contrastRatio(token('color-gold-deep'), token('color-midnight'));
  assert.ok(ratio < AA_BODY_TEXT, `gold-deep on Midnight is now ${ratio}:1`);
});
