// Emits src/lib/brand/brandPaths.js: the outlined geometry of the chosen logo system
// (2026-10-04): the Hoop Seal cypher (three weights), the seal's ring lettering, and the
// Signature Thread wordmark (display and header cuts). Run: node brand.mjs
// Needs Python fontTools (outline.py). The output is committed; nothing at build time needs fonts.
import { writeFileSync } from 'node:fs';
import { outline, F, ROOT } from './lib.mjs';
import { taper } from './common.mjs';
import { createRequire } from 'node:module';
const { optimize } = createRequire(ROOT + 'package.json')('svgo');

// svgo's path optimiser: relative commands, shorthand curves, fixed precision.
function opt(d, precision = 1) {
  const res = optimize(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`, {
    multipass: true,
    plugins: [
      {
        name: 'convertPathData',
        params: { floatPrecision: precision, transformPrecision: 3, makeArcs: false },
      },
    ],
  });
  return res.data.match(/ d="([^"]+)"/)[1];
}

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
const IT = '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2';

// Round every number in a path string to one decimal (the art is drawn at 100 to 300 units,
// so 0.1 is invisible) and drop redundant spaces.
const slim = (d) =>
  d
    .replace(/-?\d+\.?\d*(e-?\d+)?/g, (n) => {
      const v = Math.round(parseFloat(n) * 10) / 10;
      return Object.is(v, -0) ? '0' : String(v);
    })
    .replace(/\s+/g, ' ')
    .replace(/ ?([MLHVCSQTAZmlhvcsqtaz]) ?/g, '$1')
    .trim();
const r1 = (n) => Math.round(n * 10) / 10;

// ---- The cypher --------------------------------------------------------------------------
const LAYOUT = { ax: 0.72, sx: -34, sy: 22 };
const UNDER = [
  { cx: 236, cy: -160, r: 20 },
  { cx: 37, cy: -160, r: 17 },
];
function cypher(wght) {
  const g = outline([
    { id: 'M', font: RO, axes: { wght, opsz: 144, SOFT: 0, WONK: 0 }, text: 'M', size: 300 },
    { id: 'A', font: RO, axes: { wght, opsz: 144, SOFT: 0, WONK: 0 }, text: 'A', size: 300 },
    { id: 'S', font: F.greatVibes, text: 'S', size: 430 },
  ]);
  const M = g.M.glyphs[0],
    A = g.A.glyphs[0],
    S = g.S.glyphs[0];
  const xa = M.adv * LAYOUT.ax;
  const sx = (xa + A.bbox[2]) / 2 - (S.bbox[0] + S.bbox[2]) / 2 + 18 + LAYOUT.sx;
  const sy = LAYOUT.sy;
  return {
    M: opt(M.d),
    A: opt(A.d),
    S: opt(S.d),
    xa: r1(xa),
    sx: r1(sx),
    sy,
    box: [
      r1(Math.min(M.bbox[0], sx + S.bbox[0])),
      r1(Math.min(M.bbox[1], sy + S.bbox[1])),
      r1(Math.max(xa + A.bbox[2], sx + S.bbox[2])),
      r1(Math.max(0, sy + S.bbox[3])),
    ],
  };
}

// ---- Ring lettering for the full seal (centred on 0,0) -------------------------------------
function arc(o, radius, centerDeg, inside) {
  const total = o.width;
  const span = (total / (2 * Math.PI * radius)) * 360;
  let out = '';
  for (const g of o.glyphs) {
    if (!g.d) continue;
    const mid = g.x + g.adv / 2;
    const frac = mid / total;
    const deg = inside ? centerDeg + span / 2 - frac * span : centerDeg - span / 2 + frac * span;
    const rad = ((deg - 90) * Math.PI) / 180;
    const px = radius * Math.cos(rad);
    const py = radius * Math.sin(rad);
    const rot = ((inside ? deg + 180 : deg) * Math.PI) / 180;
    const c = Math.cos(rot),
      s = Math.sin(rot);
    // Bake the transform into the coordinates so the ring is one plain path.
    out += g.d.replace(/(-?\d+\.?\d*)[ ,](-?\d+\.?\d*)/g, (_, xs, ys) => {
      const x = parseFloat(xs) - mid,
        y = parseFloat(ys);
      return `${r1(px + x * c - y * s)} ${r1(py + x * s + y * c)}`;
    });
  }
  return slim(out);
}
const ringG = outline([
  {
    id: 'top',
    font: RO,
    axes: { wght: 540, opsz: 24, SOFT: 0, WONK: 0 },
    text: 'MAS MONOGRAMS',
    size: 27,
    tracking: 260,
  },
  {
    id: 'bot',
    font: RO,
    axes: { wght: 540, opsz: 24, SOFT: 0, WONK: 0 },
    text: 'ST. MATTHEWS, SOUTH CAROLINA',
    size: 17,
    tracking: 240,
  },
]);
// Every glyph command in fontTools output is absolute (M/L/Q/C/Z) with x y pairs, which is what
// the pair-wise rewrite above relies on.
const RING = {
  top: opt(arc(ringG.top, 222, 0, false), 0),
  bot: opt(arc(ringG.bot, 236, 180, true), 0),
};

// ---- The wordmark ---------------------------------------------------------------------------
const GAP = 56;
const threadW = (base) => (t) => {
  if (t < 0.03) return base * (0.55 + 0.45 * (t / 0.03));
  if (t > 0.85) return base * (1 - 0.45 * ((t - 0.85) / 0.15));
  return base * (1 + 0.08 * Math.sin(t * Math.PI * 3));
};
const stitch = (x1, y1, x2, y2, wmax) =>
  taper(
    [
      [
        x1,
        y1,
        x1 + (x2 - x1) / 3,
        y1 + (y2 - y1) / 3,
        x1 + (2 * (x2 - x1)) / 3,
        y1 + (2 * (y2 - y1)) / 3,
        x2,
        y2,
      ],
    ],
    (t) => 0.4 + wmax * Math.sin(Math.PI * t),
    12,
  );
function wordmark(bold) {
  const g = outline([
    {
      id: 'mas',
      font: RO,
      axes: { wght: bold ? 520 : 440, opsz: bold ? 72 : 144, SOFT: 0, WONK: 0 },
      text: 'MAS',
      size: 100,
      tracking: 30,
    },
    {
      id: 'mono',
      font: IT,
      axes: { wght: bold ? 470 : 400, opsz: bold ? 72 : 144, SOFT: 100, WONK: 1 },
      text: 'Monograms',
      size: 100,
    },
  ]);
  const mas = g.mas,
    mono = g.mono;
  const monoX = mas.width + GAP;
  const endX = monoX + mono.width + 4;
  const x0 = monoX - 44;
  const segs = [
    [x0, 15, x0 + 22, 15, x0 + 44, 2, x0 + 44, -22],
    [x0 + 44, -22, x0 + 44, -46, x0 + 16, -48, x0 + 13, -24],
    [x0 + 13, -24, x0 + 10, -2, x0 + 30, 16, x0 + 64, 16],
    [x0 + 62, 16, monoX + 120, 16, monoX + 200, 19, monoX + 262, 16],
    [monoX + 262, 16, monoX + 340, 13, endX - 40, 14, endX, 12],
  ];
  const tw = bold ? 5 : 4;
  const n = 6;
  const pitch = (x0 - 2) / n;
  let stitches = '';
  for (let i = 0; i < n; i++) {
    const x = 2 + i * pitch;
    stitches += stitch(x, 15, x + pitch * 0.62, 15, tw * 0.8);
  }
  const gG = mono.glyphs.find((x) => x.ch === 'g');
  const shift = (d, dx) =>
    d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, a, b) => `${r1(parseFloat(a) + dx)} ${b}`);
  const knot = { x: r1(endX + 9), y: 11, r: r1(tw * 0.8) };
  return {
    mas: opt(mas.d),
    mono: opt(shift(mono.d, monoX)),
    g: opt(shift(gG.d, monoX)),
    thread: opt(taper(segs, threadW(tw), 110)),
    stitches: opt(stitches),
    knot,
    gap: bold ? 4.5 : 3.5,
    // viewBox: x from -2, y from -74 (caps 70 plus overshoot) to +28 (the g's descender).
    view: [-2, -74, r1(knot.x + knot.r + 6), 102],
  };
}

const data = {
  cypher: { regular: cypher(400), bold: cypher(560), heavy: cypher(760), under: UNDER },
  ring: RING,
  wordmark: { display: wordmark(false), header: wordmark(true) },
};

const out = `// GENERATED by docs/logo-concepts/2026-10-04-atelier/generator/brand.mjs. Do not edit by hand.
// Outlined geometry of the MAS Monograms logo system (2026-10-04): the Hoop Seal cypher in three
// weights (regular for the seal, bold for the compact mark, heavy for 16 to 32px icons), the
// seal's ring lettering (centred on 0,0) and the Signature Thread wordmark (display and header
// cuts). Fraunces and Great Vibes outlined with fontTools, numbers rounded to 0.1.
// Composed into SVG by ./brandSvg.js.
export const BRAND = ${JSON.stringify(data)};
`;
const target = ROOT + 'src/lib/brand/brandPaths.js';
writeFileSync(target, out);
console.log('wrote', target, (out.length / 1024).toFixed(1), 'KB');
