// Concept 3: "The Woven Label". A sewn-in garment label, end-folded and stitched down at both
// ends, with the name woven into it: the lettering is made of the label's own weft threads.
// It reads as finished goods and quality craftsmanship; the place line is the "care label".
import { outline, C, r } from './lib.mjs';
import { svgOpen, goldGrad, taper } from './common.mjs';

const RO = '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
const MU = '@fontsource-variable/mulish/files/mulish-latin-wght-normal.woff2';
let G;
function glyphs() {
  if (G) return G;
  G = outline([
    {
      id: 'mas',
      font: RO,
      axes: { wght: 500, opsz: 144, SOFT: 0, WONK: 0 },
      text: 'MAS',
      size: 104,
      tracking: 70,
    },
    {
      id: 'masK',
      font: RO,
      axes: { wght: 600, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MAS',
      size: 76,
      tracking: 40,
    },
    {
      id: 'mono',
      font: RO,
      axes: { wght: 560, opsz: 24, SOFT: 0, WONK: 0 },
      text: 'MONOGRAMS',
      size: 22,
      tracking: 420,
    },
    {
      id: 'place',
      font: MU,
      axes: { wght: 700 },
      text: 'HAND-STITCHED IN ST. MATTHEWS, SC',
      size: 10.5,
      tracking: 260,
    },
    {
      id: 'word',
      font: RO,
      axes: { wght: 440, opsz: 72, SOFT: 0, WONK: 0 },
      text: 'MONOGRAMS',
      size: 40,
      tracking: 110,
    },
  ]);
  return G;
}

const pal = (dark) =>
  dark
    ? {
        label: C.linen,
        fold: '#E2D9C8',
        edge: '#D9CEB8',
        weave: C.midnight,
        text: C.midnight,
        accent: C.claret,
        stitch: C.claret,
        weftHi: '#fff',
        weftLo: '#6b5a3a',
      }
    : {
        label: C.midnight,
        fold: '#0A1322',
        edge: '#1F3350',
        weave: 'url(#P-g)',
        text: C.goldLight,
        accent: C.gold,
        stitch: C.gold,
        weftHi: '#fff',
        weftLo: '#000',
      };

// Woven text: the glyphs filled with horizontal weft threads (stripes) over a solid base, so
// at size the letters are visibly woven, and small they read solid.
const weftPattern = (id, pitch, k) =>
  `<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="${pitch}">` +
  `<rect width="8" height="${r(pitch * 0.42)}" fill="${k.weftHi}" fill-opacity=".22"/>` +
  `<rect y="${r(pitch * 0.72)}" width="8" height="${r(pitch * 0.2)}" fill="${k.weftLo}" fill-opacity=".28"/></pattern>`;
const labelWeave = (id, k) =>
  `<pattern id="${id}" patternUnits="userSpaceOnUse" width="3" height="2.4">` +
  `<rect width="3" height=".7" fill="${k.weftHi}" fill-opacity="${k.label === C.midnight ? 0.05 : 0.35}"/>` +
  `<rect y="1.4" width="1.4" height=".5" fill="#000" fill-opacity="${k.label === C.midnight ? 0.18 : 0.05}"/></pattern>`;

// The label body with both ends folded under and sewn: fold strips with a shade, a selvedge
// line inset top and bottom, and a row of stitches across each end.
function labelBody(P, { x, y, w, h, k, fold, stitchW }) {
  const sel = h * 0.07;
  const sx1 = x + fold + stitchW * 3.2;
  const sx2 = x + w - fold - stitchW * 3.2;
  const n = Math.max(4, Math.round((h - sel * 2) / (stitchW * 4.2)));
  const pitch = (h - sel * 2.4) / n;
  let st = '';
  for (let i = 0; i < n; i++) {
    const yy = y + sel * 1.2 + i * pitch + pitch * 0.18;
    st += `<path d="${taper([[sx1, yy, sx1, yy + pitch * 0.2, sx1, yy + pitch * 0.45, sx1, yy + pitch * 0.64]], (t) => 0.3 + stitchW * Math.sin(Math.PI * t), 16)}"/>`;
    st += `<path d="${taper([[sx2, yy, sx2, yy + pitch * 0.2, sx2, yy + pitch * 0.45, sx2, yy + pitch * 0.64]], (t) => 0.3 + stitchW * Math.sin(Math.PI * t), 16)}"/>`;
  }
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${k.label}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#P-weave)"/>
  <rect x="${x}" y="${y}" width="${fold}" height="${h}" fill="${k.fold}"/>
  <rect x="${x + w - fold}" y="${y}" width="${fold}" height="${h}" fill="${k.fold}"/>
  <path d="M ${x + fold} ${y} l ${r(-fold * 0.55)} ${h} h ${r(fold * 0.55)} z" fill="#000" fill-opacity=".12"/>
  <path d="M ${x + w - fold} ${y} l ${r(fold * 0.55)} ${h} h ${r(-fold * 0.55)} z" fill="#000" fill-opacity=".12"/>
  <line x1="${x + fold}" y1="${r(y + sel)}" x2="${x + w - fold}" y2="${r(y + sel)}" stroke="${k.edge}" stroke-width="${r(h * 0.012)}"/>
  <line x1="${x + fold}" y1="${r(y + h - sel)}" x2="${x + w - fold}" y2="${r(y + h - sel)}" stroke="${k.edge}" stroke-width="${r(h * 0.012)}"/>
  <g fill="${k.stitch}">${st}</g>`;
}

export function wovenLabel({ dark = false, id = 'c3' } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const W = 640,
    H = 250;
  const x = 10,
    y = 10,
    w = W - 20,
    h = H - 20;
  const cx = W / 2;
  const mx = cx - g.mas.width / 2 + 4;
  const masBase = y + 124;
  return fix(`${svgOpen(W, H, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 90)}${weftPattern('P-weft', 2.6, k)}${labelWeave('P-weave', k)}</defs>
  ${labelBody(id, { x, y, w, h, k, fold: 18, stitchW: 3.1 })}
  <g fill="${k.text}">
    <path transform="translate(${r(mx)} ${masBase})" d="${g.mas.d}"/>
  </g>
  <path transform="translate(${r(mx)} ${masBase})" d="${g.mas.d}" fill="url(#P-weft)"/>
  <g fill="${k.text}"><path transform="translate(${r(cx - g.mono.width / 2 + 4)} ${masBase + 42})" d="${g.mono.d}"/></g>
  <g fill="${k.accent}">
    <path transform="translate(${r(cx - g.place.width / 2 + 1.4)} ${masBase + 76})" d="${g.place.d}"/>
    <path d="M ${cx - 6} ${masBase + 16} l 6 -4 l 6 4 l -6 4 z"/>
  </g>
  <g stroke="${k.accent}" stroke-width="1.4" stroke-linecap="round">
    <line x1="${cx - 150}" y1="${masBase + 16}" x2="${cx - 18}" y2="${masBase + 16}" stroke-dasharray="7 5"/>
    <line x1="${cx + 18}" y1="${masBase + 16}" x2="${cx + 150}" y2="${masBase + 16}" stroke-dasharray="7 5"/>
  </g>
</svg>`);
}

// Compact mark: a small end-folded label with the woven MAS only.
export function labelMark({ dark = false, id = 'c3m' } = {}) {
  const g = glyphs();
  const k = pal(dark);
  const fix = (s) => s.replaceAll('P-', `${id}-`);
  const W = 260,
    H = 160;
  const mx = W / 2 - g.masK.width / 2 + 3;
  return fix(`${svgOpen(W, H, 'MAS Monograms')}
  <defs>${goldGrad('P-g', 90)}${weftPattern('P-weft', 3.4, k)}${labelWeave('P-weave', k)}</defs>
  ${labelBody(id, { x: 4, y: 8, w: W - 8, h: H - 16, k, fold: 16, stitchW: 3.8 })}
  <path transform="translate(${r(mx)} ${H / 2 + 27})" d="${g.masK.d}" fill="${k.text}"/>
  <path transform="translate(${r(mx)} ${H / 2 + 27})" d="${g.masK.d}" fill="url(#P-weft)"/>
</svg>`);
}

// Header lockup: the small label (MAS), then MONOGRAMS in tracked caps, so it reads as one name.
export function labelLockup({ dark = false, id = 'c3h' } = {}) {
  const g = glyphs();
  const kk = pal(dark);
  const mark = labelMark({ dark: !dark ? false : true, id: id + 'k' });
  const inner = mark.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const sc = 92 / 160;
  const wx = 260 * sc + 22;
  return `${svgOpen(wx + g.word.width + 4, 92, 'MAS Monograms')}
  <g transform="scale(${r(sc * 1000) / 1000})">${inner}</g>
  <path transform="translate(${r(wx)} 60)" d="${g.word.d}" fill="${dark ? C.linen : C.midnight}"/>
</svg>`;
}
