// Builds the "Download everything" file for Mary Ann's brand kit (2026-10-05, Phase F):
//   public/brand-kit/mas-monograms-brand-kit-v1.zip
// Run by `npm run brand-kit` after scripts/generate-brand-kit.mjs. NOT part of `npm run build`:
// the ZIP is committed, so the site build and CI need nothing from here.
//
// Inside, one folder "MAS Monograms brand kit" holding a "Read me first.txt", and the
// logos/, social/, print/, fonts/ and colors/ folders exactly as served from
// public/brand-kit/ (the specimens/ pictures are only for the Studio pane), plus the
// link-share picture (public/og-default.png). Deterministic (scripts/lib/zip-writer.mjs):
// the same files always make the same bytes, so a re-run with no art change leaves git clean.
//
// The file name is versioned (-v1) because public/_headers caches it for a year. If any file
// in the kit changes, bump KIT_ZIP in src/lib/brand/brandKit.ts to -v2 (and remove the old ZIP).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeZip } from './lib/zip-writer.mjs';
import {
  BRAND_COLORS,
  BRAND_FONTS,
  COLORWAYS,
  KIT_IMAGES,
  KIT_PRINTS,
  KIT_ZIP,
  LOGOS,
  LOGO_RULES,
  VOICE,
  cmykText,
  rgbText,
} from '../src/lib/brand/brandKit.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kitDir = join(root, 'public/brand-kit');
const TOP = 'MAS Monograms brand kit';
const FOLDERS = ['logos', 'social', 'print', 'fonts', 'colors'];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const base = (p) => p.split('/').pop();

function readme() {
  const L = [];
  const h = (t) => L.push('', t.toUpperCase(), '-'.repeat(t.length));
  L.push('MAS MONOGRAMS: MY BRAND KIT');
  L.push('');
  L.push('Everything made for my website, ready to use anywhere else: Facebook, Instagram,');
  L.push('Pinterest, Google, flyers, tags, invoices, my email and a craft-fair table.');
  L.push('');
  L.push('Three kinds of files:');
  L.push('  .png  a picture. Use it on Facebook, Instagram, in Word, Canva and email.');
  L.push('  .svg  for printing. It stays sharp at any size. Give it to a printer or sign maker.');
  L.push('  .pdf  a page ready to print at the right size.');

  h('logos folder');
  for (const logo of LOGOS) {
    L.push(`${logo.name}: ${logo.useWhen}`);
  }
  L.push('');
  L.push('Each one comes in four versions (the end of the file name says which):');
  const wayWord = {
    'color-light': 'color-light: full color for a white or light background',
    'color-dark': 'color-dark: full color in gold for a dark background',
    'one-color-midnight': 'one-color-midnight: all dark blue, for stamps and one-thread embroidery',
    'one-color-white': 'one-color-white: all white, for dark photos and dark fabric',
  };
  for (const w of COLORWAYS) L.push(`  ${wayWord[w.id]}`);
  L.push('A file ending in "-small" is a smaller picture (512 pixels wide) for quick use.');
  L.push('');
  L.push('Using the logo:');
  L.push(`  ${LOGO_RULES.clearSpace}`);
  for (const r of LOGO_RULES.minimumSizes) L.push(`  ${r}`);
  for (const r of LOGO_RULES.doNot) L.push(`  ${r}`);

  h('social folder');
  for (const i of KIT_IMAGES) {
    const name = i.id === 'link-share' ? 'link-share-image.png' : base(i.file);
    L.push(`${name}`);
    L.push(`  ${i.title}. ${i.sizeWords}`);
    L.push(`  ${i.howTo}`);
  }

  h('print folder');
  for (const p of KIT_PRINTS) {
    L.push(`${base(p.pdf)} (and the same as a picture: ${base(p.png)})`);
    L.push(`  ${p.title}. ${p.sizeWords}`);
    L.push(`  ${p.howTo}`);
  }

  h('fonts folder');
  for (const f of BRAND_FONTS) {
    L.push(`${f.name} (${f.role}): ${f.useFor}`);
    L.push(`  Files: ${f.files.map((x) => base(x.file)).join(', ')}`);
    L.push(`  Free from Google Fonts: ${f.googleFonts}`);
    L.push(`  If you do not have it: ${f.fallback}`);
  }
  L.push('');
  L.push(
    'To install a font on a Windows computer: double-click the .ttf file, then click Install.',
  );
  L.push('On a Mac: double-click the .ttf file, then click Install in Font Book.');
  L.push('These files hold the everyday letters for English. For other languages, get the full');
  L.push('fonts free from the Google Fonts links above.');
  L.push('');
  L.push('The fonts are free and open (SIL Open Font License 1.1). You may install them, use them');
  L.push('for your business and share them, as long as the license files (OFL-*.txt) stay with');
  L.push('them and you do not sell the fonts on their own.');
  for (const f of BRAND_FONTS) L.push(`  ${f.name}: ${f.copyright}`);

  h('colors folder');
  L.push('The same colors in three forms: a list to read (.txt), a spreadsheet (.csv) and a');
  L.push('swatch file for Adobe programs (.ase).');
  L.push('CMYK numbers are approximate. For printing, ask the printer to match the color code.');
  L.push('');
  for (const c of BRAND_COLORS) {
    L.push(
      `${c.name.padEnd(20)} ${c.hex}   RGB ${rgbText(c.hex).padEnd(14)} CMYK ${cmykText(c.hex)}`,
    );
  }

  h('how I sound');
  L.push(VOICE.oneSentence);
  L.push('');
  for (const v of VOICE.howISound) L.push(`  ${v}`);
  L.push('');
  L.push('Words I never use:');
  for (const v of VOICE.neverUse) L.push(`  ${v}`);
  L.push('');
  L.push('Stuck? Nathan at Nixon Creative Studio can help.');
  return L.join('\r\n') + '\r\n';
}

const entries = [];
for (const folder of FOLDERS) {
  for (const abs of walk(join(kitDir, folder))) {
    entries.push({
      name: `${TOP}/${relative(kitDir, abs).replace(/\\/g, '/')}`,
      data: readFileSync(abs),
    });
  }
}
entries.push({
  name: `${TOP}/social/link-share-image.png`,
  data: readFileSync(join(root, 'public/og-default.png')),
});
entries.push({ name: `${TOP}/Read me first.txt`, data: Buffer.from(readme(), 'utf8') });

const zip = writeZip(entries);
const outPath = join(root, 'public', KIT_ZIP);
writeFileSync(outPath, zip);

// Record the ZIP's size in the manifest, so the Studio pane can say "about 9 MB".
const manifestPath = join(root, 'src/lib/brand/brandKitManifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.zip = { file: KIT_ZIP, bytes: zip.length, files: entries.length };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `wrote ${relative(root, outPath)}: ${entries.length} files, ${(zip.length / 1024 / 1024).toFixed(2)} MB`,
);
