// Regenerates the favicon/app-icon set in public/ from the Shopkeeper's Badge mark
// (docs/logo-concepts/2-shopkeepers-badge/). Re-runnable: node scripts/generate-favicons.mjs
//
// The capital M is the Fraunces variable font instanced at wght 700 / opsz 60 / WONK 0
// and outlined to a path (fontkit), because standalone SVG favicons cannot load webfonts.
// If the letterform ever needs regenerating, see docs/logo-concepts/README.md.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const LINEN = '#F4EEE3';
const INDIGO = '#28486B';
const CLARET = '#8C3A2E';

const FRAUNCES_M =
  'M52.15 56.79L49.29 57.79L59.29 30.77Q59.85 29.16 60.61 28.58Q61.36 28.00 62.71 28.00L73.93 28.00Q74.75 28.00 75.16 28.35Q75.57 28.69 75.57 29.29Q75.57 29.82 75.28 30.14Q75.00 30.45 74.44 30.67L72.80 31.08Q71.89 31.33 71.54 31.87Q71.20 32.40 71.29 33.47L73.68 66.81Q73.74 67.88 74.06 68.29Q74.37 68.70 75.19 68.92L76.79 69.33Q77.33 69.52 77.59 69.83Q77.86 70.15 77.86 70.65Q77.86 71.21 77.45 71.61Q77.04 72.00 76.23 72.00L59.32 72.00Q58.44 72.00 58.01 71.65Q57.59 71.31 57.59 70.71Q57.59 70.21 57.86 69.86Q58.12 69.52 58.75 69.33L60.39 68.92Q61.36 68.64 61.68 68.18Q61.99 67.73 61.93 66.81L59.44 33.22L61.96 32.84L49.23 67.91Q48.70 69.45 48.11 69.86Q47.53 70.27 46.78 70.27Q46.24 70.27 45.77 70.11Q45.30 69.96 44.89 69.45Q44.48 68.95 44.04 67.82L30.69 33.81L33.14 32.90L30.56 65.24Q30.44 66.69 31.32 67.57Q32.20 68.45 33.58 68.98L34.93 69.49Q35.34 69.67 35.57 69.96Q35.81 70.24 35.81 70.68Q35.81 71.28 35.40 71.64Q34.99 72.00 34.14 72.00L23.80 72.00Q22.96 72.00 22.55 71.65Q22.14 71.31 22.14 70.71Q22.14 70.11 22.48 69.82Q22.83 69.52 23.36 69.27L24.43 68.92Q25.66 68.45 26.48 67.58Q27.29 66.72 27.45 65.21L29.87 35.17Q30.03 33.28 29.70 32.32Q29.37 31.36 28.36 31.08L26.76 30.70Q26.16 30.51 25.85 30.18Q25.53 29.85 25.53 29.29Q25.53 28.00 27.26 28.00L38.54 28.00Q39.74 28.00 40.51 28.52Q41.28 29.04 41.88 30.58Z';

// Browser-tab cut: single bold ring (the two badge rings merge below ~24px, so the
// inner ring is pre-dropped and the outer thickened — reads cleanly at 16px).
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${LINEN}"/>
  <circle cx="50" cy="50" r="42.5" fill="none" stroke="${INDIGO}" stroke-width="7"/>
  <path d="${FRAUNCES_M}" fill="${CLARET}" transform="translate(50 50) scale(0.78) translate(-50 -50)"/>
</svg>
`;

// App/home-screen cut: full double-ring badge on a solid square (iOS composites
// transparency on black, so the background must be opaque), ~12% padding.
const squareSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${LINEN}"/>
  <g transform="translate(50 50) scale(0.88) translate(-50 -50)">
    <circle cx="50" cy="50" r="42.5" fill="none" stroke="${INDIGO}" stroke-width="6"/>
    <circle cx="50" cy="50" r="31.5" fill="none" stroke="${INDIGO}" stroke-width="4"/>
    <path d="${FRAUNCES_M}" fill="${CLARET}" transform="translate(50 50) scale(0.7) translate(-50 -50)"/>
  </g>
</svg>
`;

const manifest = {
  name: 'MAS Monograms',
  short_name: 'MAS',
  start_url: '/',
  display: 'browser',
  background_color: LINEN,
  theme_color: LINEN,
  icons: [
    { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
  ],
};

writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg);
writeFileSync(join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

const png = (size, file) =>
  sharp(Buffer.from(squareSvg), { density: (72 * size) / 100 })
    .resize(size, size)
    .png()
    .toFile(join(publicDir, file));

await Promise.all([
  png(180, 'apple-touch-icon.png'),
  png(192, 'icon-192.png'),
  png(512, 'icon-512.png'),
]);

// Legacy /favicon.ico — a single-image ICO wrapping a 32px PNG (valid since Vista;
// universally supported by the browsers that still request .ico).
const png32 = await sharp(Buffer.from(faviconSvg), { density: 72 * 0.32 * 100 })
  .resize(32, 32)
  .png()
  .toBuffer();
const icoHeader = Buffer.alloc(6 + 16);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(1, 4); // image count
icoHeader.writeUInt8(32, 6); // width
icoHeader.writeUInt8(32, 7); // height
icoHeader.writeUInt8(0, 8); // palette
icoHeader.writeUInt8(0, 9); // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // bits per pixel
icoHeader.writeUInt32LE(png32.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // image offset
writeFileSync(join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, png32]));

console.log('wrote favicon.svg, favicon.ico, manifest.webmanifest, apple-touch-icon.png, icon-192.png, icon-512.png');
