// Regenerates the icon set and the standalone brand files in public/ from the Hoop Seal
// (logo system chosen 2026-10-04, docs/logo-concepts/README.md). Re-runnable:
//   node scripts/generate-favicons.mjs
//
// Everything is drawn by src/lib/brand/brandSvg.js from outlined geometry
// (src/lib/brand/brandPaths.js), so no fonts are needed here and favicons never depend on
// webfonts.
//   favicon.svg / favicon.ico   the tab cut: Midnight disc, one heavy gold hoop, heavy cypher
//   apple-touch-icon, icon-192/512   the compact seal on a solid Midnight square (iOS puts
//                                    transparency on black, so it must be opaque)
//   brand/seal-*.svg, brand/mark-*.svg, brand/wordmark-*.svg   standalone files for the
//                                    footer, email signatures and documents
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sealSvg, tabIconSvg, wordmarkSvg, LIGHT, DARK } from '../src/lib/brand/brandSvg.js';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const brandDir = join(publicDir, 'brand');
mkdirSync(brandDir, { recursive: true });

const MIDNIGHT = '#0F1B2D';

const faviconSvg = tabIconSvg({ idp: 'fi' }) + '\n';
const appSvg = sealSvg({
  idp: 'ap',
  cut: 'bold',
  palette: DARK,
  background: MIDNIGHT,
  inset: 0.8,
});

const manifest = {
  name: 'MAS Monograms',
  short_name: 'MAS',
  start_url: '/',
  display: 'browser',
  background_color: MIDNIGHT,
  theme_color: MIDNIGHT,
  icons: [
    { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
  ],
};

writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg);
writeFileSync(join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

// Standalone brand files (plain hex colours, an accessible name on each).
const files = {
  'seal-light.svg': sealSvg({
    idp: 's',
    ring: true,
    cut: 'regular',
    palette: LIGHT,
    title: 'MAS Monograms',
  }),
  'seal-dark.svg': sealSvg({
    idp: 's',
    ring: true,
    cut: 'regular',
    palette: DARK,
    title: 'MAS Monograms',
  }),
  'mark-light.svg': sealSvg({ idp: 'm', cut: 'bold', palette: LIGHT, title: 'MAS Monograms' }),
  'mark-dark.svg': sealSvg({ idp: 'm', cut: 'bold', palette: DARK, title: 'MAS Monograms' }),
  'wordmark-light.svg': wordmarkSvg({
    idp: 'w',
    cut: 'display',
    palette: LIGHT,
    title: 'MAS Monograms',
  }),
  'wordmark-dark.svg': wordmarkSvg({
    idp: 'w',
    cut: 'display',
    palette: DARK,
    title: 'MAS Monograms',
  }),
};
for (const [name, svg] of Object.entries(files)) writeFileSync(join(brandDir, name), svg + '\n');

const png = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 100 })
    .resize(size, size)
    .png()
    .toFile(join(publicDir, file));

await Promise.all([
  png(appSvg, 180, 'apple-touch-icon.png'),
  png(appSvg, 192, 'icon-192.png'),
  png(appSvg, 512, 'icon-512.png'),
]);

// Legacy /favicon.ico: a single-image ICO wrapping a 32px PNG (valid since Vista;
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

console.log(
  'wrote favicon.svg, favicon.ico, manifest.webmanifest, apple-touch-icon.png, icon-192.png, icon-512.png, brand/*.svg',
);
