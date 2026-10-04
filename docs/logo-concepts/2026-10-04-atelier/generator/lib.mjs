// Shared helpers for the logo build: outline text through outline.py, render PNGs with sharp.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = 'C:/Users/natha/Documents/Claude/Projects/clients/mas-monograms-rebuild/';
const require = createRequire(ROOT + 'package.json');
export const sharp = require('sharp');

export const F = {
  frauncesRoman: '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
  frauncesItalic: '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2',
  petemoss: '@fontsource/petemoss/files/petemoss-latin-400-normal.woff2',
  greatVibes: '@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2',
  playfair: (w = 400, it = false) =>
    `@fontsource/playfair-display/files/playfair-display-latin-${w}-${it ? 'italic' : 'normal'}.woff2`,
  cinzel: (w = 400) => `@fontsource/cinzel/files/cinzel-latin-${w}-normal.woff2`,
  mulish: '@fontsource-variable/mulish/files/mulish-latin-wght-normal.woff2',
};

export const C = {
  midnight: '#0F1B2D',
  midnightRaised: '#172A42',
  indigo: '#28486B',
  indigoDeep: '#1C3550',
  claret: '#8C3A2E',
  claretDeep: '#722C22',
  brass: '#835A24',
  brassDeco: '#B98A3E',
  gold: '#D9B15F',
  goldLight: '#F0D58A',
  goldDeep: '#A9772A',
  linen: '#F4EEE3',
  paper: '#FBF8F1',
  ink: '#26312E',
  kraft: '#E2CFA9',
};

let counter = 0;
export function outline(jobs) {
  const tag = `${process.pid}-${counter++}`;
  const jin = join(HERE, `_jobs-${tag}.json`);
  const jout = join(HERE, `_out-${tag}.json`);
  writeFileSync(jin, JSON.stringify(jobs));
  execFileSync('python', [join(HERE, 'outline.py'), jin, jout], { stdio: 'pipe' });
  return JSON.parse(readFileSync(jout, 'utf8'));
}

export async function png(svg, file, width) {
  mkdirSync(dirname(file), { recursive: true });
  let img = sharp(Buffer.from(svg), { density: 300 });
  if (width) img = img.resize({ width });
  await img.png().toFile(file);
}

export const r = (n) => Math.round(n * 100) / 100;

// Translate an outlined path string by applying a group transform.
export const at = (d, x, y, s = 1, fill = 'currentColor', extra = '') =>
  `<path transform="translate(${r(x)} ${r(y)})${s !== 1 ? ` scale(${s})` : ''}" d="${d}" fill="${fill}" ${extra}/>`;

// Points around a circle for text-on-path layouts (glyph-by-glyph placement).
export function arcText(o, cx, cy, radius, centerDeg, { inside = false, gap = 0 } = {}) {
  // o: outline result. Places each glyph along an arc, centred on centerDeg (0 = top).
  const total = o.width;
  const circ = 2 * Math.PI * radius;
  const span = (total / circ) * 360;
  let out = '';
  for (const g of o.glyphs) {
    if (!g.d) continue;
    const mid = g.x + g.adv / 2;
    const frac = mid / total;
    const deg = inside ? centerDeg + span / 2 - frac * span : centerDeg - span / 2 + frac * span;
    const rad = ((deg - 90) * Math.PI) / 180;
    const px = cx + radius * Math.cos(rad);
    const py = cy + radius * Math.sin(rad);
    const rot = inside ? deg + 180 : deg;
    out += `<path d="${g.d}" transform="translate(${r(px)} ${r(py)}) rotate(${r(rot)}) translate(${r(-mid)} 0)"/>`;
  }
  return out;
}
