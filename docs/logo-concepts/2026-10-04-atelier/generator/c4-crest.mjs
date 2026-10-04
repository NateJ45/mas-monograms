// Concept 4: "The Stitched Laurel". A crest: a laurel of satin-stitched (fishbone) leaves on
// tapered stems, crossed and tied at the foot like a thread knot, around a single soft italic M.
// A cross-stitch star sits in the opening at the top. Name and place set in caps beneath.
import { outline, C, r } from './lib.mjs';
import { svgOpen, goldGrad, taper, satin } from './common.mjs';

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
const IT = '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2';
let G;
function glyphs() {
  if (G) return G;
  G = outline([
    { id: 'M', font: IT, axes: { wght: 360, opsz: 144, SOFT: 100, WONK: 1 }, text: 'M', size: 220 },
    { id: 'Mb', font: IT, axes: { wght: 560, opsz: 72, SOFT: 100, WONK: 1 }, text: 'M', size: 220 },
    {
      id: 'name',
      font: RO,
      axes: { wght: 470, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MAS MONOGRAMS',
      size: 44,
      tracking: 150,
    },
    {
      id: 'place',
      font: RO,
      axes: { wght: 560, opsz: 14, SOFT: 0, WONK: 0 },
      text: 'ST. MATTHEWS · SOUTH CAROLINA',
      size: 15,
      tracking: 300,
    },
    {
      id: 'word',
      font: RO,
      axes: { wght: 440, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MAS MONOGRAMS',
      size: 50,
      tracking: 90,
    },
  ]);
  return G;
}

const pal = (dark) =>
  dark
    ? {
        sat: 'P-sat',
        leaf: 'url(#P-g)',
        vein: C.midnight,
        stem: 'url(#P-g)',
        M: C.linen,
        text: C.linen,
        place: C.gold,
        star: C.goldLight,
      }
    : {
        sat: 'P-sat',
        leaf: C.indigo,
        vein: C.linen,
        stem: C.indigo,
        M: C.claret,
        text: C.midnight,
        place: C.claret,
        star: C.claret,
      };

const pt = (cx, cy, R, deg) => [
  cx + R * Math.sin((deg * Math.PI) / 180),
  cy - R * Math.cos((deg * Math.PI) / 180),
];

// One leaf: an almond with a fishbone vein, base at (x,y), pointing at angle a (deg, 0 = up).
function leaf(x, y, a, len, wid, k) {
  const L = len,
    Wd = wid;
  const d = `M 0 0 C ${r(Wd)} ${r(-L * 0.25)}, ${r(Wd * 0.8)} ${r(-L * 0.75)}, 0 ${r(-L)} C ${r(-Wd * 0.8)} ${r(-L * 0.75)}, ${r(-Wd)} ${r(-L * 0.25)}, 0 0 Z`;
  const vein = `M 0 ${r(-L * 0.12)} L 0 ${r(-L * 0.8)}`;
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(a)})"><path d="${d}" fill="${k.leaf}"/><path d="${d}" fill="url(#${k.sat})"/><path d="${vein}" stroke="${k.vein}" stroke-width="${r(Wd * 0.16)}" stroke-linecap="round" fill="none"/></g>`;
}

// One branch from the foot up one side; side = -1 left, +1 right.
function branch(cx, cy, R, side, k, { n = 11, scale = 1 } = {}) {
  const a0 = 186,
    a1 = 318; // degrees (0 = top), measured clockwise for the left branch
  const deg = (t) => (side < 0 ? a0 + (a1 - a0) * t : 360 - (a0 + (a1 - a0) * t));
  // stem as a tapered arc
  const segs = [];
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps,
      t1 = (i + 1) / steps;
    const p0 = pt(cx, cy, R, deg(t0)),
      p3 = pt(cx, cy, R, deg(t1));
    const h = (4 / 3) * Math.tan((((a1 - a0) / steps) * Math.PI) / 180 / 4) * R;
    const tan = (dd, s) => [Math.cos((dd * Math.PI) / 180) * s, Math.sin((dd * Math.PI) / 180) * s];
    const dir = side < 0 ? 1 : -1;
    const [t0x, t0y] = tan(deg(t0), h * dir);
    const [t1x, t1y] = tan(deg(t1), h * dir);
    segs.push([p0[0], p0[1], p0[0] + t0x, p0[1] + t0y, p3[0] - t1x, p3[1] - t1y, p3[0], p3[1]]);
  }
  let out = `<path d="${taper(segs, (t) => (4.2 - 2.6 * t) * scale)}" fill="${k.stem}"/>`;
  for (let i = 0; i < n; i++) {
    const t = 0.1 + (0.86 * i) / (n - 1);
    const dd = deg(t);
    const [x, y] = pt(cx, cy, R, dd);
    const along = side < 0 ? dd + 90 : dd - 90; // tangent direction pointing up the branch
    const size = (1 - 0.42 * t) * scale;
    out += leaf(x, y, along + (side < 0 ? -42 : 42), 50 * size, 15 * size, k);
    out += leaf(x, y, along + (side < 0 ? 36 : -36), 44 * size, 13.5 * size, k);
  }
  // terminal leaf
  const [tx, ty] = pt(cx, cy, R, deg(1));
  out += leaf(
    tx,
    ty,
    side < 0 ? deg(1) + 90 : deg(1) - 90,
    40 * scale * 0.62,
    12 * scale * 0.62,
    k,
  );
  return out;
}

// The tie at the foot: the stems meet in a French knot, and two thread tails fall away.
function tie(cx, y, k, s = 1) {
  const tl = taper(
    [
      [
        cx - 3 * s,
        y + 2 * s,
        cx - 10 * s,
        y + 18 * s,
        cx - 30 * s,
        y + 20 * s,
        cx - 34 * s,
        y + 34 * s,
      ],
    ],
    (t) => 3.2 * s * (1 - 0.75 * t),
  );
  const tr = taper(
    [
      [
        cx + 3 * s,
        y + 2 * s,
        cx + 10 * s,
        y + 18 * s,
        cx + 30 * s,
        y + 20 * s,
        cx + 34 * s,
        y + 34 * s,
      ],
    ],
    (t) => 3.2 * s * (1 - 0.75 * t),
  );
  return `<path d="${tl}" fill="${k.stem}"/><path d="${tr}" fill="${k.stem}"/><circle cx="${cx}" cy="${r(y)}" r="${r(6 * s)}" fill="${k.star}"/>`;
}

// Cross-stitch star: two crossed satin stitches.
function star(x, y, s, k) {
  const st = (a) =>
    `<path transform="translate(${r(x)} ${r(y)}) rotate(${a})" d="${taper([[0, -s, 0, -s / 3, 0, s / 3, 0, s]], (t) => 0.6 + s * 0.42 * Math.sin(Math.PI * t), 20)}"/>`;
  return `<g fill="${k.star}">${st(45)}${st(-45)}</g>`;
}

function emblem(k, cx, cy, R, { bold = false, scale = 1 } = {}) {
  const g = glyphs();
  const M = (bold ? g.Mb : g.M).glyphs[0];
  const mw = M.bbox[2] - M.bbox[0];
  const mh = -M.bbox[1];
  const ms = (R * (bold ? 0.98 : 0.9)) / mh;
  return `
  ${branch(cx, cy, R, -1, k, { scale })}
  ${branch(cx, cy, R, 1, k, { scale })}
  ${tie(cx, cy + R + 2, k, scale)}
  ${star(cx, cy - R + 6, 11 * scale, k)}
  <path transform="translate(${r(cx - (M.bbox[0] + mw / 2) * ms + 4 * scale)} ${r(cy + mh * ms * 0.5)}) scale(${r(ms * 1000) / 1000})" d="${M.d}" fill="${k.M}"/>`;
}

export function crest({ dark = false, id = 'c4' } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const W = 560,
    cx = W / 2;
  return fix(`${svgOpen(W, 640, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 90)}${satin('P-sat', { pitch: 3, angle: 30, hi: 0.22, lo: 0.2 })}</defs>
  ${emblem(k, cx, 236, 176)}
  <path transform="translate(${r(cx - g.name.width / 2 + 3)} 534)" d="${g.name.d}" fill="${k.text}"/>
  <path transform="translate(${r(cx - g.place.width / 2 + 2)} 580)" d="${g.place.d}" fill="${k.place}"/>
</svg>`);
}

export function crestMark({ dark = false, id = 'c4m' } = {}) {
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  return fix(`${svgOpen(200, 200, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 90)}${satin('P-sat', { pitch: 3, angle: 30, hi: 0.22, lo: 0.2 })}</defs>
  <g transform="translate(100 98) scale(0.47) translate(-280 -236)">${emblem(k, 280, 236, 176, { bold: true, scale: 1.25 })}</g>
</svg>`);
}

export function crestLockup({ dark = false, id = 'c4h' } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const wx = 132;
  return fix(`${svgOpen(wx + g.word.width + 4, 124, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 90)}${satin('P-sat', { pitch: 3, angle: 30, hi: 0.22, lo: 0.2 })}</defs>
  <g transform="translate(60 60) scale(0.27) translate(-280 -236)">${emblem(k, 280, 236, 176, { bold: true, scale: 1.3 })}</g>
  <path transform="translate(${wx} 78)" d="${g.word.d}" fill="${k.text}"/>
</svg>`);
}
