#!/usr/bin/env node
// Safe to edit by hand
// =============================================================================
// The Studio's art, drawn from the public site (starter PORTS.md cards 118 to
// 120, and the art slot of card 128 when it lands)
// =============================================================================
// Writes every Studio picture from the site's own parts, so the Studio looks
// like the Atelier and not a generic admin app:
//
//   - the Hoop Seal's lettering (public/brand/mark-light.svg: MA in thread, the
//     gold satin S woven over), stitched into
//   - the hero's gilded hoop (src/components/home/HomeHero.astro: the turned-wood
//     ring gradients, the brass clasp, the linen cloth, the claret thread tail),
//   - the header's running-stitch hem (a dashed gold rule) and the gold
//     "x" stitch the site uses for its list bullets,
//   - the Midnight weave (globals.css --tex-weave-light), the linen weave.
//
// Outputs (all decorative, hidden from screen readers where they are used):
//   public/studio-banner/thread.svg        Home banner foot, wide (card 118)
//   public/studio-banner/thread-phone.svg  the same at phone width
//   public/studio-art/hoop.svg             the gilded hoop with her letters (splash, card 128)
//   public/studio-art/hoop-thread.svg      the same with its claret thread tail
//   public/studio-art/stitch-rule.svg      the running-stitch hem, tileable
//   public/studio-art/cross-stitch.svg     the gold x stitch
//   public/studio-art/weave-midnight.svg   the Midnight weave tile (200 x 200)
//   public/studio-art/weave-linen.svg      the linen weave tile (200 x 200)
//
// Run: node scripts/gen-studio-art.mjs   (deterministic; re-run after the mark
// or the site colours change, then commit the SVGs).
// =============================================================================

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p, s) => {
  const f = join(root, p);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, s.replace(/\n\s*/g, '\n').trim() + '\n');
  console.log(`wrote ${p} (${s.length} bytes)`);
};

// The site's colours (src/styles/globals.css).
const C = {
  midnight: '#0F1B2D',
  linen: '#F4EEE3',
  ink: '#26312E',
  claret: '#8C3A2E',
  claretDeep: '#722C22',
  goldDeep: '#A9772A',
  gold: '#D9B15F',
  goldLight: '#F0D58A',
};

// -----------------------------------------------------------------------------
// The Hoop Seal's lettering, lifted from public/brand/mark-light.svg
// -----------------------------------------------------------------------------
// The mark draws its ring at (100, 110) r 84 in a 200 x 200 box; the letters
// group and its masks/patterns are taken as drawn. Ids are prefixed per use so
// two hoops can share one file.
const mark = readFileSync(join(root, 'public/brand/mark-light.svg'), 'utf8');
const pathDef = (id) => {
  const m = mark.match(new RegExp(`<path id="${id}"[^>]*/>`));
  if (!m) throw new Error(`mark-light.svg: no #${id}`);
  return m[0];
};
const between = (start, end) => {
  const i = mark.indexOf(start);
  const j = mark.indexOf(end, i);
  if (i < 0 || j < 0) throw new Error(`mark-light.svg: no ${start}`);
  return mark.slice(i, j + end.length);
};
const letterDefs = [
  pathDef('m-M'),
  pathDef('m-A'),
  pathDef('m-S'),
  between('<mask id="m-mL"', '</mask>'),
  between('<clipPath id="m-cU"', '</clipPath>'),
  between('<mask id="m-mS"', '</mask>'),
  between('<linearGradient id="m-gT"', '</linearGradient>'),
  between('<pattern id="m-sat"', '</pattern>'),
].join('');
const letterGroupOpen = mark.match(/<g transform="translate\([^"]+\) scale\([^"]+\)">/)?.[0];
if (!letterGroupOpen) throw new Error('mark-light.svg: no letters group');

/** Prefix every id and url(#id)/href="#id" in a fragment. */
const scope = (s, p) =>
  s
    .replace(/id="m-/g, `id="${p}-`)
    .replace(/url\(#m-/g, `url(#${p}-`)
    .replace(/href="#m-/g, `href="#${p}-`);

// -----------------------------------------------------------------------------
// The gilded hoop (HomeHero.astro), in the mark's own frame
// -----------------------------------------------------------------------------
// SVG has no conic gradient, so the hero's turned-wood rings are two angled
// linear ramps with the same stops; the lit top edge and the dark seams are
// the hero's box-shadows drawn as hairlines.
function hoopDefs(p) {
  return `
  <linearGradient id="${p}-wood" x1="0.15" y1="0" x2="0.85" y2="1">
    <stop offset="0" stop-color="#F0D3A2"/><stop offset="0.16" stop-color="#D2A46A"/>
    <stop offset="0.36" stop-color="#A8743D"/><stop offset="0.52" stop-color="#7B4F27"/>
    <stop offset="0.66" stop-color="#A46F3A"/><stop offset="0.84" stop-color="#D9B27A"/>
    <stop offset="1" stop-color="#F0D3A2"/>
  </linearGradient>
  <linearGradient id="${p}-wood2" x1="0.9" y1="0.1" x2="0.1" y2="0.9">
    <stop offset="0" stop-color="#E7C18A"/><stop offset="0.22" stop-color="#B98450"/>
    <stop offset="0.46" stop-color="#8D5C2E"/><stop offset="0.7" stop-color="#C69660"/>
    <stop offset="0.88" stop-color="#EFD2A3"/><stop offset="1" stop-color="#E7C18A"/>
  </linearGradient>
  <linearGradient id="${p}-brass" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#7A5A22"/><stop offset="0.3" stop-color="#E8CF8F"/>
    <stop offset="0.55" stop-color="#C49A4A"/><stop offset="1" stop-color="#6B4C1C"/>
  </linearGradient>
  <radialGradient id="${p}-vig" cx="0.5" cy="0.46" r="0.5">
    <stop offset="0.6" stop-color="#1E1208" stop-opacity="0"/>
    <stop offset="1" stop-color="#1E1208" stop-opacity="0.26"/>
  </radialGradient>
  <pattern id="${p}-weave" patternUnits="userSpaceOnUse" width="3" height="3">
    <rect width="3" height="1" fill="${C.ink}" fill-opacity="0.07"/>
    <rect width="1" height="3" fill="${C.ink}" fill-opacity="0.05"/>
  </pattern>
  <pattern id="${p}-satMA" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(52)">
    <rect width="6" height="2" fill="#fff" fill-opacity=".16"/>
    <rect y="3.7" width="6" height="1.2" fill="#2a0c06" fill-opacity=".35"/>
  </pattern>
  <clipPath id="${p}-cloth"><circle cx="100" cy="110" r="77"/></clipPath>
  ${scope(letterDefs, p)}`;
}

/** The hoop body, centred at (100, 110), outer edge r 91, clasp up to y 2. */
function hoopBody(p, { shadow = true } = {}) {
  const letters = scope(letterGroupOpen, p);
  return `
  ${shadow ? `<ellipse cx="100" cy="206" rx="66" ry="5" fill="#000" fill-opacity="0.16"/>` : ''}
  <circle cx="100" cy="110" r="86" fill="none" stroke="url(#${p}-wood)" stroke-width="10"/>
  <circle cx="100" cy="110" r="91" fill="none" stroke="#4E3014" stroke-opacity="0.45" stroke-width="0.8"/>
  <path d="M 31 80 A 76 76 0 0 1 169 80" fill="none" stroke="#FFF0D6" stroke-opacity="0.5" stroke-width="1.2" transform="translate(0 -1) scale(1)"/>
  <circle cx="100" cy="110" r="79" fill="none" stroke="url(#${p}-wood2)" stroke-width="4.6"/>
  <circle cx="100" cy="110" r="81.4" fill="none" stroke="#3C230E" stroke-opacity="0.55" stroke-width="0.7"/>
  <g clip-path="url(#${p}-cloth)">
    <circle cx="100" cy="110" r="77" fill="${C.linen}"/>
    <rect x="20" y="30" width="160" height="160" fill="url(#${p}-weave)"/>
    ${letters}
      <g mask="url(#${p}-mL)" fill="${C.claret}"><use href="#${p}-M"/><use href="#${p}-A"/></g>
      <g mask="url(#${p}-mL)" fill="url(#${p}-satMA)"><use href="#${p}-M"/><use href="#${p}-A"/></g>
      <g mask="url(#${p}-mS)"><g fill="url(#${p}-gT)"><use href="#${p}-S"/></g><g fill="url(#${p}-sat)"><use href="#${p}-S"/></g></g>
    </g>
    <circle cx="100" cy="110" r="77" fill="url(#${p}-vig)"/>
  </g>
  <circle cx="100" cy="110" r="77" fill="none" stroke="#3C230E" stroke-opacity="0.5" stroke-width="0.8"/>
  <g transform="translate(76 -8)">
    <rect x="9" y="12" width="12" height="20" rx="2" fill="url(#${p}-brass)"/>
    <rect x="27" y="12" width="12" height="20" rx="2" fill="url(#${p}-brass)"/>
    <rect x="4" y="17" width="40" height="5" rx="2.5" fill="url(#${p}-brass)"/>
    <circle cx="24" cy="8" r="7" fill="url(#${p}-brass)" stroke="#5C4117" stroke-width="0.8"/>
    <path d="M19.5 8h9" stroke="#4A3412" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
}

/** The hero's claret thread tail, leaving the cloth at the lower right. */
function tail({ scale = 0.5, x = 149, y = 166, width = 2.4 } = {}) {
  const d = 'M18 4 C 30 52, 96 40, 112 84 C 126 122, 70 140, 96 166 C 112 182, 160 172, 214 150';
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke-linecap="round">
    <path d="${d}" stroke="${C.claret}" stroke-width="${width / scale}"/>
    <path d="${d}" stroke="#fff" stroke-opacity="0.35" stroke-width="${(width * 0.35) / scale}"/>
  </g>`;
}

// userSpaceOnUse: a straight rule has a zero-height box, which would void an
// objectBoundingBox gradient (and the stroke with it).
const goldRamp = (id, x1 = 0, x2 = 1000) => `
  <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" x2="${x2}" y1="0" y2="0">
    <stop offset="0" stop-color="${C.goldDeep}"/><stop offset="0.22" stop-color="${C.gold}"/>
    <stop offset="0.46" stop-color="${C.goldLight}"/><stop offset="0.7" stop-color="${C.gold}"/>
    <stop offset="1" stop-color="${C.goldDeep}"/>
  </linearGradient>`;

/** The site's gold "x" list stitch, centred at (x, y). */
const cross = (x, y, s = 4, color = C.gold, w = 1.4, o = 1) =>
  `<path d="M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-opacity="${o}"/>`;

/** The Midnight weave of the hero ground (--tex-weave-light), as SVG lines. */
function weave(id, w, h, color = C.linen) {
  return `
  <pattern id="${id}" patternUnits="userSpaceOnUse" width="13" height="17">
    <rect width="13" height="2" fill="${color}" fill-opacity="0.03"/>
    <rect width="1" height="17" fill="${color}" fill-opacity="0.022"/>
  </pattern>`;
}

// -----------------------------------------------------------------------------
// The Home banner foot (card 118)
// -----------------------------------------------------------------------------
// The weave fades up from the foot; the header's running-stitch hem crosses
// the banner in thread gold, with a few of her "x" stitches, and runs into her
// hoop near the right edge, whose claret thread falls away off the banner.
function bannerFoot({ w, h, ruleY, hoop, crosses, dash, ruleW, tailScale }) {
  const p = `b${w}`;
  const r = 91 * hoop.s;
  const cx = hoop.x + 100 * hoop.s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
  <!-- MAS Monograms: the Studio Home banner's foot (card 118), from the site: Midnight weave, the header's running-stitch hem, her hoop. Generated by scripts/gen-studio-art.mjs. -->
  <defs>
  ${goldRamp(`${p}-gold`, 0, w)}
  ${weave(`${p}-weave`, w, h)}
  <linearGradient id="${p}-fade" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
  </linearGradient>
  <mask id="${p}-m"><rect width="${w}" height="${h}" fill="url(#${p}-fade)"/></mask>
  ${hoopDefs(p)}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${p}-weave)" mask="url(#${p}-m)"/>
  <path d="M0 ${ruleY}H${cx - r * 0.55}" stroke="url(#${p}-gold)" stroke-width="${ruleW}" stroke-dasharray="${dash}" stroke-linecap="round"/>
  ${crosses.map(([x, y, s]) => cross(x, y, s, C.gold, ruleW * 0.85, 0.8)).join('\n')}
  <g transform="translate(${hoop.x} ${hoop.y}) scale(${hoop.s})">
    ${hoopBody(p, { shadow: false })}
    ${tail({ scale: tailScale, x: 156, y: 168, width: 2.6 })}
  </g>
</svg>`;
}

out(
  'public/studio-banner/thread.svg',
  bannerFoot({
    w: 1200,
    h: 132,
    ruleY: 92,
    hoop: { x: 1010, y: 8, s: 0.58 },
    dash: '7 6',
    ruleW: 1.8,
    tailScale: 0.62,
    crosses: [
      [64, 60, 4],
      [356, 112, 3.5],
      [702, 58, 4],
      [948, 114, 3.5],
    ],
  }),
);
out(
  'public/studio-banner/thread-phone.svg',
  bannerFoot({
    w: 390,
    h: 96,
    ruleY: 68,
    hoop: { x: 286, y: 6, s: 0.4 },
    dash: '6 5',
    ruleW: 1.6,
    tailScale: 0.62,
    crosses: [
      [34, 40, 3.2],
      [176, 84, 3],
    ],
  }),
);

// -----------------------------------------------------------------------------
// The art slot (public/studio-art/): the splash and starter card 128
// -----------------------------------------------------------------------------
out(
  'public/studio-art/hoop.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 0 196 214" width="196" height="214" aria-hidden="true">
  <!-- MAS Monograms: her Hoop Seal lettering stitched in the hero's gilded hoop. Generated by scripts/gen-studio-art.mjs. -->
  <defs>${hoopDefs('h')}</defs>
  ${hoopBody('h')}
</svg>`,
);
out(
  'public/studio-art/hoop-thread.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 0 262 262" width="262" height="262" aria-hidden="true">
  <!-- MAS Monograms: the gilded hoop with its claret thread tail. Generated by scripts/gen-studio-art.mjs. -->
  <defs>${hoopDefs('h')}</defs>
  ${hoopBody('h')}
  ${tail()}
</svg>`,
);
out(
  'public/studio-art/stitch-rule.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 6" width="156" height="6" aria-hidden="true">
  <!-- MAS Monograms: the header's running-stitch hem in thread gold; tiles across (12 stitches). Generated by scripts/gen-studio-art.mjs. -->
  <defs>${goldRamp('g', 0, 156)}</defs>
  <path d="M3.5 3H153" stroke="url(#g)" stroke-width="1.8" stroke-dasharray="7 6" stroke-linecap="round"/>
</svg>`,
);
out(
  'public/studio-art/cross-stitch.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
  <!-- MAS Monograms: the gold x stitch the site uses for its list bullets. Generated by scripts/gen-studio-art.mjs. -->
  ${cross(6, 6, 3.6, C.gold, 1.6)}
</svg>`,
);
const weaveTile = (name, ground, thread, a, b) =>
  out(
    `public/studio-art/weave-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
  <!-- MAS Monograms: the ${name} weave (globals.css --tex-*), a 200 x 200 tile. Generated by scripts/gen-studio-art.mjs. -->
  <defs>
    <pattern id="w1" patternUnits="userSpaceOnUse" width="13" height="17"><rect width="13" height="2" fill="${thread}" fill-opacity="${a}"/><rect width="1" height="17" fill="${thread}" fill-opacity="${b}"/></pattern>
    <pattern id="w2" patternUnits="userSpaceOnUse" width="3" height="3"><rect width="3" height="1" fill="${thread}" fill-opacity="${a / 2}"/><rect width="1" height="3" fill="${thread}" fill-opacity="${b / 2}"/></pattern>
  </defs>
  <rect width="200" height="200" fill="${ground}"/>
  <rect width="200" height="200" fill="url(#w2)"/>
  <rect width="200" height="200" fill="url(#w1)"/>
</svg>`,
  );
weaveTile('midnight', C.midnight, C.linen, 0.03, 0.022);
weaveTile('linen', C.linen, C.ink, 0.035, 0.028);
