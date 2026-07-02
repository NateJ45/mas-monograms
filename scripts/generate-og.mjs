// Regenerates the default social-share card public/og-default.png (1200x630) in the
// Heirloom Coast palette: the Shopkeeper's Badge mark over an outlined Fraunces wordmark,
// a brass rule, tagline, and place line. Re-runnable: node scripts/generate-og.mjs
//
// All text is pre-outlined (scripts/og-glyph-paths.json) so this needs no fonts at runtime,
// matching scripts/generate-favicons.mjs. To change the wordmark/tagline strings, re-run the
// outliner documented in docs/logo-concepts/README.md.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(scriptsDir, '..', 'public');
const glyphs = JSON.parse(readFileSync(join(scriptsDir, 'og-glyph-paths.json'), 'utf8'));

const LINEN = '#F4EEE3';
const PAPER = '#FBF8F1';
const INK = '#26312E';
const INDIGO = '#28486B';
const CLARET = '#8C3A2E';
const BRASS = '#B98A3E';

// Fraunces-700 capital M (44 cap-height in a 100 box), shared with generate-favicons.mjs.
const FRAUNCES_M =
  'M52.15 56.79L49.29 57.79L59.29 30.77Q59.85 29.16 60.61 28.58Q61.36 28.00 62.71 28.00L73.93 28.00Q74.75 28.00 75.16 28.35Q75.57 28.69 75.57 29.29Q75.57 29.82 75.28 30.14Q75.00 30.45 74.44 30.67L72.80 31.08Q71.89 31.33 71.54 31.87Q71.20 32.40 71.29 33.47L73.68 66.81Q73.74 67.88 74.06 68.29Q74.37 68.70 75.19 68.92L76.79 69.33Q77.33 69.52 77.59 69.83Q77.86 70.15 77.86 70.65Q77.86 71.21 77.45 71.61Q77.04 72.00 76.23 72.00L59.32 72.00Q58.44 72.00 58.01 71.65Q57.59 71.31 57.59 70.71Q57.59 70.21 57.86 69.86Q58.12 69.52 58.75 69.33L60.39 68.92Q61.36 68.64 61.68 68.18Q61.99 67.73 61.93 66.81L59.44 33.22L61.96 32.84L49.23 67.91Q48.70 69.45 48.11 69.86Q47.53 70.27 46.78 70.27Q46.24 70.27 45.77 70.11Q45.30 69.96 44.89 69.45Q44.48 68.95 44.04 67.82L30.69 33.81L33.14 32.90L30.56 65.24Q30.44 66.69 31.32 67.57Q32.20 68.45 33.58 68.98L34.93 69.49Q35.34 69.67 35.57 69.96Q35.81 70.24 35.81 70.68Q35.81 71.28 35.40 71.64Q34.99 72.00 34.14 72.00L23.80 72.00Q22.96 72.00 22.55 71.65Q22.14 71.31 22.14 70.71Q22.14 70.11 22.48 69.82Q22.83 69.52 23.36 69.27L24.43 68.92Q25.66 68.45 26.48 67.58Q27.29 66.72 27.45 65.21L29.87 35.17Q30.03 33.28 29.70 32.32Q29.37 31.36 28.36 31.08L26.76 30.70Q26.16 30.51 25.85 30.18Q25.53 29.85 25.53 29.29Q25.53 28.00 27.26 28.00L38.54 28.00Q39.74 28.00 40.51 28.52Q41.28 29.04 41.88 30.58Z';

const W = 1200;
const H = 630;
const cx = W / 2;

// Vertical rhythm, top to bottom.
const badgeY = 150; // badge center
const badgeR = 88; // outer ring radius (badge drawn at 176px tall)
const wordY = 380; // wordmark baseline
const ruleY = 410;
const tagY = 452; // tagline baseline
const placeY = 512; // place-line baseline

// Center an outlined string (paths authored with x from 0) by translating it.
const centered = (g, baselineY, fill) =>
  `<g transform="translate(${(cx - g.width / 2).toFixed(2)} ${baselineY})" fill="${fill}"><path d="${g.path}"/></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${LINEN}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="14" fill="${PAPER}" stroke="${BRASS}" stroke-width="1.5" stroke-opacity="0.5"/>

  <g transform="translate(${cx - badgeR} ${badgeY - badgeR}) scale(${(badgeR * 2) / 100})">
    <circle cx="50" cy="50" r="42.5" fill="none" stroke="${INDIGO}" stroke-width="6"/>
    <circle cx="50" cy="50" r="31.5" fill="none" stroke="${INDIGO}" stroke-width="4"/>
    <path d="${FRAUNCES_M}" fill="${CLARET}" transform="translate(50 50) scale(0.7) translate(-50 -50)"/>
  </g>

  ${centered(glyphs.wordmark, wordY, INK)}
  <line x1="${cx - 42}" y1="${ruleY}" x2="${cx + 42}" y2="${ruleY}" stroke="${BRASS}" stroke-width="2" stroke-linecap="round"/>
  ${centered(glyphs.tagline, tagY, INDIGO)}
  ${centered(glyphs.place, placeY, CLARET)}
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile(join(publicDir, 'og-default.png'));
console.log('wrote og-default.png (1200x630)');
