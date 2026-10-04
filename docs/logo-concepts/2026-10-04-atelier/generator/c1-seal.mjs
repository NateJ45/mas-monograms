// Concept 1: "The Hoop Seal". The threaded MAS cypher (a script S sewn through a roman M and A,
// over and under like a thread) inside a pair of embroidery hoops with their tension clasp,
// ring lettering and a running-stitch border.
import { outline, C, r, arcText } from './lib.mjs';
import { svgOpen, goldGrad, satin, stitchCircle } from './common.mjs';
import { threadedCypher } from './cypher.mjs';

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
let G;
function glyphs() {
  if (G) return G;
  G = outline([
    {
      id: 'top',
      font: RO,
      axes: { wght: 520, opsz: 24, SOFT: 0, WONK: 0 },
      text: 'MAS MONOGRAMS',
      size: 27,
      tracking: 260,
    },
    {
      id: 'bot',
      font: RO,
      axes: { wght: 520, opsz: 24, SOFT: 0, WONK: 0 },
      text: 'ST. MATTHEWS, SOUTH CAROLINA',
      size: 17,
      tracking: 240,
    },
    {
      id: 'word',
      font: RO,
      axes: { wght: 440, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MAS MONOGRAMS',
      size: 50,
      tracking: 90,
    },
    {
      id: 'place',
      font: RO,
      axes: { wght: 560, opsz: 12, SOFT: 0, WONK: 0 },
      text: 'ST. MATTHEWS, SOUTH CAROLINA',
      size: 12.5,
      tracking: 250,
    },
  ]);
  return G;
}

// A pair of hoops (outer + inner ring) with the tension clasp at 12 o'clock: two tabs,
// the screw running through them and a round thumb knob, drawn in the hoop's own colour.
function hoop({ cx, cy, R, w1, w2, gapR, color, clasp, ground }) {
  const t = w1; // unit
  const top = cy - R - w1 / 2;
  const tabW = t * 0.95,
    tabH = t * 2.0,
    tabGap = t * 0.7;
  const yTab = top - tabH + t * 0.5;
  const screwY = yTab + tabH * 0.42;
  return `
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${color}" stroke-width="${w1}"/>
  <circle cx="${cx}" cy="${cy}" r="${r(R - gapR)}" fill="none" stroke="${color}" stroke-width="${w2}"/>
  <g>
    <rect x="${r(cx - tabGap / 2 - tabW - t * 0.35)}" y="${r(yTab - t * 0.35)}" width="${r(tabW * 2 + tabGap + t * 0.7)}" height="${r(tabH + t * 0.35)}" fill="${ground}"/>
    <rect x="${r(cx - tabGap / 2 - tabW)}" y="${r(yTab)}" width="${r(tabW)}" height="${r(tabH)}" rx="${r(t * 0.18)}" fill="${clasp}"/>
    <rect x="${r(cx + tabGap / 2)}" y="${r(yTab)}" width="${r(tabW)}" height="${r(tabH)}" rx="${r(t * 0.18)}" fill="${clasp}"/>
    <rect x="${r(cx - tabGap / 2 - tabW - t * 0.55)}" y="${r(screwY - t * 0.17)}" width="${r(tabW * 2 + tabGap + t * 1.4)}" height="${r(t * 0.34)}" rx="${r(t * 0.17)}" fill="${clasp}"/>
    <circle cx="${r(cx + tabGap / 2 + tabW + t * 1.15)}" cy="${r(screwY)}" r="${r(t * 0.62)}" fill="${clasp}"/>
  </g>`;
}

const pal = (dark) =>
  dark
    ? {
        ground: C.midnight,
        ring: 'url(#P-gold)',
        clasp: 'url(#P-goldv)',
        letters: C.linen,
        thread: 'url(#P-goldd)',
        text: C.linen,
        stitch: C.gold,
        knot: C.goldLight,
        satT: { light: '#fff8e0', dark: '#5a3d0c', hi: 0.42, lo: 0.42 },
        satL: null,
      }
    : {
        ground: C.linen,
        ring: C.midnight,
        clasp: C.brassDeco,
        letters: C.midnight,
        thread: C.claret,
        text: C.midnight,
        stitch: C.claret,
        knot: C.claret,
        satT: { light: '#ffe9e0', dark: '#3a0e08', hi: 0.3, lo: 0.35 },
        satL: null,
      };

function defsFor(P, k, pitch) {
  return `${goldGrad('P-gold', 90)}${goldGrad('P-goldv', 0)}${goldGrad('P-goldd', 35)}${satin('P-satT', { pitch, angle: -38, ...k.satT })}`;
}

export function seal({ dark = false, id = 'c1' } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const cx = 300,
    cy = 328;
  const cyph = threadedCypher(id, {
    cx: cx - 4,
    cy: cy + 4,
    h: 272,
    letters: k.letters,
    thread: fix(k.thread),
    satinThread: `${id}-satT`,
    gap: 7,
  });
  return fix(`${svgOpen(600, 616, 'MAS Monograms')}
  <defs>${defsFor(id, k, 4.2)}${cyph.defs}</defs>
  ${hoop({ cx, cy, R: 272, w1: 11, w2: 5, gapR: 15, color: k.ring, clasp: k.clasp, ground: k.ground })}
  <g fill="${k.text}">${arcText(g.top, cx, cy, 222, 0)}${arcText(g.bot, cx, cy, 236, 180, { inside: true })}</g>
  <g fill="${k.knot}"><circle cx="${cx - 229}" cy="${cy}" r="4"/><circle cx="${cx + 229}" cy="${cy}" r="4"/></g>
  ${stitchCircle(cx, cy, 200, { dash: 10, gap: 7, w: 2.2, color: k.stitch })}
  ${cyph.body}
</svg>`);
}

export function sealMark({ dark = false, id = 'c1m', bold = true } = {}) {
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const cx = 100,
    cy = 110;
  const cyph = threadedCypher(id, {
    cx: cx - 2,
    cy: cy + 2,
    h: 116,
    letters: k.letters,
    thread: fix(k.thread),
    satinThread: `${id}-satT`,
    wght: bold ? 560 : 400,
    gap: 5.5,
  });
  return fix(`${svgOpen(200, 200, 'MAS Monograms')}
  <defs>${defsFor(id, k, 6)}${cyph.defs}</defs>
  ${hoop({ cx, cy, R: 84, w1: 7, w2: 3.2, gapR: 9.5, color: k.ring, clasp: k.clasp, ground: k.ground })}
  ${cyph.body}
</svg>`);
}

// Horizontal header lockup: the mark, then the wordmark in tracked Fraunces caps over a place line.
export function sealLockup({ dark = false, id = 'c1h', place = true } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const cx = 62,
    cy = 66;
  const cyph = threadedCypher(id, {
    cx: cx - 1,
    cy: cy + 2,
    h: 62,
    letters: k.letters,
    thread: fix(k.thread),
    satinThread: null,
    wght: 560,
    gap: 5.5,
  });
  const wx = 140;
  return fix(`${svgOpen(wx + g.word.width + 4, 124, 'MAS Monograms')}
  <defs>${defsFor(id, k, 6)}${cyph.defs}</defs>
  ${hoop({ cx, cy, R: 50, w1: 5, w2: 2.2, gapR: 6.5, color: k.ring, clasp: k.clasp, ground: k.ground })}
  ${cyph.body}
  <path transform="translate(${wx} ${place ? 75 : 84})" d="${g.word.d}" fill="${k.text}"/>
  ${place ? '' : '<!--'}<path transform="translate(${r(wx + (g.word.width - g.place.width) / 2)} 96)" d="${g.place.d}" fill="${dark ? C.gold : C.claret}"/>${place ? '' : '-->'}
</svg>`);
}
