// Concept 2: "The Signature Thread". A luxe wordmark: "MAS" in high-contrast Fraunces roman
// caps beside "Monograms" in the site's own soft, wonky Fraunces italic, joined by one hand-sewn
// thread that slips out from behind the M, loops once, runs under the name as its underline
// (passing behind the g), and finishes in three running stitches and a knot.
import { outline, C, r } from './lib.mjs';
import { svgOpen, goldGrad, taper } from './common.mjs';

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
const IT = '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2';
let G;
function glyphs() {
  if (G) return G;
  G = outline([
    {
      id: 'mas',
      font: RO,
      axes: { wght: 440, opsz: 144, SOFT: 0, WONK: 0 },
      text: 'MAS',
      size: 100,
      tracking: 30,
    },
    {
      id: 'mono',
      font: IT,
      axes: { wght: 400, opsz: 144, SOFT: 100, WONK: 1 },
      text: 'Monograms',
      size: 100,
    },
    {
      id: 'masB',
      font: RO,
      axes: { wght: 520, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MAS',
      size: 100,
      tracking: 30,
    },
    {
      id: 'monoB',
      font: IT,
      axes: { wght: 470, opsz: 72, SOFT: 100, WONK: 1 },
      text: 'Monograms',
      size: 100,
    },
    { id: 'M', font: IT, axes: { wght: 480, opsz: 144, SOFT: 100, WONK: 1 }, text: 'M', size: 100 },
  ]);
  return G;
}

const GAP = 56; // space between MAS and Monograms (room for the loop)

// The thread, in wordmark coordinates (baseline y=0, cap height 70): out from behind the
// M's left stem, one generous loop, then the long underline under both words.
function threadSegs(monoX, endX) {
  // Emerges at the end of the running stitch (x0), rises into one closed loop in the gap
  // before "Monograms", crosses itself, and runs on as the underline.
  const x0 = monoX - 44;
  return [
    [x0, 15, x0 + 22, 15, x0 + 44, 2, x0 + 44, -22],
    [x0 + 44, -22, x0 + 44, -46, x0 + 16, -48, x0 + 13, -24],
    [x0 + 13, -24, x0 + 10, -2, x0 + 30, 16, x0 + 64, 16],
    [x0 + 62, 16, monoX + 120, 16, monoX + 200, 19, monoX + 262, 16],
    [monoX + 262, 16, monoX + 340, 13, endX - 40, 14, endX, 12],
  ];
}
// Thin where it leaves the cloth, full in the run, easing off before the stitches.
const threadW = (base) => (t) => {
  if (t < 0.03) return base * (0.55 + 0.45 * (t / 0.03));
  if (t > 0.85) return base * (1 - 0.45 * ((t - 0.85) / 0.15));
  return base * (1 + 0.08 * Math.sin(t * Math.PI * 3));
};
// A single satin stitch: a lens-shaped dash.
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
    24,
  );

function pal(dark) {
  return dark
    ? { word: C.linen, swash: C.goldLight, thread: 'url(#P-g)', knot: C.goldLight }
    : { word: C.ink, swash: C.claret, thread: C.claret, knot: C.claret };
}

export function threadWordmark({ dark = false, id = 'c2', bold = false, swashColor = true } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const mas = bold ? g.masB : g.mas;
  const mono = bold ? g.monoB : g.mono;
  const monoX = mas.width + GAP;
  const endX = monoX + mono.width + 4;
  const gG = mono.glyphs.find((x) => x.ch === 'g');
  const tw = bold ? 5 : 4;
  const d = taper(threadSegs(monoX, endX), threadW(tw));
  // The g's descender sits in front of the thread: cut a gap in the thread around it.
  const gPath = `<path transform="translate(${r(monoX)} 0)" d="${gG.d}"/>`;
  // The M's left stem sits in front of the thread's first stretch.
  const mPath = `<path d="${mas.glyphs[0].d}"/>`;
  const box = 'x="-80" y="-120" width="900" height="200"';
  // Running stitches after the underline, then a French knot.
  // Running stitches under MAS: the thread on top of the cloth, gaps where it is under.
  const x0 = monoX - 44;
  const n = 6;
  const pitch = (x0 - 2) / n;
  const stitches = Array.from({ length: n }, (_, i) => {
    const x = 2 + i * pitch;
    return `<path d="${stitch(x, 15, x + pitch * 0.62, 15, tw * 0.8)}"/>`;
  }).join('');
  const knotX = endX + 9;
  const W = knotX + 14;
  return fix(`${svgOpen(W + 8, 130, 'MAS Monograms', ` data-concept="signature-thread"`)}
  <defs>${goldGrad('P-g', 0)}
    <mask id="P-mt" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>
      <g fill="#000" stroke="#000" stroke-width="${bold ? 9 : 7}" stroke-linejoin="round">${gPath}${mPath}</g></mask></defs>
  <g transform="translate(4 92)">
    <g mask="url(#P-mt)" fill="${k.thread}"><path d="${d}"/></g>
    <g fill="${k.thread}">${stitches}</g>
    <circle cx="${r(knotX)}" cy="11" r="${r(tw * 0.8)}" fill="${k.knot}"/>
    <path d="${mas.d}" fill="${k.word}"/>
    <path transform="translate(${r(monoX)} 0)" d="${mono.d}" fill="${swashColor ? k.swash : k.word}"/>
  </g>
</svg>`);
}

// Compact mark: the loop and the italic M from the wordmark, underlined by the same thread,
// with one running stitch leading in. Built at wordmark scale, then fitted to a 100 box.
export function threadMark({ dark = false, id = 'c2m', tile = false } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const M = g.monoB.glyphs[0];
  const monoX = 0;
  const x0 = -44;
  const endX = M.bbox[2] + 6;
  const segs = [
    [x0, 15, x0 + 22, 15, x0 + 44, 2, x0 + 44, -22],
    [x0 + 44, -22, x0 + 44, -46, x0 + 16, -48, x0 + 13, -24],
    [x0 + 13, -24, x0 + 10, -2, x0 + 30, 16, x0 + 64, 16],
    [x0 + 64, 16, 40, 17, endX - 20, 15, endX, 13],
  ];
  const d = taper(segs, threadW(7.5));
  const st = stitch(x0 - 26, 15, x0 - 8, 15, 6);
  // fit: content spans x (x0-26 .. endX+10), y (-70 .. 24)
  const minX = x0 - 28,
    maxX = endX + 14,
    minY = -72,
    maxY = 26;
  const sc = Math.min(84 / (maxX - minX), 84 / (maxY - minY));
  const tx = 50 - ((minX + maxX) / 2) * sc;
  const ty = 50 - ((minY + maxY) / 2) * sc;
  const box = 'x="-120" y="-120" width="360" height="240"';
  const bg = tile
    ? `<rect width="100" height="100" rx="14" fill="${dark ? C.midnight : C.linen}"/>`
    : '';
  return fix(`${svgOpen(100, 100, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 0)}<mask id="P-mm" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>
    <path d="${M.d}" fill="#000" stroke="#000" stroke-width="12"/></mask></defs>
  ${bg}
  <g transform="translate(${r(tx)} ${r(ty)}) scale(${r(sc * 1000) / 1000})">
    <g fill="${k.thread}"><path d="${st}"/><g mask="url(#P-mm)"><path d="${d}"/></g>
    <circle cx="${r(endX + 8)}" cy="11.5" r="5.4"/></g>
    <path d="${M.d}" fill="${k.swash}"/>
  </g>
</svg>`);
}
