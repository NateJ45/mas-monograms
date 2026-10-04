// The "threaded" MAS cypher: a high-contrast Fraunces M with the A set into its right
// shoulder, and a long script S (Great Vibes outline) that winds through them like a thread,
// alternating over and under at each crossing.
import { outline, F, r } from './lib.mjs';

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
const cache = {};
function glyphs(wght) {
  if (cache[wght]) return cache[wght];
  const g = outline([
    { id: 'M', font: RO, axes: { wght, opsz: 144, SOFT: 0, WONK: 0 }, text: 'M', size: 300 },
    { id: 'A', font: RO, axes: { wght, opsz: 144, SOFT: 0, WONK: 0 }, text: 'A', size: 300 },
    { id: 'S', font: F.greatVibes, text: 'S', size: 430 },
  ]);
  return (cache[wght] = { M: g.M.glyphs[0], A: g.A.glyphs[0], S: g.S.glyphs[0] });
}

// Local layout (baseline y=0, M at x=0), in the 300px design size.
export const LAYOUT = { ax: 0.72, sx: -34, sy: 22 };

// Regions (local coords) where the S passes UNDER the roman letters.
export const UNDER = [
  { cx: 236, cy: -160, r: 20 }, // spine under the A's left hairline
  { cx: 37, cy: -160, r: 17 }, // tail under the M's left hairline
];

export function threadedCypher(
  p,
  {
    cx,
    cy,
    h,
    letters,
    thread,
    satinLetters,
    satinThread,
    wght = 400,
    gap = 7,
    debug = false,
    under = UNDER,
  },
) {
  const { M, A, S } = glyphs(wght);
  const xa = M.adv * LAYOUT.ax;
  const sx = (xa + A.bbox[2]) / 2 - (S.bbox[0] + S.bbox[2]) / 2 + 18 + LAYOUT.sx;
  const sy = LAYOUT.sy;
  const minX = Math.min(M.bbox[0], sx + S.bbox[0]);
  const maxX = Math.max(xa + A.bbox[2], sx + S.bbox[2]);
  const minY = Math.min(M.bbox[1], sy + S.bbox[1]);
  const maxY = Math.max(0, sy + S.bbox[3]);
  const s = h / (maxY - minY);
  const tx = cx - ((minX + maxX) / 2) * s;
  const ty = cy - ((minY + maxY) / 2) * s;
  const pM = `<path d="${M.d}"/>`;
  const pA = `<path transform="translate(${r(xa)} 0)" d="${A.d}"/>`;
  const pS = `<path transform="translate(${r(sx)} ${sy})" d="${S.d}"/>`;
  const reg = under.map((u) => `<circle cx="${u.cx}" cy="${u.cy}" r="${u.r}"/>`).join('');
  const box = 'x="-600" y="-700" width="1800" height="1400"';
  const cut = (inner) =>
    `<g fill="#000" stroke="#000" stroke-width="${gap * 2}" stroke-linejoin="round">${inner}</g>`;
  const defs = `
  <mask id="${p}-mM" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>${cut(pS)}<g fill="#fff">${reg}</g></mask>
  <mask id="${p}-mA" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>${cut(pS)}<g fill="#fff">${reg}</g></mask>
  <clipPath id="${p}-cU">${reg}</clipPath>
  <mask id="${p}-mS" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/><g clip-path="url(#${p}-cU)">${cut(pM + pA)}</g></mask>`;
  const layer = (pp, m, fill, sat) =>
    `<g mask="url(#${m})"><g fill="${fill}">${pp}</g>${sat ? `<g fill="url(#${sat})">${pp}</g>` : ''}</g>`;
  const dbg = debug ? `<g fill="none" stroke="red" stroke-width="2">${reg}</g>` : '';
  return {
    defs,
    body: `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(s * 10000) / 10000})">${layer(pM, `${p}-mM`, letters, satinLetters)}${layer(pA, `${p}-mA`, letters, satinLetters)}${layer(pS, `${p}-mS`, thread, satinThread)}${dbg}</g>`,
    aspect: (maxX - minX) / (maxY - minY),
  };
}
