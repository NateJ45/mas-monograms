// =============================================================================
// The QR code tool's pure half (Phase E of the Studio upgrade, 2026-10-05)
// =============================================================================
// A QR code that does not scan is worse than none: Mary Ann prints a hundred
// tags and nobody can open them. So the strongest check here decodes every code
// with a SECOND, independent implementation (jsQR, a dev dependency) from a
// rasterised image, with the seal's hole cleared and noisy "seal art" painted
// inside it, for every destination and every placement.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQRModule from 'jsqr';
import { contrastRatio } from '../contrast.ts';
import { sealSvg } from '../brand/brandSvg.js';
import { DESTINATION_IDS, destinationUrl, socialUrl } from './destinations.ts';
import { encodeQr, type QrMatrix } from './encode.ts';
import { inHole, logoFit, MAX_LOGO_AREA, MIN_LOGO_MODULES } from './logo.ts';
import { makeQr } from './make.ts';
import { printPageHtml } from './print.ts';
import {
  PLACEMENT_IDS,
  PLACEMENTS,
  moduleMm,
  printInchesFor,
  sizeText,
  toCm,
  MIN_MODULE_MM,
  inchUnit,
  inchesText,
} from './placements.ts';
import { buildQrSvg, escapeXml, qrColoursOk, QR_COLOURS } from './svg.ts';
import { campaignTag, monthTag, parseWebAddress, qrLink, SITE_ORIGIN } from './url.ts';
import { QR_COPY, REVIEW_GUIDE_ID } from '../../sanity/qrCopy.ts';
import { guideById } from '../../sanity/guides/index.ts';
import { JARGON } from '../../../scripts/audit-studio.mjs';

// jsqr ships CommonJS; under Node's ESM loader the function can sit one level down.
type JsQr = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
) => { data: string; version: number } | null;
const jsQR = ((jsQRModule as unknown as { default?: JsQr }).default ??
  (jsQRModule as unknown as JsQr)) as JsQr;

const NOW = new Date(2026, 9, 5); // 5 October 2026

/**
 * Draw a matrix the way the SVG does: quiet zone, dark squares, the seal's
 * hole cleared, then (if asked) busy dark/light art inside the seal circle,
 * which is harsher than the real seal. Returns RGBA pixels for jsQR.
 */
function rasterise(
  qr: QrMatrix,
  quiet: number,
  opts: { hole?: number; sealDiameter?: number; px?: number } = {},
) {
  const px = opts.px ?? 4;
  const n = qr.size;
  const w = (n + 2 * quiet) * px;
  const data = new Uint8ClampedArray(w * w * 4).fill(255);
  const paint = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    data[i] = 15;
    data[i + 1] = 27;
    data[i + 2] = 45;
  };
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (opts.hole && inHole(n, opts.hole, r, c)) continue;
      if (!qr.modules[r][c]) continue;
      for (let y = 0; y < px; y++)
        for (let x = 0; x < px; x++) paint((c + quiet) * px + x, (r + quiet) * px + y);
    }
  if (opts.sealDiameter) {
    const cx = (quiet + n / 2) * px;
    const rad = (opts.sealDiameter / 2) * px;
    for (let y = 0; y < w; y++)
      for (let x = 0; x < w; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cx;
        if (dx * dx + dy * dy <= rad * rad && (((x >> 1) + (y >> 1)) & 1) === 0) paint(x, y);
      }
  }
  return { data, w };
}

// ── The link ──────────────────────────────────────────────────────────────────

test('own-site links get the qr tag; other query strings and #fragments survive', () => {
  assert.equal(
    qrLink(`${SITE_ORIGIN}/request-a-quote/`, { medium: 'card', now: NOW }),
    `${SITE_ORIGIN}/request-a-quote/?utm_source=qr&utm_medium=card&utm_campaign=2026-10`,
  );
  const kept = new URL(
    qrLink(`${SITE_ORIGIN}/style-gallery/?filter=towels#grid`, {
      medium: 'tag',
      campaign: 'Fall Fair 2026!',
    }),
  );
  assert.equal(kept.searchParams.get('filter'), 'towels');
  assert.equal(kept.hash, '#grid');
  assert.equal(kept.searchParams.get('utm_campaign'), 'fall-fair-2026');
  // An old tag is replaced, never repeated.
  const again = new URL(
    qrLink(`${SITE_ORIGIN}/?utm_source=old&utm_medium=x`, { medium: 'sign', now: NOW }),
  );
  assert.deepEqual(again.searchParams.getAll('utm_source'), ['qr']);
  assert.deepEqual(again.searchParams.getAll('utm_medium'), ['sign']);
  // www. is still her site.
  assert.match(qrLink('https://www.mas-monograms.com/', { medium: 'box' }), /utm_source=qr/);
});

test('outside links are left exactly as she pasted them (no tag, shorter code)', () => {
  const review = 'https://g.page/r/CabcdEFGhij123/review';
  assert.equal(qrLink(review, { medium: 'card' }), review);
  assert.equal(
    qrLink('https://www.facebook.com/masmonograms', { medium: 'tag' }),
    'https://www.facebook.com/masmonograms',
  );
});

test('bad addresses are refused; non-ASCII is percent-encoded', () => {
  for (const bad of [
    '',
    '   ',
    'masmonograms',
    'javascript:alert(1)',
    'ftp://x.com',
    'https://localhost/',
  ]) {
    assert.equal(parseWebAddress(bad), null, bad);
    assert.throws(() => qrLink(bad, { medium: 'tag' }));
  }
  assert.match(qrLink('https://example.com/café', { medium: 'tag' }), /caf%C3%A9$/);
});

test('the batch name is a short tidy tag, and empty means this month', () => {
  assert.equal(monthTag(NOW), '2026-10');
  assert.equal(campaignTag('', NOW), '2026-10');
  assert.equal(campaignTag('  ', NOW), '2026-10');
  assert.equal(campaignTag('Crème de la Crème', NOW), 'creme-de-la-creme');
  assert.equal(campaignTag('***', NOW), '2026-10');
  assert.ok(campaignTag('a'.repeat(80)).length <= 30);
});

// ── Destinations ──────────────────────────────────────────────────────────────

test('site destinations always exist; outside ones only once she has given them', () => {
  for (const id of ['home', 'quote', 'gallery', 'threads', 'clearance'] as const) {
    assert.ok(destinationUrl(id)?.startsWith(SITE_ORIGIN), id);
  }
  assert.equal(destinationUrl('review'), null);
  assert.equal(destinationUrl('facebook'), null);
  assert.equal(
    destinationUrl('instagram', { socialLinks: [{ platform: 'Instagram', url: 'not a link' }] }),
    null,
  );
  const links = {
    googleReviewUrl: ' https://g.page/r/abc/review ',
    socialLinks: [null, { platform: 'Facebook', url: 'https://www.facebook.com/mas' }],
  };
  assert.equal(destinationUrl('review', links), 'https://g.page/r/abc/review');
  assert.equal(socialUrl(links, 'Facebook'), 'https://www.facebook.com/mas');
  assert.equal(socialUrl(links, 'Instagram'), null);
});

// ── The encoder ───────────────────────────────────────────────────────────────

test('the encoder makes a well-formed code: size, version and the three corner squares', () => {
  const qr = encodeQr('https://mas-monograms.com/', 'H');
  assert.equal(qr.size, 17 + 4 * qr.version);
  assert.equal(qr.modules.length, qr.size);
  // A 7x7 finder pattern: dark ring, light ring, dark 3x3 centre.
  const finder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
        assert.equal(qr.modules[r0 + r][c0 + c], ring !== 2, `finder at ${r0},${c0} (${r},${c})`);
      }
  };
  finder(0, 0);
  finder(0, qr.size - 7);
  finder(qr.size - 7, 0);
  // The timing row alternates between the top finders.
  for (let c = 8; c < qr.size - 8; c++) assert.equal(qr.modules[6][c], c % 2 === 0);
});

test('the encoder refuses text it would garble', () => {
  assert.throws(() => encodeQr(''));
  assert.throws(() => encodeQr('https://example.com/café'));
});

test('a second, independent decoder reads back exactly what was encoded', () => {
  for (const text of [
    'https://mas-monograms.com/',
    'https://mas-monograms.com/request-a-quote/?utm_source=qr&utm_medium=card&utm_campaign=2026-10',
    'https://g.page/r/CabcdEFGhij123/review',
  ]) {
    for (const ecl of ['M', 'H'] as const) {
      const qr = encodeQr(text, ecl);
      const { data, w } = rasterise(qr, 4);
      const got = jsQR(data, w, w);
      assert.ok(got, `jsQR could not read ${ecl} ${text}`);
      assert.equal(got.data, text);
      assert.equal(got.version, qr.version);
    }
  }
});

// ── The seal ──────────────────────────────────────────────────────────────────

test('the seal is only offered with error correction H, and never too big', () => {
  assert.equal(logoFit({ size: 53, errorCorrection: 'M' }).fits, false);
  assert.equal(logoFit({ size: 21, errorCorrection: 'H' }).fits, false); // version 1: no room
  for (let v = 2; v <= 15; v++) {
    const size = 17 + 4 * v;
    const fit = logoFit({ size, errorCorrection: 'H' });
    if (!fit.fits) continue;
    assert.ok(fit.areaFraction <= MAX_LOGO_AREA, `v${v} clears ${fit.areaFraction}`);
    assert.ok(fit.areaFraction < 0.18);
    assert.ok(fit.diameter >= MIN_LOGO_MODULES);
    assert.equal(fit.sealDiameter, fit.diameter - 2);
    // Clear of the corner squares and their separators.
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        assert.ok(!inHole(size, fit.diameter, r, c));
        assert.ok(!inHole(size, fit.diameter, r, size - 1 - c));
        assert.ok(!inHole(size, fit.diameter, size - 1 - r, c));
      }
  }
});

// ── Colours ───────────────────────────────────────────────────────────────────

test('the code is always Midnight on a light ground, with strong contrast', () => {
  assert.ok(qrColoursOk(QR_COLOURS.midnight, QR_COLOURS.white));
  assert.ok(qrColoursOk(QR_COLOURS.midnight, QR_COLOURS.linen));
  assert.ok(contrastRatio(QR_COLOURS.midnight, QR_COLOURS.linen) >= 7);
  // Never inverted, never faded.
  assert.equal(qrColoursOk(QR_COLOURS.linen, QR_COLOURS.midnight), false);
  assert.equal(qrColoursOk('#9AA5B1', '#FFFFFF'), false);
});

// ── Sizes ─────────────────────────────────────────────────────────────────────

test('every placement has a sensible size, quiet zone and short tag', () => {
  const mediums = new Set<string>();
  for (const id of PLACEMENT_IDS) {
    const p = PLACEMENTS[id];
    assert.equal(p.id, id);
    assert.ok(p.minInches >= 0.8, `${id} below 0.8 inch`);
    assert.ok(p.minInches <= p.maxInches && p.printInches >= p.maxInches);
    assert.ok(p.quietZone >= 4, `${id} quiet zone under the standard 4`);
    assert.match(p.medium, /^[a-z-]{2,12}$/);
    assert.ok(!mediums.has(p.medium));
    mediums.add(p.medium);
  }
  assert.equal(sizeText(PLACEMENTS.tag), 'About 0.8 to 1 inch (2 to 2.5 cm)');
  assert.equal(sizeText(PLACEMENTS.sign), 'About 2.5 to 3 inches (6.5 to 7.5 cm)');
  assert.equal(toCm(1.5), 4);
  // A very dense code is printed bigger rather than too fine.
  assert.ok(moduleMm(printInchesFor(PLACEMENTS.tag, 101), 101) >= MIN_MODULE_MM);
});

// ── The SVG ───────────────────────────────────────────────────────────────────

test('the SVG escapes the label and sizes itself for print', () => {
  const qr = encodeQr('https://mas-monograms.com/');
  const out = buildQrSvg({ qr, quietZone: 4, label: 'Tom & Jerry <3', widthInches: 1.2 });
  assert.ok(out.svg.includes('Tom &amp; Jerry &lt;3'));
  assert.ok(out.svg.includes('width="1.2in"'));
  assert.ok(out.height > out.width);
  assert.equal(escapeXml(`"'`), '&quot;&apos;');
  const plain = buildQrSvg({ qr, quietZone: 4 });
  assert.equal(plain.height, plain.width);
  assert.ok(!plain.svg.includes('<text'));
});

// ── End to end: every destination x every placement ───────────────────────────

const LINKS = {
  googleReviewUrl: 'https://g.page/r/CabcdEFGhij123/review',
  socialLinks: [
    { platform: 'Facebook', url: 'https://www.facebook.com/masmonograms' },
    { platform: 'Instagram', url: 'https://www.instagram.com/masmonograms/' },
  ],
};
const SEAL = sealSvg({ idp: 'qrseal', cut: 'bold' });

test('every destination and placement makes a code that scans, with and without the seal', () => {
  let withSeal = 0;
  for (const destination of DESTINATION_IDS) {
    for (const placement of PLACEMENT_IDS) {
      for (const seal of [false, true]) {
        const made = makeQr({
          destination,
          placement,
          links: LINKS,
          seal,
          sealSvg: SEAL,
          label: QR_COPY.labels[destination],
          campaign: 'fall fair',
          now: NOW,
        });
        assert.ok(made, `${destination}/${placement}`);
        assert.equal(made.matrix.errorCorrection, 'H');
        assert.ok(made.svg.startsWith('<svg') && made.svg.endsWith('</svg>'));
        assert.ok(made.printSvg.includes(`in"`));
        assert.ok(made.pngWidth >= 1200);
        assert.ok(made.svg.includes(escapeXml(QR_COPY.labels[destination])));
        if (destination in { home: 1, quote: 1, gallery: 1, threads: 1, clearance: 1 }) {
          assert.match(
            made.link,
            new RegExp(`utm_medium=${PLACEMENTS[placement].medium}&utm_campaign=fall-fair$`),
          );
        }
        assert.equal(made.sealShown, seal && made.fit.fits);
        if (made.sealShown) {
          withSeal++;
          assert.ok(made.svg.includes('<circle'));
        }
        // Decode what was drawn, seal hole and busy seal art included.
        const { data, w } = rasterise(made.matrix, PLACEMENTS[placement].quietZone, {
          hole: made.sealShown ? made.fit.diameter : 0,
          sealDiameter: made.sealShown ? made.fit.sealDiameter : 0,
        });
        const got = jsQR(data, w, w);
        assert.ok(got, `${destination}/${placement}/seal=${seal} did not scan`);
        assert.equal(got.data, made.link);
      }
    }
  }
  assert.ok(withSeal > 0, 'the seal was never shown');
});

test('a destination she has not set up yet makes no code', () => {
  assert.equal(makeQr({ destination: 'facebook', placement: 'card' }), null);
  assert.equal(makeQr({ destination: 'review', placement: 'card', links: {} }), null);
});

// ── The words ─────────────────────────────────────────────────────────────────

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

test('every destination and placement has words', () => {
  for (const id of DESTINATION_IDS) {
    assert.ok(QR_COPY.destinations[id]?.title, id);
    assert.ok(QR_COPY.labels[id], id);
  }
  for (const id of PLACEMENT_IDS) assert.ok(QR_COPY.placements[id]?.title, id);
});

test('the QR tool says nothing Mary Ann should not have to read', () => {
  const all = strings(QR_COPY);
  assert.ok(all.length > 50);
  for (const s of all) {
    for (const j of JARGON as Array<{ re: RegExp; why: string }>) {
      assert.ok(!j.re.test(s), `${j.why}: "${s}"`);
    }
  }
  // "QR code" is explained once, in plain words.
  assert.match(QR_COPY.intro, /small square picture people scan with a phone camera/);
});

// ── The print page ────────────────────────────────────────────────────────────

test('the print page holds the code at its print size and hides the note on paper', () => {
  const made = makeQr({ destination: 'home', placement: 'sign', now: NOW })!;
  const html = printPageHtml({
    svg: made.printSvg,
    title: 'QR <code>',
    note: 'Print at 100% & check',
  });
  assert.ok(html.includes(made.printSvg));
  assert.match(made.printSvg, /width="[\d.]+in"/);
  assert.ok(html.includes('QR &lt;code&gt;'));
  assert.ok(html.includes('Print at 100% &amp; check'));
  assert.match(html, /@media print\{\.note\{display:none\}/);
  assert.ok(html.includes('print()'));
});

// ── Sizes in words ────────────────────────────────────────────────────────────

test('sizes say "1 inch" and "2 inches", never "1 inches"', () => {
  assert.equal(inchUnit(1), 'inch');
  assert.equal(inchUnit(0.8), 'inch');
  assert.equal(inchUnit(1.0001), 'inch');
  assert.equal(inchUnit(1.5), 'inches');
  assert.equal(inchUnit(4), 'inches');
  assert.equal(inchesText(1), '1 inch (2.5 cm)');
  assert.equal(inchesText(1.5), '1.5 inches (4 cm)');
  assert.equal(inchesText(4), '4 inches (10 cm)');
  assert.equal(sizeText({ minInches: 0.8, maxInches: 1 }), 'About 0.8 to 1 inch (2 to 2.5 cm)');
  assert.equal(sizeText({ minInches: 1, maxInches: 1.5 }), 'About 1 to 1.5 inches (2.5 to 4 cm)');
  // Every size line the tool can show, for every placement and a dense code.
  for (const id of PLACEMENT_IDS) {
    for (const modules of [21, 53, 101]) {
      const inches = printInchesFor(PLACEMENTS[id], modules);
      const line = inchesText(inches);
      assert.match(line, inches > 1 ? / inches \(/ : / inch \(/, line);
      assert.doesNotMatch(line, /\b1 inches/, line);
    }
    assert.doesNotMatch(sizeText(PLACEMENTS[id]), /\b1 inches/);
  }
  // The copy never hard-codes a unit next to a number placeholder.
  for (const s of strings(QR_COPY)) assert.doesNotMatch(s, /\}\s*inch/, s);
});

// ── The Google review link ────────────────────────────────────────────────────

test('the review help matches Google and names a guide that exists', () => {
  // Google Business Profile Help, answer 16816815 (checked 2026-10-05):
  // Read reviews > Get more reviews > Copy.
  assert.match(QR_COPY.review.how, /Read reviews, then Get more reviews, then Copy/);
  assert.doesNotMatch(QR_COPY.review.how, /Ask for reviews/);
  const guide = guideById(REVIEW_GUIDE_ID);
  assert.ok(guide, `no handbook guide "${REVIEW_GUIDE_ID}"`);
  assert.match(QR_COPY.review.guideIntro, /\{guide\}/);
});
