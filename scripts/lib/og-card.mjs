// The MAS Monograms social card (1200x630), shared by scripts/generate-og.mjs (the default
// card) and scripts/generate-og-pages.mjs (one card per page). 2026-10-04 logo system: the
// Hoop Seal on a Midnight cloth with a stitched frame, and either the Signature Thread
// wordmark (default card) or the page's own headline from Sanity (page cards).
//
// Text is outlined with opentype.js from static Fraunces instances in scripts/assets/fonts/
// (OFL; cut from @fontsource-variable/fraunces with fontTools), so the card never depends on
// system fonts, and kerning is applied.
import opentype from 'opentype.js';
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sealSvg, wordmarkSvg, DARK } from '../../src/lib/brand/brandSvg.js';

const fontsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts');
const load = (f) => opentype.parse(readFileSync(join(fontsDir, f)).buffer);
const ROMAN = load('Fraunces-Roman-OG.ttf');
const ITALIC = load('Fraunces-Italic-OG.ttf');
const CAPS = load('Fraunces-Caps-OG.ttf');

const W = 1200;
const H = 630;
const MIDNIGHT = '#0F1B2D';
const LINEN = '#F4EEE3';
const GOLD = '#D9B15F';
const GOLD_LIGHT = '#F0D58A';
const MUTED = '#C8C0B0';

/** Outline a line of text: { d, width }. Tracking in em. */
// Path data from opentype.js commands. (Path.toPathData(1) prints some coordinates as "NaN"
// in opentype.js 2.0, and librsvg stops drawing a path at the first bad number, so we format
// the numbers ourselves.)
const n1 = (v) => String(Math.round(v * 10) / 10);
function pathData(p) {
  let d = '';
  for (const c of p.commands) {
    if (c.type === 'M' || c.type === 'L') d += `${c.type}${n1(c.x)} ${n1(c.y)}`;
    else if (c.type === 'Q') d += `Q${n1(c.x1)} ${n1(c.y1)} ${n1(c.x)} ${n1(c.y)}`;
    else if (c.type === 'C')
      d += `C${n1(c.x1)} ${n1(c.y1)} ${n1(c.x2)} ${n1(c.y2)} ${n1(c.x)} ${n1(c.y)}`;
    else if (c.type === 'Z') d += 'Z';
  }
  return d;
}

function line(font, text, size, x, y, tracking = 0) {
  // Glyph by glyph (whitespace only advances), with pair kerning applied by hand.
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let cx = x;
  let d = '';
  glyphs.forEach((g, i) => {
    if (g.unicode !== 32 && g.path?.commands?.length) {
      d += pathData(g.getPath(cx, y, size));
    }
    cx += (g.advanceWidth ?? 0) * scale + tracking * size;
    const next = glyphs[i + 1];
    if (next && !tracking) cx += font.getKerningValue(g, next) * scale;
  });
  return { d, width: cx - x - tracking * size };
}

/** Greedy word wrap by measured width. */
function wrap(font, text, size, maxWidth) {
  // "St. Matthews" never breaks after the abbreviation (a no-break space keeps it together).
  const words = String(text)
    .trim()
    .replace(/\bSt\. /g, 'St.\u00a0')
    .split(/ +/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && font.getAdvanceWidth(next, size, { kerning: true }) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Place an <svg> string inside the card at a box (nested <svg> with its own viewBox).
const place = (svg, x, y, w, h) =>
  svg.replace(/^<svg /, `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

function frame() {
  // Midnight cloth: a faint twill, then a gold running-stitch frame sewn 28px in.
  return (
    `<rect width="${W}" height="${H}" fill="${MIDNIGHT}"/>` +
    `<defs><pattern id="tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<rect width="6" height="1" fill="#F4EEE3" fill-opacity=".035"/></pattern>` +
    `<radialGradient id="glow" cx=".28" cy=".45" r=".6"><stop offset="0" stop-color="#28486B" stop-opacity=".55"/><stop offset="1" stop-color="#28486B" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#glow)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#tw)"/>` +
    `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="6" fill="none" stroke="${GOLD}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="12 9" stroke-linecap="round"/>`
  );
}

function seal() {
  // The full Hoop Seal, dark-ground colours, 430px tall on the left.
  const h = 430;
  const w = (h * 600) / 616;
  return place(
    sealSvg({ idp: 'og', ring: true, cut: 'regular', palette: DARK }),
    92,
    (H - h) / 2 + 6,
    w,
    h,
  );
}

const COL_X = 600;
const COL_W = 520;

function stitchRule(x, y, w = 120) {
  return `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${GOLD}" stroke-width="3" stroke-dasharray="12 8" stroke-linecap="round"/>`;
}

/**
 * Render a card.
 * @param {object} o
 * @param {string} o.outPath
 * @param {string} [o.headline]   page cards: the page's headline (roman)
 * @param {string} [o.italic]     page cards: the italic swash line under it (gold)
 * @param {string} [o.tagline]    default card: the tagline under the wordmark
 * @param {string} [o.place]      the place line, e.g. "St. Matthews, SC"
 */
export async function renderCard({ outPath, headline, italic, tagline, place: where }) {
  let body = '';
  if (headline) {
    // Fit the headline into at most three lines, shrinking from 66px.
    let size = 66;
    let lines = wrap(ROMAN, headline, size, COL_W);
    const italLines = () => (italic ? wrap(ITALIC, italic, size, COL_W) : []);
    while (lines.length + italLines().length > 4 && size > 44) {
      size -= 4;
      lines = wrap(ROMAN, headline, size, COL_W);
    }
    const all = [
      ...lines.map((t) => ({ t, f: ROMAN, c: LINEN })),
      ...italLines().map((t) => ({ t, f: ITALIC, c: GOLD_LIGHT })),
    ];
    const lh = size * 1.12;
    const blockH = 19 + 34 + all.length * lh + 30 + 22;
    let y = (H - blockH) / 2 + 19;
    body += `<path d="${line(CAPS, 'MAS MONOGRAMS', 19, COL_X, y, 0.26).d}" fill="${GOLD}"/>`;
    y += 34 + size * 0.86;
    for (const l of all) {
      body += `<path d="${line(l.f, l.t, size, COL_X, y).d}" fill="${l.c}"/>`;
      y += lh;
    }
    y += 6;
    body += stitchRule(COL_X, y);
    if (where)
      body += `<path d="${line(ROMAN, where, 24, COL_X + 140, y + 8).d}" fill="${MUTED}"/>`;
  } else {
    // Default card: the wordmark, the tagline, the place.
    const wm = wordmarkSvg({ idp: 'ogw', cut: 'display', palette: DARK });
    const vb = wm
      .match(/viewBox="([^"]+)"/)[1]
      .split(' ')
      .map(Number);
    const ww = COL_W;
    const wh = (ww * vb[3]) / vb[2];
    const tl = tagline ? wrap(ROMAN, tagline, 34, COL_W) : [];
    const blockH = wh + 40 + tl.length * 44 + (where ? 70 : 0);
    let y = (H - blockH) / 2;
    body += place(wm, COL_X, y, ww, wh);
    y += wh + 40 + 30;
    for (const t of tl) {
      body += `<path d="${line(ROMAN, t, 34, COL_X, y).d}" fill="${LINEN}"/>`;
      y += 44;
    }
    // The place line, unless the tagline already names it.
    if (where && !String(tagline ?? '').includes(where.split(',')[0])) {
      y += 14;
      body += stitchRule(COL_X, y - 8);
      body += `<path d="${line(ROMAN, where, 24, COL_X + 140, y).d}" fill="${MUTED}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frame()}${seal()}${body}</svg>`;
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}
