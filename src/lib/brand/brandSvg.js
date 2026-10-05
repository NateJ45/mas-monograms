// Composes the MAS Monograms logo system into SVG markup (chosen 2026-10-04; see
// docs/logo-concepts/README.md):
//   sealSvg()      the Hoop Seal: the threaded MAS cypher (a script S sewn over and under a
//                  roman M and A) in a pair of embroidery hoops with their tension clasp.
//                  `ring: true` adds the ring lettering and running-stitch border (the full
//                  seal); `cut` picks the cypher weight for the size it will be seen at.
//   wordmarkSvg()  the Signature Thread: "MAS" roman caps, "Monograms" in the soft italic, and
//                  one thread (running stitch, a loop, the underline, a knot).
// Plain JS so the Astro component (Logo.astro) and the Node scripts (favicons, OG cards,
// public/brand files) share one drawing. Geometry lives in ./brandPaths.js (generated).
//
// Colour: every paint is `var(--logo-*, <fallback>)` when `adaptive` is set, so the logo takes
// its colours from the ground's context tokens (globals.css); otherwise the palette's plain
// hex values are written, which is what standalone files and rasterising need.
// Ids: every id is prefixed with `idp`, so several logos on one page never share a mask.
import { BRAND } from './brandPaths.js';

/** Blue and gold on a light ground (Linen, Paper). */
export const LIGHT = {
  ringA: '#28486B',
  ringB: '#28486B',
  ringC: '#28486B',
  claspA: '#835A24',
  claspB: '#A9772A',
  claspC: '#D9B15F',
  letters: '#0F1B2D',
  threadA: '#835A24',
  threadB: '#A9772A',
  threadC: '#D9B15F',
  text: '#0F1B2D',
  stitch: '#A9772A',
  knot: '#A9772A',
  word: '#0F1B2D',
  swash: '#28486B',
};
/** Gold and linen on a dark ground (Midnight, Indigo). */
export const DARK = {
  ringA: '#A9772A',
  ringB: '#D9B15F',
  ringC: '#F0D58A',
  claspA: '#A9772A',
  claspB: '#D9B15F',
  claspC: '#F0D58A',
  letters: '#F4EEE3',
  threadA: '#A9772A',
  threadB: '#D9B15F',
  threadC: '#F0D58A',
  text: '#F4EEE3',
  stitch: '#D9B15F',
  knot: '#F0D58A',
  word: '#F4EEE3',
  swash: '#F0D58A',
};
const VAR = {
  ringA: '--logo-ring-a',
  ringB: '--logo-ring-b',
  ringC: '--logo-ring-c',
  claspA: '--logo-clasp-a',
  claspB: '--logo-clasp-b',
  claspC: '--logo-clasp-c',
  letters: '--logo-letters',
  threadA: '--logo-thread-a',
  threadB: '--logo-thread-b',
  threadC: '--logo-thread-c',
  text: '--logo-text',
  stitch: '--logo-stitch',
  knot: '--logo-knot',
  word: '--logo-word',
  swash: '--logo-swash',
};

const r = (n) => Math.round(n * 100) / 100;

function painter(palette, adaptive) {
  return (key) => (adaptive ? `var(${VAR[key]},${palette[key]})` : palette[key]);
}

// A five-stop gradient (a, b, c, b, a), the --thread-gold shape. Stop colours go through a
// style attribute so they can read custom properties.
function grad(id, p, a, b, c, angle) {
  const stop = (o, k) => `<stop offset="${o}" style="stop-color:${p(k)}"/>`;
  return (
    `<linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)">` +
    stop(0, a) +
    stop(0.28, b) +
    stop(0.5, c) +
    stop(0.72, b) +
    stop(1, a) +
    '</linearGradient>'
  );
}

// Satin stitch: parallel thread lines, a highlight and a shadow per pitch.
function satin(id, pitch) {
  return (
    `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${pitch}" height="${pitch}" patternTransform="rotate(-38)">` +
    `<rect width="${pitch}" height="${r(pitch * 0.34)}" fill="#fff" fill-opacity=".34"/>` +
    `<rect y="${r(pitch * 0.62)}" width="${pitch}" height="${r(pitch * 0.2)}" fill="#2a1c06" fill-opacity=".38"/></pattern>`
  );
}

// The cypher fitted to a centre and height. Masks cut a gap round each crossing; inside the
// UNDER regions the S goes beneath the M and A instead of over them.
function cypher(idp, cut, { cx, cy, h, p, gap, satinPitch, sStroke = 0 }) {
  const c = BRAND.cypher[cut];
  const [minX, minY, maxX, maxY] = c.box;
  const s = h / (maxY - minY);
  const tx = cx - ((minX + maxX) / 2) * s;
  const ty = cy - ((minY + maxY) / 2) * s;
  const reg = BRAND.cypher.under
    .map((u) => `<circle cx="${u.cx}" cy="${u.cy}" r="${u.r}"/>`)
    .join('');
  const box = 'x="-600" y="-700" width="1800" height="1400"';
  const useM = `<use href="#${idp}-M"/>`;
  const useA = `<use href="#${idp}-A"/>`;
  const useS = `<use href="#${idp}-S"/>`;
  const cutG = (inner, w) =>
    `<g fill="#000" stroke="#000" stroke-width="${w}" stroke-linejoin="round">${inner}</g>`;
  const sGap = gap * 2 + sStroke;
  const defs =
    `<path id="${idp}-M" d="${c.M}"/>` +
    `<path id="${idp}-A" transform="translate(${c.xa} 0)" d="${c.A}"/>` +
    `<path id="${idp}-S" transform="translate(${c.sx} ${c.sy})" d="${c.S}"/>` +
    `<mask id="${idp}-mL" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>${cutG(useS, sGap)}<g fill="#fff">${reg}</g></mask>` +
    `<clipPath id="${idp}-cU">${reg}</clipPath>` +
    `<mask id="${idp}-mS" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/><g clip-path="url(#${idp}-cU)">${cutG(useM + useA, gap * 2)}</g></mask>` +
    grad(`${idp}-gT`, p, 'threadA', 'threadB', 'threadC', 35) +
    (satinPitch ? satin(`${idp}-sat`, satinPitch) : '');
  const thread = `<g style="fill:url(#${idp}-gT)${sStroke ? `;stroke:url(#${idp}-gT);stroke-width:${sStroke};stroke-linejoin:round` : ''}">${useS}</g>`;
  const body =
    `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s * 10000) / 10000})">` +
    `<g mask="url(#${idp}-mL)" style="fill:${p('letters')}">${useM}${useA}</g>` +
    `<g mask="url(#${idp}-mS)">${thread}${satinPitch ? `<g fill="url(#${idp}-sat)">${useS}</g>` : ''}</g>` +
    '</g>';
  return { defs, body };
}

// The pair of hoops with the tension clasp at 12 o'clock: two tabs, the screw through them and
// a round thumb knob. `ground` is the colour of the knock-out behind the clasp (none = no
// knock-out; the clasp then simply sits over the rings).
function hoop(idp, { cx, cy, R, w1, w2, gapR, p }) {
  const t = w1;
  const top = cy - R - w1 / 2;
  const tabW = t * 0.95,
    tabH = t * 2.0,
    tabGap = t * 0.7;
  const yTab = top - tabH + t * 0.5;
  const screwY = yTab + tabH * 0.42;
  const ring = `url(#${idp}-gR)`;
  const clasp = `url(#${idp}-gC)`;
  return {
    defs:
      grad(`${idp}-gR`, p, 'ringA', 'ringB', 'ringC', 90) +
      grad(`${idp}-gC`, p, 'claspA', 'claspB', 'claspC', 0),
    body:
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" style="stroke:${ring}" stroke-width="${w1}"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${r(R - gapR)}" fill="none" style="stroke:${ring}" stroke-width="${w2}"/>` +
      `<g style="fill:${clasp}">` +
      `<rect x="${r(cx - tabGap / 2 - tabW)}" y="${r(yTab)}" width="${r(tabW)}" height="${r(tabH)}" rx="${r(t * 0.18)}"/>` +
      `<rect x="${r(cx + tabGap / 2)}" y="${r(yTab)}" width="${r(tabW)}" height="${r(tabH)}" rx="${r(t * 0.18)}"/>` +
      `<rect x="${r(cx - tabGap / 2 - tabW - t * 0.55)}" y="${r(screwY - t * 0.17)}" width="${r(tabW * 2 + tabGap + t * 1.4)}" height="${r(t * 0.34)}" rx="${r(t * 0.17)}"/>` +
      `<circle cx="${r(cx + tabGap / 2 + tabW + t * 1.15)}" cy="${r(screwY)}" r="${r(t * 0.62)}"/>` +
      '</g>',
  };
}

function snapDash(rad, dash, gap) {
  const circ = 2 * Math.PI * rad;
  const n = Math.round(circ / (dash + gap));
  const k = circ / (n * (dash + gap));
  return `${r(dash * k)} ${r(gap * k)}`;
}

function attrs({ title, className, extra = '' }) {
  const a11y = title
    ? ` role="img" aria-label="${title}"`
    : ' aria-hidden="true" focusable="false"';
  return `${a11y}${className ? ` class="${className}"` : ''}${extra}`;
}

/**
 * The Hoop Seal.
 * @param {object} o
 * @param {string} o.idp            unique id prefix for this instance
 * @param {'regular'|'bold'|'heavy'} [o.cut]  cypher weight (bold for 40 to 120px, heavy for icons)
 * @param {boolean} [o.ring]        the full seal: ring lettering and running-stitch border
 * @param {object} [o.palette]      LIGHT (default) or DARK fallbacks
 * @param {boolean} [o.adaptive]    paint through --logo-* custom properties
 * @param {string} [o.title]        accessible name; omit for a decorative logo
 * @param {string} [o.className]
 * @param {string} [o.background]   a solid square behind (for app icons)
 * @param {number} [o.inset]        for icons: shrink the art inside its box (0 to 1)
 * @param {boolean} [o.flat]        no satin-stitch texture on the S (one-colour versions for
 *                                  stamps and embroidery: flat shapes only)
 */
export function sealSvg({
  idp,
  cut = 'bold',
  ring = false,
  palette = LIGHT,
  adaptive = false,
  title,
  className,
  background,
  inset = 1,
  flat = false,
}) {
  const p = painter(palette, adaptive);
  if (ring) {
    const cx = 300,
      cy = 328;
    const hp = hoop(idp, { cx, cy, R: 272, w1: 11, w2: 5, gapR: 15, p });
    const cy1 = cypher(idp, cut, {
      cx: cx - 4,
      cy: cy + 4,
      h: 272,
      p,
      gap: 7,
      satinPitch: flat ? 0 : 4.2,
    });
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 616"${attrs({ title, className })}>` +
      `<defs>${hp.defs}${cy1.defs}</defs>` +
      (background ? `<rect width="600" height="616" fill="${background}"/>` : '') +
      hp.body +
      `<g transform="translate(${cx} ${cy})" style="fill:${p('text')}"><path d="${BRAND.ring.top}"/><path d="${BRAND.ring.bot}"/></g>` +
      `<g style="fill:${p('knot')}"><circle cx="${cx - 229}" cy="${cy}" r="4"/><circle cx="${cx + 229}" cy="${cy}" r="4"/></g>` +
      `<circle cx="${cx}" cy="${cy}" r="200" fill="none" style="stroke:${p('stitch')}" stroke-width="2.2" stroke-dasharray="${snapDash(200, 10, 7)}" stroke-linecap="round"/>` +
      cy1.body +
      '</svg>'
    );
  }
  // The compact mark: rings and cypher in a 200 box (clasp at the top).
  const heavy = cut === 'heavy';
  const hp = hoop(idp, {
    cx: 100,
    cy: 110,
    R: heavy ? 82 : 84,
    w1: heavy ? 13 : 7,
    w2: heavy ? 0 : 3.2,
    gapR: 9.5,
    p,
  });
  const cy1 = cypher(idp, cut, {
    cx: 98,
    cy: heavy ? 111 : 112,
    h: heavy ? 112 : 116,
    p,
    gap: heavy ? 8 : 5.5,
    satinPitch: heavy || flat ? 0 : 6,
    sStroke: heavy ? 7 : 0,
  });
  const k = inset;
  const inner =
    k === 1
      ? hp.body + cy1.body
      : `<g transform="translate(${r(100 * (1 - k))} ${r(100 * (1 - k))}) scale(${k})">${hp.body}${cy1.body}</g>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${attrs({ title, className })}>` +
    `<defs>${hp.defs}${cy1.defs}</defs>` +
    (background ? `<rect width="200" height="200" fill="${background}"/>` : '') +
    inner +
    '</svg>'
  );
}

/**
 * The browser-tab icon (16 to 32px): the seal reduced to what survives at that size. A Midnight
 * disc, one heavy gold hoop (no clasp, no inner ring), the heavy cypher in Linen and gold.
 * @param {object} o
 * @param {string} o.idp
 */
export function tabIconSvg({ idp }) {
  const p = painter(DARK, false);
  const cy1 = cypher(idp, 'heavy', {
    cx: 99,
    cy: 102,
    h: 118,
    p,
    gap: 9,
    satinPitch: 0,
    sStroke: 9,
  });
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    `<defs>${grad(`${idp}-gR`, p, 'ringA', 'ringB', 'ringC', 90)}${cy1.defs}</defs>` +
    '<circle cx="100" cy="100" r="100" fill="#0F1B2D"/>' +
    `<circle cx="100" cy="100" r="86" fill="none" style="stroke:url(#${idp}-gR)" stroke-width="14"/>` +
    cy1.body +
    '</svg>'
  );
}

/**
 * The Signature Thread wordmark.
 * @param {object} o
 * @param {string} o.idp
 * @param {'display'|'header'} [o.cut]  display for 60px and up, header (heavier) below
 * @param {object} [o.palette]
 * @param {boolean} [o.adaptive]
 * @param {string} [o.title]
 * @param {string} [o.className]
 */
export function wordmarkSvg({
  idp,
  cut = 'header',
  palette = LIGHT,
  adaptive = false,
  title,
  className,
}) {
  const p = painter(palette, adaptive);
  const w = BRAND.wordmark[cut];
  const [x, y, vw, vh] = w.view;
  const box = `x="${x - 10}" y="${y - 10}" width="${vw + 20}" height="${vh + 20}"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${vw} ${vh}"${attrs({ title, className })}>` +
    `<defs>${grad(`${idp}-gT`, p, 'threadA', 'threadB', 'threadC', 0)}` +
    `<mask id="${idp}-mT" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>` +
    `<path d="${w.g}" fill="#000" stroke="#000" stroke-width="${w.gap * 2}" stroke-linejoin="round"/></mask></defs>` +
    `<g style="fill:url(#${idp}-gT)"><path d="${w.thread}" mask="url(#${idp}-mT)"/><path d="${w.stitches}"/></g>` +
    `<circle cx="${w.knot.x}" cy="${w.knot.y}" r="${w.knot.r}" style="fill:${p('knot')}"/>` +
    `<path d="${w.mas}" style="fill:${p('word')}"/>` +
    `<path d="${w.mono}" style="fill:${p('swash')}"/>` +
    '</svg>'
  );
}

/** The wordmark's width / height, for reserving its box. */
export function wordmarkAspect(cut = 'header') {
  const v = BRAND.wordmark[cut].view;
  return v[2] / v[3];
}
