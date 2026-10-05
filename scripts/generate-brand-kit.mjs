// Draws Mary Ann's brand kit into public/brand-kit/ (2026-10-05, Phase F of
// docs/superpowers/specs/2026-10-05-studio-direction.md). Re-runnable:
//
//   npm run brand-kit        (this script, then scripts/build-brand-kit-zip.mjs)
//
// Every file is drawn from the same code as the site's logo (src/lib/brand/brandSvg.js,
// outlined geometry, so no fonts are needed for the logos) and rasterised with sharp, like
// scripts/generate-favicons.mjs and the OG cards. Words on the pictures are outlined with
// opentype.js from the kit's own font files (scripts/assets/brand-kit-fonts/, built by
// scripts/build-brand-kit-fonts.py), so nothing depends on fonts installed on this machine.
//
// What it writes (the list, the titles and the exact sizes live in src/lib/brand/brandKit.ts):
//   logos/      the Hoop Seal (full), the small Hoop Seal and the thread wordmark, each in four
//               colorways (color for light, color for dark, one color Midnight, one color
//               white) as SVG, a 2000px PNG and a 512px PNG, all on transparent backgrounds
//   social/     profile pictures, Facebook covers, Instagram highlight covers, Pinterest board
//               covers, Google logo and cover, the email-signature logo
//   print/      the table sign (Letter and A4) and the one-page brand sheet, as 300 dpi PNG
//               and a PDF of the exact paper size (scripts/lib/pdf-image.mjs)
//   fonts/      the installable fonts and their licences (copied from scripts/assets/)
//   colors/     the colors as a text list, a CSV and an Adobe swatch file (.ase)
//   specimens/  font specimen pictures for the Studio pane (not in the ZIP)
//   src/lib/brand/brandKitManifest.json   the tagline used and every file's size, for the pane
//
// The tagline is read from Site settings in Sanity (published), falling back to the committed
// manifest's last value, so the kit never invents copy. Output is committed: the site build
// and CI need nothing from here. The ZIP is built by scripts/build-brand-kit-zip.mjs.
import sharp from 'sharp';
import opentype from 'opentype.js';
import { createClient } from '@sanity/client';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sealSvg, wordmarkSvg, LIGHT, DARK } from '../src/lib/brand/brandSvg.js';
import {
  BRAND_COLORS,
  BRAND_FONTS,
  COLORWAYS,
  GOLD_THREAD,
  HIGHLIGHTS,
  KIT_IMAGES,
  KIT_PRINTS,
  LOGOS,
  LOGO_PNG_WIDTH,
  LOGO_RULES,
  LOGO_SMALL_WIDTH,
  SIGN_QR_INCHES,
  SIGN_QR_LABEL,
  cmykText,
  logoFile,
  rgbText,
} from '../src/lib/brand/brandKit.ts';
import { imagePdf } from './lib/pdf-image.mjs';
import { loadEnv } from './lib/loadEnv.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const fontsSrc = join(root, 'scripts/assets/brand-kit-fonts');
const manifestPath = join(root, 'src/lib/brand/brandKitManifest.json');

const C = Object.fromEntries(BRAND_COLORS.map((c) => [c.id, c.hex]));
const WHITE = '#FFFFFF';
const TAUPE = '#5A5148';

// ── Words: the tagline from Site settings ───────────────────────────────────

const FALLBACK_TAGLINE =
  'Hand-stitched monograms and embroidery, made locally in St. Matthews, SC.';
async function readTagline() {
  let committed = FALLBACK_TAGLINE;
  if (existsSync(manifestPath)) {
    committed = JSON.parse(readFileSync(manifestPath, 'utf8')).tagline ?? committed;
  }
  const env = loadEnv(root);
  if (!env.PUBLIC_SANITY_PROJECT_ID) return { tagline: committed, source: 'committed' };
  try {
    const client = createClient({
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
      useCdn: true,
      perspective: 'published',
    });
    const t = await client.fetch(`*[_type == "siteSettings"][0].tagline`);
    if (typeof t === 'string' && t.trim()) return { tagline: t.trim(), source: 'sanity' };
  } catch (e) {
    console.warn(`Sanity unreachable (${e.message}); using the committed tagline`);
  }
  return { tagline: committed, source: 'committed' };
}

// ── Text outlined from the kit fonts ────────────────────────────────────────

const loadFont = (f) => opentype.parse(readFileSync(join(fontsSrc, f)).buffer);
const F = {
  serif: loadFont('Fraunces-Regular.ttf'),
  serifSemi: loadFont('Fraunces-SemiBold.ttf'),
  italic: loadFont('Fraunces-Italic.ttf'),
  sans: loadFont('Mulish-Regular.ttf'),
  sansBold: loadFont('Mulish-Bold.ttf'),
  script: loadFont('Petemoss-Regular.ttf'),
};

const n1 = (v) => String(Math.round(v * 10) / 10);

// One glyph per character, no OpenType substitutions: opentype.js 2.0 throws on some of the
// fonts' contextual lookups (Fraunces "ccmp"), and nothing here needs ligatures.
const glyphsOf = (font, str) => Array.from(str).map((ch) => font.charToGlyph(ch));
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

/** Width of a line of text at a size, with kerning and tracking (em). */
function measure(font, str, size, tracking = 0) {
  const glyphs = glyphsOf(font, str);
  const scale = size / font.unitsPerEm;
  let w = 0;
  glyphs.forEach((g, i) => {
    w += (g.advanceWidth ?? 0) * scale + (i < glyphs.length - 1 ? tracking * size : 0);
    const next = glyphs[i + 1];
    if (next && !tracking) w += font.getKerningValue(g, next) * scale;
  });
  return w;
}

/** One line of outlined text: a <path>. anchor: start | middle | end. */
function text(font, str, size, x, y, { fill = C.ink, anchor = 'start', tracking = 0 } = {}) {
  const w = measure(font, str, size, tracking);
  let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const glyphs = glyphsOf(font, str);
  const scale = size / font.unitsPerEm;
  let d = '';
  glyphs.forEach((g, i) => {
    if (g.unicode !== 32 && g.path?.commands?.length) d += pathData(g.getPath(cx, y, size));
    cx += (g.advanceWidth ?? 0) * scale + tracking * size;
    const next = glyphs[i + 1];
    if (next && !tracking) cx += font.getKerningValue(g, next) * scale;
  });
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Greedy word wrap by measured width. "St. Matthews" never breaks. */
function wrap(font, str, size, maxWidth) {
  const words = String(str)
    .trim()
    .replace(/\bSt\. /g, 'St. ')
    .split(/ +/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(font, next, size) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Wrap into the fewest lines, then even them out (no one-word last line). */
function balancedWrap(font, str, size, maxWidth) {
  const n = wrap(font, str, size, maxWidth).length;
  let lo = 0;
  let hi = maxWidth;
  while (hi - lo > 2) {
    const mid = (lo + hi) / 2;
    if (wrap(font, str, size, mid).length > n) lo = mid;
    else hi = mid;
  }
  return wrap(font, str, size, hi);
}

/** Wrapped, centred paragraph; returns { svg, height }. */
function para(font, str, size, cx, y, maxWidth, { fill = C.ink, lh = 1.3 } = {}) {
  const lines = balancedWrap(font, str, size, maxWidth);
  const svg = lines
    .map((l, i) => text(font, l, size, cx, y + i * size * lh, { fill, anchor: 'middle' }))
    .join('');
  return { svg, height: lines.length * size * lh, lines: lines.length };
}

// ── Drawing helpers ─────────────────────────────────────────────────────────

const vbOf = (svg) =>
  svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(' ')
    .map(Number);

/** Place an <svg> string inside another at a box. */
const place = (svg, x, y, w, h) =>
  svg.replace(/^<svg /, `<svg x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" `);

/** A drawing w by h (pixels), with a ground. */
const canvas = (w, h, inner, ground) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (ground ? `<rect width="${w}" height="${h}" fill="${ground}"/>` : '') +
  inner +
  '</svg>';

/** Midnight cloth: a faint twill and an indigo glow (the OG card's ground). */
function midnightCloth(w, h, id = 'c', glowAt = '.5 .45') {
  const [gx, gy] = glowAt.split(' ');
  return (
    `<rect width="${w}" height="${h}" fill="${C.midnight}"/>` +
    `<defs><pattern id="${id}tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<rect width="6" height="1" fill="${C.linen}" fill-opacity=".035"/></pattern>` +
    `<radialGradient id="${id}gl" cx="${gx}" cy="${gy}" r=".6"><stop offset="0" stop-color="${C.indigo}" stop-opacity=".55"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#${id}gl)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#${id}tw)"/>`
  );
}

/** A running stitch line (dashes with round ends). */
const stitchLine = (x1, y1, x2, y2, color, width, dash = 12, gap = 9) =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash} ${gap}" stroke-linecap="round"/>`;

/** One-color palette: every paint the same hex. */
const mono = (hex) => Object.fromEntries(Object.keys(LIGHT).map((k) => [k, hex]));

const PALETTE = {
  'color-light': LIGHT,
  'color-dark': DARK,
  'one-color-midnight': mono(C.midnight),
  'one-color-white': mono(WHITE),
};

/** A logo's standalone SVG for a colorway. */
function logoSvg(logo, way, idp = 'k') {
  const palette = PALETTE[way];
  const flat = way.startsWith('one-color');
  const title = 'MAS Monograms';
  if (logo === 'seal') return sealSvg({ idp, ring: true, cut: 'regular', palette, flat, title });
  if (logo === 'mark') return sealSvg({ idp, cut: 'bold', palette, flat, title });
  return wordmarkSvg({ idp, cut: 'display', palette, title });
}

// ── Output plumbing ─────────────────────────────────────────────────────────

const written = [];
function out(publicPath) {
  const abs = join(pub, publicPath);
  mkdirSync(dirname(abs), { recursive: true });
  return abs;
}
function save(publicPath, data) {
  writeFileSync(out(publicPath), data);
  written.push(publicPath);
}
async function png(publicPath, svg, { palette = false } = {}) {
  const s = sharp(Buffer.from(svg), { limitInputPixels: false });
  const buf = await (
    palette
      ? s.png({ palette: true, quality: 95, compressionLevel: 9, effort: 10 })
      : s.png({ compressionLevel: 9, adaptiveFiltering: true })
  ).toBuffer();
  save(publicPath, buf);
  return buf;
}

/**
 * Midnight-cloth pictures (twill and glow) are saved as 256-colour palette PNGs with
 * dithering: about a third of the size, and the difference is not visible at social sizes.
 */
const Q = { palette: true };

/** A logo rasterised to a width, with a 4% transparent margin round it. */
async function logoPng(publicPath, svg, outW) {
  const [, , vw, vh] = vbOf(svg);
  const pad = Math.round(outW * 0.04);
  const iw = outW - 2 * pad;
  const ih = Math.round((iw * vh) / vw);
  const buf = await sharp(Buffer.from(svg), { density: (72 * iw) / vw })
    .resize(iw, ih, { fit: 'fill' })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  save(publicPath, buf);
}

// ── 1. Logos ────────────────────────────────────────────────────────────────

async function logos() {
  for (const logo of LOGOS) {
    for (const way of COLORWAYS) {
      const svg = logoSvg(logo.id, way.id);
      save(logoFile(logo.id, way.id, 'svg'), svg + '\n');
      await logoPng(logoFile(logo.id, way.id, 'png'), svg, LOGO_PNG_WIDTH);
      await logoPng(logoFile(logo.id, way.id, 'small'), svg, LOGO_SMALL_WIDTH);
    }
  }
}

// ── 2. Profile pictures and logos for profiles ──────────────────────────────

/** The small Hoop Seal centred on its hoop (not its box), sized by its radius incl. clasp. */
function markCentred(cx, cy, reach, palette, idp) {
  // Mark box 200x200; hoop centre (100,110); the clasp reaches 98 units above it.
  const s = reach / 98;
  return place(
    sealSvg({ idp, cut: 'bold', palette }),
    cx - 100 * s,
    cy - 110 * s + reach * 0.05,
    200 * s,
    200 * s,
  );
}
function sealCentred(cx, cy, reach, palette, idp) {
  // Seal box 600x616; hoop centre (300,328); the clasp reaches 294 units above it.
  const s = reach / 294;
  return place(
    sealSvg({ idp, ring: true, cut: 'regular', palette }),
    cx - 300 * s,
    cy - 328 * s + reach * 0.03,
    600 * s,
    616 * s,
  );
}

async function profiles() {
  const W = 1080;
  const mid = canvas(W, W, midnightCloth(W, W, 'p') + markCentred(540, 540, 440, DARK, 'pm'));
  const lin = canvas(W, W, markCentred(540, 540, 440, LIGHT, 'pl'), C.linen);
  const full = canvas(W, W, midnightCloth(W, W, 'f') + sealCentred(540, 540, 455, DARK, 'pf'));
  await png(imgFile('profile-midnight'), mid, Q);
  await png(imgFile('profile-linen'), lin);
  await png(imgFile('profile-seal'), full, Q);
  const g = 720;
  await png(
    imgFile('google-logo'),
    canvas(g, g, midnightCloth(g, g, 'g') + markCentred(360, 360, 290, DARK, 'gm')),
    Q,
  );
}

const imgFile = (id) => {
  const i = KIT_IMAGES.find((x) => x.id === id);
  if (!i) throw new Error(`no kit image ${id}`);
  return i.file.replace(/^\//, '');
};
const printFile = (id, kind) => {
  const p = KIT_PRINTS.find((x) => x.id === id);
  return p[kind].replace(/^\//, '');
};

// ── 3. Covers ───────────────────────────────────────────────────────────────

/** Wordmark + tagline centred in a band: returns svg. */
function wordmarkBlock(cx, cy, wordW, tagline, tagSize, maxTagW, palette, tagFill, idp) {
  const wm = wordmarkSvg({ idp, cut: 'display', palette });
  const [, , vw, vh] = vbOf(wm);
  const wh = (wordW * vh) / vw;
  const lines = balancedWrap(F.serif, tagline, tagSize, maxTagW);
  const lh = tagSize * 1.3;
  const gap = tagSize * 1.25;
  const blockH = wh + gap + lines.length * lh;
  const top = cy - blockH / 2;
  let svg = place(wm, cx - wordW / 2, top, wordW, wh);
  lines.forEach((l, i) => {
    svg += text(F.serif, l, tagSize, cx, top + wh + gap + tagSize * 0.8 + i * lh, {
      fill: tagFill,
      anchor: 'middle',
    });
  });
  return svg;
}

async function covers(tagline) {
  // Facebook: 1640x624. Phones show only the middle 16:9 (about 1110px wide) and the profile
  // picture overlaps the bottom left on a computer, so everything sits in the centre 960px.
  const fb = (W, H) => {
    const k = W / 1640;
    const inner =
      midnightCloth(W, H, 'fb', '.5 .5') +
      stitchLine(0, 34 * k, W, 34 * k, C.gold, 3 * k, 12 * k, 9 * k) +
      stitchLine(0, H - 34 * k, W, H - 34 * k, C.gold, 3 * k, 12 * k, 9 * k) +
      wordmarkBlock(W / 2, H / 2 - 6 * k, 760 * k, tagline, 34 * k, 760 * k, DARK, C.linen, 'fbw');
    return canvas(W, H, inner);
  };
  await png(imgFile('facebook-cover'), fb(1640, 624), Q);
  await png(imgFile('facebook-cover-small'), fb(820, 312), Q);

  // Google cover 1080x608: Google crops it differently in Search, Maps and the app, so the
  // seal and name sit together in the middle 70%.
  const GW = 1080;
  const GH = 608;
  const reach = 150;
  const wordW = 520;
  const groupW = reach * 2 + 50 + wordW;
  const x0 = (GW - groupW) / 2;
  const gInner =
    midnightCloth(GW, GH, 'gc', '.5 .5') +
    markCentred(x0 + reach, GH / 2 - 10, reach, DARK, 'gcm') +
    wordmarkBlock(
      x0 + reach * 2 + 50 + wordW / 2,
      GH / 2 - 4,
      wordW,
      tagline,
      25,
      wordW,
      DARK,
      C.linen,
      'gcw',
    );
  await png(imgFile('google-cover'), canvas(GW, GH, gInner), Q);
}

// ── 4. Icons (line drawings in a 200 box, for highlights and boards) ────────

const ICONS = {
  // Two folded towels, each with a stitched band.
  towels: (s) =>
    `<rect x="44" y="58" width="112" height="44" rx="9" ${s}/>` +
    `<rect x="32" y="102" width="136" height="54" rx="10" ${s}/>` +
    `<path d="M44 80 H156" ${s} stroke-dasharray="7 7"/>` +
    `<path d="M32 132 H168" ${s} stroke-dasharray="7 7"/>`,
  // A tote with two handles and a little hoop on the front.
  totes: (s) =>
    `<path d="M46 78 H154 L146 170 H54 Z" ${s}/>` +
    `<path d="M74 78 V64 C74 30 126 30 126 64 V78" ${s}/>` +
    `<circle cx="100" cy="124" r="22" ${s}/>` +
    `<circle cx="100" cy="124" r="13" ${s} style="stroke-width:3" stroke-dasharray="4 5"/>`,
  // A baby onesie with a stitched heart.
  baby: (s) =>
    `<path d="M78 38 C84 52 116 52 122 38 L150 50 L168 80 L146 92 L138 80 V136 C138 152 126 166 112 170 H88 C74 166 62 152 62 136 V80 L54 92 L32 80 L50 50 Z" ${s}/>` +
    `<path d="M100 132 C84 120 80 104 90 99 C95 96 100 100 100 105 C100 100 105 96 110 99 C120 104 116 120 100 132 Z" ${s} style="stroke-width:5"/>`,
  // A cap: the crown, the brim and the button.
  hats: (s) =>
    `<path d="M40 136 C40 88 66 66 100 66 C134 66 156 88 156 136 Z" ${s}/>` +
    `<path d="M120 136 H176 C184 136 184 152 174 152 H40" ${s}/>` +
    `<path d="M100 66 V136" ${s} style="stroke-width:3" stroke-dasharray="5 6"/>` +
    `<circle cx="100" cy="62" r="6" ${s}/>`,
  // A wooden spool wound with thread, its loose end running to a needle (anything you dream up).
  custom: (s, ground) =>
    `<path d="M40 44 H128 M40 160 H128" ${s} style="stroke-width:12"/>` +
    `<path d="M52 50 V154 M116 50 V154" ${s}/>` +
    `<path d="M54 64 L114 76 M54 82 L114 94 M54 100 L114 112 M54 118 L114 130 M54 136 L114 148" ${s} style="stroke-width:4"/>` +
    `<path d="M116 132 C140 134 152 112 156 78" ${s} style="stroke-width:4" stroke-dasharray="8 7"/>` +
    `<path d="M163 34 L153 172" ${s}/>` +
    `<ellipse cx="161.6" cy="52" rx="1.6" ry="7" transform="rotate(4 161.6 52)" fill="${ground}" stroke="none"/>`,
};
const iconSvg = (id, color, width = 7, ground = C.midnight) => {
  const s = `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${ICONS[id](s, ground)}</svg>`;
};

async function highlights() {
  // 1080x1920; Instagram shows the middle as a circle, so the icon sits in a gold hoop there.
  const W = 1080;
  const H = 1920;
  for (const h of HIGHLIGHTS) {
    const inner =
      midnightCloth(W, H, 'h', '.5 .5') +
      `<circle cx="540" cy="960" r="400" fill="none" stroke="${C.gold}" stroke-width="10"/>` +
      `<circle cx="540" cy="960" r="372" fill="none" stroke="${C.gold}" stroke-opacity=".55" stroke-width="4" stroke-dasharray="16 14" stroke-linecap="round"/>` +
      place(iconSvg(h.id, C['gold-light'], 7), 540 - 280, 960 - 280, 560, 560);
    await png(imgFile(`highlight-${h.id}`), canvas(W, H, inner), Q);
  }
}

async function boards() {
  const W = 600;
  for (const h of [...HIGHLIGHTS, { id: 'blank', label: '' }]) {
    let inner = `<rect x="22" y="22" width="556" height="556" rx="6" fill="none" stroke="${C.indigo}" stroke-opacity=".5" stroke-width="2.5" stroke-dasharray="12 9" stroke-linecap="round"/>`;
    if (h.id === 'blank') {
      inner += markCentred(300, 300, 175, LIGHT, 'bb');
    } else {
      inner += place(iconSvg(h.id, C.indigo, 6, C.linen), 150, 92, 300, 300);
      inner += text(F.serif, h.label, 64, 300, 470, { fill: C.ink, anchor: 'middle' });
      inner += stitchLine(240, 506, 360, 506, C['gold-deep'], 3, 10, 8);
    }
    await png(imgFile(`pinterest-${h.id}`), canvas(W, W, inner, C.linen));
  }
}

// ── 5. Email signature ──────────────────────────────────────────────────────

async function emailSignature() {
  // 600x150 (shown at 300x75): the small seal beside the wordmark, on white (most email is
  // white, and a solid ground survives mail apps that drop transparency). Palette PNG, < 30 KB.
  const W = 600;
  const H = 150;
  const reach = 62;
  const wm = wordmarkSvg({ idp: 'es', cut: 'header', palette: LIGHT });
  const [, , vw, vh] = vbOf(wm);
  const ww = 410;
  const wh = (ww * vh) / vw;
  const gx = (W - (reach * 2 + 24 + ww)) / 2;
  const inner =
    markCentred(gx + reach, H / 2, reach, LIGHT, 'esm') +
    place(wm, gx + reach * 2 + 24, (H - wh) / 2, ww, wh);
  const buf = await png(imgFile('email-signature'), canvas(W, H, inner, WHITE), { palette: true });
  if (buf.length > 30 * 1024) throw new Error(`email signature is ${buf.length} bytes (> 30 KB)`);
}

// ── 6. Printables (300 dpi) ─────────────────────────────────────────────────

const DPI = 300;

function tableSign(W, H, tagline) {
  const cx = W / 2;
  const qr = SIGN_QR_INCHES * DPI;
  let y = H * 0.075;
  // A running-stitch border half an inch in, so the printed sheet looks finished.
  const inset = DPI / 2;
  let inner = `<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" rx="30" fill="none" stroke="${C.indigo}" stroke-opacity=".55" stroke-width="6" stroke-dasharray="30 22" stroke-linecap="round"/>`;
  const sealW = 1150;
  const sealH = (sealW * 616) / 600;
  inner += place(
    sealSvg({ idp: 'ts', ring: true, cut: 'regular', palette: LIGHT }),
    cx - sealW / 2,
    y,
    sealW,
    sealH,
  );
  y += sealH + 70;
  const wm = wordmarkSvg({ idp: 'tw', cut: 'display', palette: LIGHT });
  const [, , vw, vh] = vbOf(wm);
  const ww = 1500;
  const wh = (ww * vh) / vw;
  inner += place(wm, cx - ww / 2, y, ww, wh);
  y += wh + 150;
  const p = para(F.serif, tagline, 66, cx, y, 1900, { fill: C.ink, lh: 1.32 });
  inner += p.svg;
  y += p.height;
  // The QR square: centred in the space that is left inside the border.
  const qy = y + (H - inset - y - qr) / 2;
  inner +=
    `<rect x="${cx - qr / 2}" y="${n1(qy)}" width="${qr}" height="${qr}" rx="24" fill="${WHITE}" stroke="${C.indigo}" stroke-width="6" stroke-dasharray="26 18" stroke-linecap="round"/>` +
    text(F.sans, SIGN_QR_LABEL, 50, cx, qy + qr / 2 + 18, { fill: TAUPE, anchor: 'middle' });
  return canvas(W, H, inner, WHITE);
}

function brandSheet(tagline) {
  const W = 2550;
  const H = 3300;
  const M = 170;
  let inner = '';
  let y = M + 40;
  inner += text(F.serif, 'MAS Monograms', 120, M, y + 60, { fill: C.ink });
  inner += text(F.sans, 'My brand on one page', 46, W - M, y + 50, { fill: TAUPE, anchor: 'end' });
  y += 110;
  inner += stitchLine(M, y, W - M, y, C['gold-deep'], 4, 14, 10);
  y += 50;
  inner += text(F.italic, tagline, 50, M, y + 40, { fill: C.indigo });
  y += 110;

  // Logos: seal on white, seal on Midnight, wordmark on white.
  const tileH = 620;
  const tileW = (W - 2 * M - 2 * 50) / 3;
  const tiles = [
    {
      ground: C.paper,
      svg: sealSvg({ idp: 'b1', ring: true, cut: 'regular', palette: LIGHT }),
      kind: 'seal',
    },
    {
      ground: C.midnight,
      svg: sealSvg({ idp: 'b2', ring: true, cut: 'regular', palette: DARK }),
      kind: 'seal',
    },
    {
      ground: C.paper,
      svg: wordmarkSvg({ idp: 'b3', cut: 'display', palette: LIGHT }),
      kind: 'word',
    },
  ];
  tiles.forEach((t, i) => {
    const x = M + i * (tileW + 50);
    inner += `<rect x="${n1(x)}" y="${y}" width="${n1(tileW)}" height="${tileH}" rx="14" fill="${t.ground}" stroke="${C.indigo}" stroke-opacity=".2" stroke-width="3"/>`;
    const [, , vw, vh] = vbOf(t.svg);
    const maxW = tileW - 120;
    const maxH = tileH - 120;
    const s = Math.min(maxW / vw, maxH / vh);
    inner += place(t.svg, x + (tileW - vw * s) / 2, y + (tileH - vh * s) / 2, vw * s, vh * s);
  });
  y += tileH + 40;
  inner += text(F.sans, LOGO_RULES.clearSpace, 34, M, y + 30, { fill: C.ink });
  y += 52;
  for (const rule of LOGO_RULES.minimumSizes) {
    inner += text(F.sans, rule, 34, M, y + 30, { fill: C.ink });
    y += 52;
  }
  y += 58;

  // Colors: a grid of swatches, 4 across.
  inner += text(F.serif, 'My colors', 70, M, y + 50, { fill: C.ink });
  inner += text(
    F.sans,
    'CMYK values are approximate: ask your printer to match the color code.',
    32,
    W - M,
    y + 48,
    {
      fill: TAUPE,
      anchor: 'end',
    },
  );
  y += 100;
  const cols = 4;
  const cw = (W - 2 * M - (cols - 1) * 40) / cols;
  const sw = 150;
  const ch = 270;
  BRAND_COLORS.forEach((c, i) => {
    const x = M + (i % cols) * (cw + 40);
    const yy = y + Math.floor(i / cols) * (ch + 30);
    inner += `<rect x="${n1(x)}" y="${yy}" width="${n1(cw)}" height="${sw}" rx="12" fill="${c.hex}" stroke="${C.ink}" stroke-opacity=".18" stroke-width="2"/>`;
    inner += text(F.sansBold, c.name, 36, x, yy + sw + 48, { fill: C.ink });
    inner += text(F.sans, `${c.hex}   RGB ${rgbText(c.hex)}`, 28, x, yy + sw + 88, { fill: C.ink });
    inner += text(F.sans, cmykText(c.hex), 28, x, yy + sw + 122, { fill: TAUPE });
  });
  y += Math.ceil(BRAND_COLORS.length / cols) * (ch + 30) + 10;
  // The gold thread gradient.
  const stops = GOLD_THREAD.stops
    .map((s) => `<stop offset="${s.at / 100}" stop-color="${s.hex}"/>`)
    .join('');
  inner += `<defs><linearGradient id="bgold">${stops}</linearGradient></defs>`;
  inner += `<rect x="${M}" y="${y}" width="${W - 2 * M}" height="90" rx="12" fill="url(#bgold)"/>`;
  inner += text(
    F.sansBold,
    `${GOLD_THREAD.name}: ${GOLD_THREAD.stops
      .slice(0, 3)
      .map((s) => s.hex)
      .join(' to ')} and back`,
    32,
    M + 30,
    y + 58,
    {
      fill: C.midnight,
    },
  );
  y += 170;

  // Fonts.
  inner += text(F.serif, 'My fonts', 70, M, y + 50, { fill: C.ink });
  y += 110;
  const fontFaces = { fraunces: F.serif, mulish: F.sans, petemoss: F.script };
  for (const f of BRAND_FONTS) {
    inner += text(F.sansBold, `${f.name}: ${f.role}`, 34, M, y + 30, { fill: TAUPE });
    const size = f.id === 'petemoss' ? 110 : 76;
    inner += text(fontFaces[f.id], f.specimen, size, M + 640, y + 40, { fill: C.ink });
    y += f.id === 'petemoss' ? 130 : 110;
  }
  inner += text(
    F.sans,
    'If a program does not have them: Georgia for headings, Arial for everything else.',
    32,
    M,
    y + 20,
    {
      fill: TAUPE,
    },
  );
  if (y + 60 > H - 60) throw new Error(`brand sheet overflows (${y})`);
  return canvas(W, H, inner, WHITE);
}

async function printable(id, svg, W, H, pageW, pageH, title) {
  const buf = await png(printFile(id, 'png'), svg);
  const { data, info } = await sharp(buf)
    .flatten({ background: WHITE })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`${id}: ${info.width}x${info.height}`);
  save(printFile(id, 'pdf'), imagePdf({ rgb: data, width: W, height: H, pageW, pageH, title }));
}

async function prints(tagline) {
  await printable(
    'table-sign-letter',
    tableSign(2550, 3300, tagline),
    2550,
    3300,
    612,
    792,
    'MAS Monograms table sign',
  );
  await printable(
    'table-sign-a4',
    tableSign(2480, 3508, tagline),
    2480,
    3508,
    595.28,
    841.89,
    'MAS Monograms table sign (A4)',
  );
  await printable(
    'brand-sheet',
    brandSheet(tagline),
    2550,
    3300,
    612,
    792,
    'MAS Monograms brand sheet',
  );
}

// ── 7. Fonts, colors, specimens ─────────────────────────────────────────────

function fonts() {
  const pkg = {
    fraunces: '@fontsource-variable/fraunces',
    mulish: '@fontsource-variable/mulish',
    petemoss: '@fontsource/petemoss',
  };
  for (const f of BRAND_FONTS) {
    for (const file of f.files) {
      const name = file.file.split('/').pop();
      copyFileSync(join(fontsSrc, name), out(file.file.replace(/^\//, '')));
      written.push(file.file.replace(/^\//, ''));
    }
    // The licence, verbatim from the package it was built from (OFL: it must travel with the fonts).
    const lic = readFileSync(join(root, 'node_modules', pkg[f.id], 'LICENSE'), 'utf8');
    if (!lic.includes('SIL OPEN FONT LICENSE Version 1.1')) throw new Error(`${f.id}: not OFL 1.1`);
    if (!lic.includes(f.copyright))
      throw new Error(`${f.id}: copyright line changed: check brandKit.ts`);
    save(f.license.replace(/^\//, ''), lic.replace(/\r?\n/g, '\r\n'));
  }
}

/** Adobe Swatch Exchange (.ase): a header, then one RGB colour block per swatch. */
function aseFile() {
  const blocks = [...BRAND_COLORS.map((c) => ({ name: c.name, hex: c.hex }))].map(
    ({ name, hex }) => {
      const nm = Buffer.from(`${name}\0`, 'utf16le').swap16();
      const body = Buffer.alloc(2 + nm.length + 4 + 12 + 2);
      let o = 0;
      body.writeUInt16BE(name.length + 1, o);
      o += 2;
      nm.copy(body, o);
      o += nm.length;
      body.write('RGB ', o, 'latin1');
      o += 4;
      for (const i of [1, 3, 5]) {
        body.writeFloatBE(parseInt(hex.slice(i, i + 2), 16) / 255, o);
        o += 4;
      }
      body.writeUInt16BE(2, o); // normal (not global or spot)
      const head = Buffer.alloc(6);
      head.writeUInt16BE(0x0001, 0);
      head.writeUInt32BE(body.length, 2);
      return Buffer.concat([head, body]);
    },
  );
  const header = Buffer.alloc(12);
  header.write('ASEF', 0, 'latin1');
  header.writeUInt16BE(1, 4);
  header.writeUInt16BE(0, 6);
  header.writeUInt32BE(blocks.length, 8);
  return Buffer.concat([header, ...blocks]);
}

function colors() {
  const lines = [
    'MAS Monograms: my colors',
    '',
    'CMYK numbers are approximate (worked out from the color code with the plain textbook formula).',
    'For printing, ask the printer to match the color code (hex) or show you a printed proof.',
    '',
  ];
  for (const c of BRAND_COLORS) {
    lines.push(c.name);
    lines.push(`  Color code (hex): ${c.hex}`);
    lines.push(`  RGB: ${rgbText(c.hex)}`);
    lines.push(`  CMYK (approximate): ${cmykText(c.hex)}`);
    lines.push(`  Use it for: ${c.useFor}`);
    lines.push('');
  }
  lines.push(GOLD_THREAD.name);
  lines.push(`  A gradient: ${GOLD_THREAD.stops.map((s) => `${s.hex} at ${s.at}%`).join(', ')}`);
  lines.push(`  ${GOLD_THREAD.useFor}`);
  save('brand-kit/colors/mas-monograms-colors.txt', lines.join('\r\n') + '\r\n');
  const csv = ['Name,Hex,R,G,B,C (approx),M (approx),Y (approx),K (approx),Use it for'];
  for (const c of BRAND_COLORS) {
    const rgb = rgbText(c.hex).split(', ');
    const cmyk = cmykText(c.hex).match(/\d+/g);
    csv.push([c.name, c.hex, ...rgb, ...cmyk, `"${c.useFor.replace(/"/g, '""')}"`].join(','));
  }
  save('brand-kit/colors/mas-monograms-colors.csv', csv.join('\r\n') + '\r\n');
  save('brand-kit/colors/mas-monograms-colors.ase', aseFile());
}

async function specimens() {
  // For the pane: each font's specimen line as an outlined SVG (the Studio does not load the
  // site's fonts, and an image needs no font request or CSP grant).
  const faces = { fraunces: F.serif, mulish: F.sans, petemoss: F.script };
  for (const f of BRAND_FONTS) {
    const size = f.id === 'petemoss' ? 120 : 72;
    const w = Math.ceil(measure(faces[f.id], f.specimen, size)) + 20;
    const h = Math.round(size * 1.45);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${f.specimen}">` +
      text(faces[f.id], f.specimen, size, 10, size * (f.id === 'petemoss' ? 0.95 : 1.05), {
        fill: C.ink,
      }) +
      '</svg>';
    save(`brand-kit/specimens/${f.id}.svg`, svg + '\n');
  }
}

// ── 8. Checks and the manifest ──────────────────────────────────────────────

/** Fail if any art in a square profile picture would be cut off by a circle crop. */
async function circleSafe(id) {
  const file = join(pub, imgFile(id));
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const c = W / 2;
  const at = (x, y) => (y * W + x) * 3;
  // The ground is whatever the four corners are.
  const g = [data[at(2, 2)], data[at(2, 2) + 1], data[at(2, 2) + 2]];
  let maxR = 0;
  for (let y = 0; y < W; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = at(x, y);
      const diff =
        Math.abs(data[i] - g[0]) + Math.abs(data[i + 1] - g[1]) + Math.abs(data[i + 2] - g[2]);
      if (diff > 60) maxR = Math.max(maxR, Math.hypot(x - c, y - c));
    }
  }
  const pct = Math.round((maxR / c) * 100);
  if (pct > 94) throw new Error(`${id}: art reaches ${pct}% of the circle (want 94% or less)`);
  return pct;
}

async function manifest(tagline, source) {
  const files = {};
  const paths = [...new Set(written.map((w) => w.replace(/\\/g, '/').replace(/^\/+/, '')))];
  for (const p of paths.sort()) {
    const abs = join(pub, p);
    const entry = { bytes: statSync(abs).size };
    if (p.endsWith('.png')) {
      const m = await sharp(abs).metadata();
      entry.width = m.width;
      entry.height = m.height;
    }
    files[`/${p}`] = entry;
  }
  for (const p of KIT_PRINTS) {
    const f = files[p.png];
    if (f?.width !== p.width || f?.height !== p.height) throw new Error(`${p.png} size`);
  }
  for (const i of KIT_IMAGES) {
    const f =
      files[i.file] ??
      (await sharp(join(pub, i.file))
        .metadata()
        .then((m) => ({
          width: m.width,
          height: m.height,
          bytes: statSync(join(pub, i.file)).size,
        })));
    if (f.width !== i.width || f.height !== i.height) {
      throw new Error(
        `${i.file} is ${f.width}x${f.height}, brandKit.ts says ${i.width}x${i.height}`,
      );
    }
    files[i.file] = f;
  }
  const data = {
    tagline,
    taglineSource: source === 'sanity' ? 'Site settings (Sanity)' : 'last generated copy',
    files,
  };
  writeFileSync(manifestPath, JSON.stringify(data, null, 2) + '\n');
}

// ── Run ─────────────────────────────────────────────────────────────────────

const { tagline, source } = await readTagline();
console.log(`tagline (${source}): ${tagline}`);
await logos();
await profiles();
await covers(tagline);
await highlights();
await boards();
await emailSignature();
await prints(tagline);
fonts();
colors();
await specimens();
for (const id of ['profile-midnight', 'profile-linen', 'profile-seal', 'google-logo']) {
  console.log(`circle-safe: ${id} art reaches ${await circleSafe(id)}% of the radius`);
}
await manifest(tagline, source);
console.log(
  `wrote ${written.length} files to public/brand-kit/ and src/lib/brand/brandKitManifest.json`,
);
