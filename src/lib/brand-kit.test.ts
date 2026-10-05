// =============================================================================
// Mary Ann's brand kit (Phase F, 2026-10-05): the data, the files, the ZIP and the words
// =============================================================================
// The kit is generated (scripts/generate-brand-kit.mjs, build-brand-kit-zip.mjs) and
// committed, and the Studio pane only links to it, so nothing at build time would notice a
// missing file, a social picture at the wrong size, a color that drifted from the site, or an
// em-dash in her copy. These tests do.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BRAND_COLORS,
  BRAND_FONTS,
  COLORWAYS,
  COLOR_PAIRS,
  GOLD_THREAD,
  KIT_IMAGES,
  KIT_PRINTS,
  KIT_ZIP,
  LOGOS,
  LOGO_PNG_WIDTH,
  LOGO_SMALL_WIDTH,
  approxCmyk,
  logoFile,
  readability,
} from './brand/brandKit.ts';
import * as KIT from './brand/brandKit.ts';
import { contrastRatio } from './contrast.ts';
import { readZip, writeZip } from '../../scripts/lib/zip-writer.mjs';
import { JARGON } from '../../scripts/audit-studio.mjs';

const fromRoot = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const pub = (p: string) => fromRoot(`public${p}`);
const CSS = readFileSync(fromRoot('src/styles/globals.css'), 'utf8');
const EM_DASH = String.fromCharCode(0x2014);

// Bytes are handled as plain Uint8Arrays (the repo's TypeScript sees Node's Buffer as a bare
// Uint8Array, without readUInt32BE or toString(encoding)).
const bytes = (file: string) => new Uint8Array(readFileSync(file));
const u32 = (b: Uint8Array, at: number) => new DataView(b.buffer, b.byteOffset).getUint32(at);
const latin1 = (b: Uint8Array) => new TextDecoder('latin1').decode(b);
const utf8 = (b: Uint8Array) => new TextDecoder('utf-8').decode(b);
const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

/** The hex a token is set to in globals.css (the first declaration). */
function cssHex(name: string): string {
  const m = CSS.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\b`));
  assert.ok(m, `${name} is not set to a hex color in globals.css`);
  return m[1].toUpperCase();
}

/** Width and height from a PNG's IHDR. */
function pngSize(file: string): { width: number; height: number } {
  const b = bytes(file);
  assert.equal(latin1(b.subarray(1, 4)), 'PNG', `${file} is not a PNG`);
  return { width: u32(b, 16), height: u32(b, 20) };
}

// ── Colors match the site ─────────────────────────────────────────────────────

test('every brand color matches its token in globals.css', () => {
  for (const c of BRAND_COLORS) {
    assert.equal(c.hex, cssHex(c.cssVar), `${c.name} (${c.cssVar}) drifted from globals.css`);
  }
});

test('the gold thread gradient matches --thread-gold', () => {
  const block = CSS.match(/--thread-gold:\s*linear-gradient\(([^;]+)\);/);
  assert.ok(block, '--thread-gold not found');
  const stops = [...block[1].matchAll(/(#[0-9a-fA-F]{6})\s+(\d+)%/g)].map((m) => ({
    hex: m[1].toUpperCase(),
    at: Number(m[2]),
  }));
  assert.deepEqual(stops, GOLD_THREAD.stops);
  assert.match(block[1], new RegExp(`^\\s*${GOLD_THREAD.angle}deg`));
});

test('approximate CMYK follows the documented formula', () => {
  assert.deepEqual(approxCmyk('#000000'), [0, 0, 0, 100]);
  assert.deepEqual(approxCmyk('#FFFFFF'), [0, 0, 0, 0]);
  assert.deepEqual(approxCmyk('#FF0000'), [0, 100, 100, 0]);
  // Midnight #0F1B2D: R'=.059 G'=.106 B'=.176; K=.824; C=.67 M=.40 Y=0
  assert.deepEqual(approxCmyk('#0F1B2D'), [67, 40, 0, 82]);
});

test('the readable-pairs table is worked out, not typed, and gold on light is a no', () => {
  for (const p of COLOR_PAIRS) {
    const hex = (id: string) => BRAND_COLORS.find((c) => c.id === id)!.hex;
    assert.equal(p.ratio, contrastRatio(hex(p.text), hex(p.ground)));
    assert.equal(p.verdict, readability(p.ratio));
  }
  const goldOnLinen = COLOR_PAIRS.find((p) => p.text === 'gold' && p.ground === 'linen');
  assert.equal(goldOnLinen?.verdict, 'no');
  const inkOnLinen = COLOR_PAIRS.find((p) => p.text === 'ink' && p.ground === 'linen');
  assert.equal(inkOnLinen?.verdict, 'easy');
});

// ── Every file exists, at its exact size ──────────────────────────────────────

test('every logo exists in every colorway as SVG, a 2000px PNG and a 512px PNG', () => {
  for (const logo of LOGOS) {
    for (const way of COLORWAYS) {
      const svg = pub(logoFile(logo.id, way.id, 'svg'));
      assert.ok(existsSync(svg), svg);
      assert.match(readFileSync(svg, 'utf8'), /^<svg [^>]*viewBox=/);
      assert.equal(pngSize(pub(logoFile(logo.id, way.id, 'png'))).width, LOGO_PNG_WIDTH);
      assert.equal(pngSize(pub(logoFile(logo.id, way.id, 'small'))).width, LOGO_SMALL_WIDTH);
    }
  }
});

test('one-color logos really are one color (no gradient colors, no satin texture)', () => {
  for (const logo of LOGOS) {
    for (const way of ['one-color-midnight', 'one-color-white'] as const) {
      const svg = readFileSync(pub(logoFile(logo.id, way, 'svg')), 'utf8');
      const colors = new Set(
        [...svg.matchAll(/(?:fill|stroke|stop-color)[:=]"?(#[0-9A-Fa-f]{6})/g)]
          .map((m) => m[1].toUpperCase())
          .filter((h) => h !== '#000000' && h !== '#FFFFFF'),
      );
      const want = way === 'one-color-white' ? [] : ['#0F1B2D'];
      assert.deepEqual([...colors], want, `${logo.id} ${way} has ${[...colors]}`);
      assert.ok(!svg.includes('-sat"'), `${logo.id} ${way} still has the satin pattern`);
    }
  }
});

test('every social picture is exactly the size it says', () => {
  for (const img of KIT_IMAGES) {
    assert.deepEqual(pngSize(pub(img.file)), { width: img.width, height: img.height }, img.file);
  }
});

test('the email signature logo is small enough for email (under 30 KB)', () => {
  const sig = KIT_IMAGES.find((i) => i.id === 'email-signature')!;
  assert.ok(bytes(pub(sig.file)).length < 30 * 1024);
});

test('every printable exists as a PNG at 300 dpi and a one-page PDF of the paper size', () => {
  for (const p of KIT_PRINTS) {
    assert.deepEqual(pngSize(pub(p.png)), { width: p.width, height: p.height }, p.png);
    const pdf = latin1(bytes(pub(p.pdf)));
    assert.ok(pdf.startsWith('%PDF-1.4'), p.pdf);
    assert.match(pdf, /\/Count 1 /);
    const box = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/);
    assert.ok(box);
    // 300 dpi pixels -> points (1/72 inch), within a point.
    assert.ok(Math.abs(Number(box[1]) - (p.width * 72) / 300) < 1, `${p.pdf} width`);
    assert.ok(Math.abs(Number(box[2]) - (p.height * 72) / 300) < 1, `${p.pdf} height`);
  }
});

test('every font file and its OFL license is in the kit, with the copyright line', () => {
  for (const f of BRAND_FONTS) {
    for (const file of f.files) {
      const b = bytes(pub(file.file));
      assert.equal(u32(b, 0), 0x00010000, `${file.file} is not a TrueType font`);
    }
    const lic = readFileSync(pub(f.license), 'utf8');
    assert.ok(lic.includes('SIL OPEN FONT LICENSE Version 1.1'));
    assert.ok(lic.includes(f.copyright));
  }
});

test('the specimens the pane shows exist', () => {
  for (const f of BRAND_FONTS) assert.ok(existsSync(pub(`/brand-kit/specimens/${f.id}.svg`)));
});

// ── The ZIP ───────────────────────────────────────────────────────────────────

const zipBuf = readFileSync(pub(KIT_ZIP));
const entries: { name: string; data: Uint8Array }[] = readZip(zipBuf);
const names = new Set(entries.map((e) => e.name));
const TOP = 'MAS Monograms brand kit/';
const inZip = (publicPath: string) => `${TOP}${publicPath.replace(/^\/brand-kit\//, '')}`;

test('the ZIP holds every file the pane offers, plus the read-me and the share picture', () => {
  for (const logo of LOGOS) {
    for (const way of COLORWAYS) {
      for (const kind of ['svg', 'png', 'small'] as const) {
        assert.ok(
          names.has(inZip(logoFile(logo.id, way.id, kind))),
          logoFile(logo.id, way.id, kind),
        );
      }
    }
  }
  for (const i of KIT_IMAGES) {
    const n = i.id === 'link-share' ? `${TOP}social/link-share-image.png` : inZip(i.file);
    assert.ok(names.has(n), n);
  }
  for (const p of KIT_PRINTS) {
    assert.ok(names.has(inZip(p.pdf)) && names.has(inZip(p.png)), p.id);
  }
  for (const f of BRAND_FONTS) {
    for (const file of f.files) assert.ok(names.has(inZip(file.file)), file.file);
    assert.ok(names.has(inZip(f.license)), f.license);
  }
  for (const n of [
    'mas-monograms-colors.txt',
    'mas-monograms-colors.csv',
    'mas-monograms-colors.ase',
  ]) {
    assert.ok(names.has(`${TOP}colors/${n}`), n);
  }
  assert.ok(names.has(`${TOP}Read me first.txt`));
});

test('every ZIP entry matches the file served beside it, and the ZIP is a sensible size', () => {
  for (const e of entries) {
    const rel = e.name.slice(TOP.length);
    if (rel === 'Read me first.txt') continue;
    const src =
      rel === 'social/link-share-image.png' ? pub('/og-default.png') : pub(`/brand-kit/${rel}`);
    assert.equal(sha(bytes(src)), sha(e.data), `${e.name} is stale: run npm run brand-kit`);
    assert.ok(e.data.length > 0, `${e.name} is empty`);
  }
  assert.ok(zipBuf.length > 1024 * 1024 && zipBuf.length < 15 * 1024 * 1024, `${zipBuf.length}`);
  assert.ok(!names.has(`${TOP}specimens/fraunces.svg`), 'specimens are for the pane only');
});

test('the ZIP writer is deterministic and round-trips', () => {
  const files = [
    { name: 'b.txt', data: Buffer.from('hello hello hello hello') },
    { name: 'a/c.bin', data: Buffer.from([1, 2, 3]) },
  ];
  const one = writeZip(files);
  const two = writeZip([...files].reverse());

  assert.equal(sha(one), sha(two));
  const back = readZip(one);
  assert.deepEqual(
    back.map((e: { name: string }) => e.name),
    ['a/c.bin', 'b.txt'],
  );
  assert.equal(utf8(back[1].data), 'hello hello hello hello');
});

test('the read-me is plain words with no em-dash', () => {
  const readme = utf8(entries.find((e) => e.name === `${TOP}Read me first.txt`)!.data);
  assert.ok(!readme.includes(EM_DASH));
  assert.match(readme, /SIL Open Font License/);
});

test('the versioned ZIP is cached for a year in public/_headers and the kit is noindex', () => {
  const headers = readFileSync(fromRoot('public/_headers'), 'utf8');
  assert.match(
    headers,
    new RegExp(
      `^${KIT_ZIP.replace(/\./g, '\\.')}\\n\\s+Cache-Control: public, max-age=31536000, immutable`,
      'm',
    ),
  );
  assert.match(headers, /^\/brand-kit\/\*\n\s+X-Robots-Tag: noindex/m);
  assert.match(KIT_ZIP, /-v\d+\.zip$/);
});

// ── Words she reads ───────────────────────────────────────────────────────────

/** Every string in the kit's exported data (what the pane and the README show her). */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

test('no em-dash or Studio jargon in anything the brand kit says', () => {
  const words = strings(
    Object.fromEntries(Object.entries(KIT).filter(([, v]) => typeof v !== 'function')),
  ).filter((s) => !/^(https?:)?\/|^#|^--/.test(s));
  assert.ok(words.length > 50, 'found the kit words');
  for (const s of words) {
    for (const j of JARGON as { re: RegExp; why: string }[]) {
      assert.ok(!j.re.test(s), `${j.why}: "${s.slice(0, 80)}"`);
    }
  }
  for (const file of ['src/sanity/components/BrandKitPane.tsx', 'src/lib/brand/brandKit.ts']) {
    assert.ok(!readFileSync(fromRoot(file), 'utf8').includes(EM_DASH), `${file} has an em-dash`);
  }
});

test('the voice card invents nothing: no years, awards or counts', () => {
  const voice = [KIT.VOICE.oneSentence, ...KIT.VOICE.howISound, ...KIT.VOICE.captions].join(' ');
  assert.ok(!/\b(19|20)\d\d\b/.test(voice), 'a year in the voice copy');
  assert.ok(!/award|best in|#1|number one|\d+\+? (happy )?customers/i.test(voice));
});
